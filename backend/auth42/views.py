from django.shortcuts import redirect
from urllib.parse import urlencode

# Pour les return en http et json.
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect, JsonResponse

# Importation de settings pour avoir acces au variable de .env
from django.conf import settings

# Appel HTTP POST pour remplacer le code par un token
import requests

# Importation des class
from .models import FtUser, WhitelistUser, Profil, Project, Comment

import time
import json

# Pour le CSRF
from django.views.decorators.csrf import csrf_exempt


# ——— INTERNE ————————————————————————————————————————————————————————————————————————————————————————————— #
# (helpers, pas des vues appelees directement par une URL)

# Verifie si un tuteur est connecte (session valide)
def is_logged_in(request: HttpRequest) -> bool:
	return bool(request.session.get('ft_user_pk'))

# Recupere un token applicatif (grant client_credentials)
def get_app_token() -> str | None:
		# requete POST
		response: requests.Response = requests.post('https://api.intra.42.fr/oauth/token', data={
			'grant_type': 'client_credentials',
			'client_id': settings.FT_CLIENT_ID,
			'client_secret': settings.FT_CLIENT_SECRET,
		})
		token: str | None = response.json().get('access_token')
		if not token:
			return None
		return token

# Synchronise un piscineux (+ ses projets C) depuis l'API 42 vers la database
def sync_one_profil(login: str, token: str) -> Profil | None:

	# recuperation des donnee de l'api
	response: requests.Response = requests.get('https://api.intra.42.fr/v2/users/' + f'{login}', headers={
		'Authorization': f'Bearer {token}',
	})
	if response.status_code != 200:
		return None
	data: dict = response.json()

	resultat: dict | None = None
	for item in data.get('cursus_users', []):
		if item.get('cursus_id') == 9:
			resultat = item
			break

	if not resultat:
		return None


	# creation du user avec ces donnees
	profil, created = Profil.objects.update_or_create(
		profil_id=data.get('id'),
		defaults={
			'profil_login': data.get('login'),
			'profil_email': data.get('email'),
			'profil_first_name': data.get('first_name'),
			'profil_last_name': data.get('last_name'),
			'profil_image_url': data.get('image', {}).get('link') or '', # D'autre images possibles
			'profil_pool_year': data.get('pool_year'),
			'profil_pool_month': data.get('pool_month'),
			'profil_lvl': resultat.get('level'),
			'profil_location': data.get('location') or '',
			'profil_correction_point': data.get('correction_point'),
		},
	)

	for item in data.get('projects_users', []):
		if 9 in item.get('cursus_ids', []):
			Project.objects.update_or_create(
				profil=profil,
				slug=item.get('project', {}).get('slug'),
				defaults={
					'name': item.get('project', {}).get('name'),
					'valid': bool(item.get('validated?')), # securite pour projet en cour de validation
					'note': item.get('final_mark'),
				},
			)


	return profil

# Liste les logins de tous les piscineux de la session en cours
def list_profil_login() -> list[str]:
	token: str | None = get_app_token()
	if not token:
		return []
	lst_login: list[str] = []
	page: int = 1
	while True:
		response: requests.Response = requests.get('https://api.intra.42.fr/v2/users', params={
			'filter[primary_campus_id]': 31,
			'filter[pool_year]': 2026,
			'filter[pool_month]': 'september',
			'page[size]': 100,
			'page[number]': page,
		}, headers={'Authorization': f'Bearer {token}'})
		elements: list[dict] = response.json()
		if not elements:
			break
		for item in elements:
			lst_login.append(item.get('login'))
		page += 1

	return lst_login


# ——— APPEL API ————————————————————————————————————————————————————————————————————————————————————————————— #
# Vues qui interagissent avec l'API de 42

# Redirige vers la page d'autorisation OAuth de 42
def login(request: HttpRequest) -> HttpResponseRedirect:
	params: dict = {
		'client_id': settings.FT_CLIENT_ID,
		'redirect_uri': settings.FT_REDIRECT_URI,
		'response_type': 'code',
		'scope': 'public',
	}
	url: str = 'https://api.intra.42.fr/oauth/authorize?' + urlencode(params)
	return redirect(url)

# Callback OAuth : echange le code, verifie la whitelist, connecte le tuteur
def callback(request: HttpRequest) -> HttpResponse | JsonResponse | HttpResponseRedirect:
	code: str | None = request.GET.get('code')
	if not code:
		error: str | None = request.GET.get('error')
		return HttpResponse(f"Error : {error}")

	# requete POST
	response: requests.Response = requests.post('https://api.intra.42.fr/oauth/token', data={
		'grant_type': 'authorization_code',
		'client_id': settings.FT_CLIENT_ID,
		'client_secret': settings.FT_CLIENT_SECRET,
		'code': code,
		'redirect_uri': settings.FT_REDIRECT_URI,
	})

	#Pars de json en python
	data: dict = response.json()
	token: str | None = data.get('access_token')
	if not token:
		return JsonResponse({'error': 'token exchange failed'}, status=400)

	# recuperation des donnee de l'api
	response = requests.get('https://api.intra.42.fr/v2/me', headers={
		'Authorization': f'Bearer {token}',
	})
	data = response.json()

	# Check si fait partie de la whitelist
	if not WhitelistUser.objects.filter(wl_login=data.get('login')).exists():
		return JsonResponse({'error': 'not authorized'}, status=403)


	# creation du user avec ces donnees
	ft_user, created = FtUser.objects.update_or_create(
		user_id=data.get('id'),
		defaults={
			'user_login': data.get('login'),
			'user_email': data.get('email'),
			'user_first_name': data.get('first_name'),
			'user_last_name': data.get('last_name'),
			'user_image_url': data.get('image', {}).get('link') or '', # D'autre images possibles
			'user_kind': data.get('kind'),
			'user_location': data.get('location') or '',
		},
	)

	request.session['ft_user_pk'] = ft_user.pk

	return redirect(settings.FRONT_URL)

# Debug : profil brut d'un login sur l'API 42, sans sauvegarde en base
def debug_profil(request: HttpRequest, login: str) -> JsonResponse:
	if not is_logged_in(request):
		return JsonResponse({'error': 'not authenticated'}, status=401)
	token: str | None = get_app_token()
	if not token:
		return JsonResponse({'error': 'could not get app token'}, status=502)
	response: requests.Response = requests.get(f'https://api.intra.42.fr/v2/users/{login}', headers={
		'Authorization': f'Bearer {token}',
	})
	if response.status_code != 200:
		return JsonResponse({'error': 'not found'}, status=404)
	return JsonResponse(response.json(), json_dumps_params={'indent': 2})

# Vue : synchronise un seul piscineux par son login
def sync_profil(request: HttpRequest, login: str) -> JsonResponse:
	if not is_logged_in(request):
		return JsonResponse({'error': 'not authenticated'}, status=401)
	token: str | None = get_app_token()
	if not token:
		return JsonResponse({'error': 'could not get app token'}, status=502)
	profil: Profil | None = sync_one_profil(login, token)
	if not profil:
		return JsonResponse({'error': 'profil not found'}, status=404)
	return JsonResponse({'synced': profil.profil_login})

# Vue : synchronise tous les piscineux, affiche une page HTML de resultat
def sync_all_profils(request: HttpRequest) -> HttpResponse:
	if not is_logged_in(request):
		return JsonResponse({'error': 'not authenticated'}, status=401)
	lst_login: list[str] = list_profil_login()
	html: str = ""
	token: str | None = get_app_token()
	if not token:
		return HttpResponse("Erreur : impossible d'obtenir un token applicatif")
	for login in lst_login:
		profil: Profil | None = sync_one_profil(login, token)
		time.sleep(0.5) # Pause pour pas declancher le rate limit de l'api
		if not profil:
			continue
		sous_liste: str = ""
		for key, value in profil.to_dict().items():
			if key == 'projects':
				continue
			sous_liste += f"<li>{key}: {value}</li>"

		sous_liste_projets: str = ""
		for projet in Project.objects.filter(profil=profil):
			sous_liste_projets += f"<li>{projet.name} ({projet.slug}) - valid: {projet.valid} - note: {projet.note}</li>"

		ligne: str = f"<li><b>{profil.profil_login}</b><ul>{sous_liste}<li><b>Projets</b><ul>{sous_liste_projets}</ul></li></ul></li>"
		html = html + ligne
	html = f"<ul>{html}</ul>"
	return HttpResponse(html)


# ——— RECOIT DU FRONT ————————————————————————————————————————————————————————————————————————————————————————————— #
# Vues qui acceptent des donnees envoyees par le front

# Cree un commentaire tuteur sur un piscineux (POST)
@csrf_exempt # Flag pour contrer la securite CSRF
def add_comment(request: HttpRequest, login: str) -> JsonResponse:
	if not is_logged_in(request):
		return JsonResponse({'authenticated': False}, status=401)

	if not request.method == 'POST':
		return JsonResponse({'error': 'method not allowed'}, status=405)

	# Recuperation du json du front et le commentaire
	data: dict = json.loads(request.body)
	content: str | None = data.get('content')
	if not content:
		return JsonResponse({'error': 'content required'}, status=400)

	# Recuperation des information
	profil: Profil | None = Profil.objects.filter(profil_login=login).first()
	if not profil:
		return JsonResponse({'error': 'profil not found'}, status=404)

	# creation du commentaire dans la base de donnee
	Comment.objects.create(
		profil = profil,
		author = FtUser.objects.get(pk=request.session.get('ft_user_pk')),
		content = content,
	)
 
	return JsonResponse({'message': 'Comment created.'})

# ——— ENVOI AU FRONT ————————————————————————————————————————————————————————————————————————————————————————————— #
# Vues qui renvoient des donnees au front (lecture seule)

# Infos du tuteur actuellement connecte
def me(request: HttpRequest) -> JsonResponse:
	if not is_logged_in(request):
		return JsonResponse({'authenticated': False}, status=401)

	# Recupere le user
	ft_user: FtUser = FtUser.objects.get(pk=request.session.get('ft_user_pk'))

	return JsonResponse({'authenticated': True, 'user_dict': ft_user.to_dict()})

# Vue : renvoie en JSON tous les piscineux + leur progression
def api_profils(request: HttpRequest) -> JsonResponse:
	if not is_logged_in(request):
		return JsonResponse({'authenticated': False}, status=401)

	profils: list[dict] = []
	for profil in Profil.objects.all():
		profils.append(profil.to_dict())
	return JsonResponse({'profils': profils}, json_dumps_params={'indent': 2})

# Vue : renvoie en JSON un seul piscineux + sa progression
def api_profil(request: HttpRequest, login: str) -> JsonResponse:
	if not is_logged_in(request):
		return JsonResponse({'authenticated': False}, status=401)

	profil: Profil | None = Profil.objects.filter(profil_login=login).first()
	if not profil:
		return JsonResponse({'error': 'profil not found'}, status=404)

	return JsonResponse(profil.to_dict(), json_dumps_params={'indent': 2})
