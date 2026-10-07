import calendar
from datetime import date, datetime, timezone, timedelta
from typing import Any
from django.db.models import Avg

# ——— CONFIGURATION DE LA PROGRESSION —————————————————————————————————————————————————————————————————————— #

# Sequence ordonnee officielle des projets solo
PROJECT_SEQUENCE: list[str] = [
	'c-piscine-shell-00',
	'c-piscine-shell-01',
	'c-piscine-c-00',
	'c-piscine-c-01',
	'c-piscine-c-02',
	'c-piscine-c-03',
	'c-piscine-c-04',
	'c-piscine-c-05',
	'c-piscine-c-06',
	'c-piscine-c-07',
	'c-piscine-c-08',
	'c-piscine-c-09',
	'c-piscine-c-10',
	'c-piscine-c-11',
	'c-piscine-c-12',
	'c-piscine-c-13',
]

# Convertit un slug technique en nom lisible pour le front
def format_project_name(slug: str) -> str:
	if 'shell' in slug:
		num: str = slug.split('-')[-1]
		return f"Shell{num}"
	elif 'c-piscine-c-' in slug:
		num: str = slug.split('-')[-1]
		return f"C{num}"
	return slug


# ——— CALCULS DE DATES & HEURES ———————————————————————————————————————————————————————————————————————————— #

# Trouve la date de debut : en base en priorite, calcul de secours sinon
def get_piscine_start_date(profil: Any) -> date:
	# Verification en base de donnees si la colonne existe et est remplie
	begin_at = getattr(profil, 'profil_pool_begin_at', None)
	if begin_at:
		return begin_at.date() if hasattr(begin_at, 'date') else begin_at

	# Secours (fallback) : calcul automatique du premier lundi du mois
	year: int = int(profil.profil_pool_year) if profil.profil_pool_year else 2026
	month_name: str = (profil.profil_pool_month or 'september').capitalize()
	try:
		month: int = list(calendar.month_name).index(month_name)
	except ValueError:
		month: int = 9

	cal: calendar.Calendar = calendar.Calendar(firstweekday=calendar.MONDAY)
	for d, weekday in cal.itermonthdays2(year, month):
		if d != 0 and weekday == calendar.MONDAY:
			return date(year, month, d)

	return date(year, month, 1)

# Calcule l'index du projet solo attendu selon une courbe de progression realiste
def get_expected_project_index(start_date: date) -> int:
	today: date = date.today()
	if today < start_date:
		return 0

	solo_days_elapsed: int = 0
	current_day: date = start_date

	while current_day <= today:
		# 0 = Lundi, 1 = Mardi, 2 = Mercredi, 3 = Jeudi (jours de Days solo)
		if current_day.weekday() < 4:
			solo_days_elapsed += 1
		current_day = current_day.fromordinal(current_day.toordinal() + 1)

	# Courbe d'avancement cible pour un etudiant "moyen".
	# A partir du C02, on donne 2 jours par projet.
	EXPECTED_PACE = [
		0,  # Jour 0 (securite)
		0,  # Jour 1 : Shell00
		1,  # Jour 2 : Shell01
		2,  # Jour 3 : C00
		3,  # Jour 4 : C01
		4,  # Jour 5 : C02
		4,  # Jour 6 : C02 (projet plus long)
		5,  # Jour 7 : C03
		5,  # Jour 8 : C03
		6,  # Jour 9 : C04
		6,  # Jour 10 : C04
		7,  # Jour 11 : C05
		7,  # Jour 12 : C05
		8,  # Jour 13 : C06
		8,  # Jour 14 : C06
		9,  # Jour 15 : C07
		10  # Jour 16 : C08 (fin de la piscine)
	]

	# On recupere l'index attendu en fonction du nombre de jours ecoules
	pace_index: int = min(solo_days_elapsed, len(EXPECTED_PACE) - 1)
	return EXPECTED_PACE[pace_index]

# ——— CALCULS METIER (PROGRESSION, RISQUE, PRESENCE, XP) ———————————————————————————————————————————————————— #

# Calcule l'avancement et le retard d'un piscineux sur les Days solo
def compute_student_progress(profil: Any) -> dict:
	projects = profil.project_set.all()

	# Index du projet attendu dynamiquement
	start_date: date = get_piscine_start_date(profil)
	expected_idx: int = get_expected_project_index(start_date)
	expected_slug: str = PROJECT_SEQUENCE[expected_idx]

	# Dernier projet valide et projet le plus avance
	last_validated_idx: int = -1
	max_started_idx: int = -1

	for p in projects:
		if p.slug not in PROJECT_SEQUENCE:
			continue
		idx: int = PROJECT_SEQUENCE.index(p.slug)

		# Validation basee uniquement sur le retour officiel de l'Intra
		if p.valid:
			if idx > last_validated_idx:
				last_validated_idx = idx

		# Projet en cours ou commence
		if idx > max_started_idx:
			max_started_idx = idx

	# Retard estime
	days_gap: int = max(0, expected_idx - max(0, last_validated_idx))
	last_val_name: str = format_project_name(PROJECT_SEQUENCE[last_validated_idx]) if last_validated_idx >= 0 else "None"
	working_name: str = format_project_name(PROJECT_SEQUENCE[max_started_idx]) if max_started_idx >= 0 else "Shell00"

	return {
		'last_validated_project': last_val_name,
		'expected_project': format_project_name(expected_slug),
		'actual_working_project': working_name,
		'days_gap': days_gap,
		'last_push_hours': compute_last_push_hours(profil),
	}

# Calcule les metriques de presence (base si dispo, secours sinon)
def compute_presence_metrics(profil: Any) -> dict:
	# 1. Lecture en base si deja synchronise
	if profil.profil_total_hours is not None:
		return {
			'total_hours': profil.profil_total_hours,
			'daily_average_hours': profil.profil_daily_average_hours,
			'time_slots': {
				'morning_hours': profil.profil_morning_hours,
				'afternoon_hours': profil.profil_afternoon_hours,
				'night_hours': profil.profil_night_hours,
			},
			'preferred_slot': profil.profil_preferred_slot,
		}

	# 2. Secours : estimation realiste selon le niveau et l'activite
	lvl: float = float(profil.profil_lvl or 0.0)
	total: float = round(max(35.0, lvl * 38.0 + (15.0 if profil.profil_is_online else 0.0)), 1)
	daily: float = round(total / 14.0, 1)

	morning: float = round(total * 0.20, 1)
	afternoon: float = round(total * 0.55, 1)
	night: float = round(total * 0.25, 1)

	slots: dict[str, float] = {'morning': morning, 'afternoon': afternoon, 'night': night}
	preferred: str = max(slots, key=slots.get)

	return {
		'total_hours': total,
		'daily_average_hours': daily,
		'time_slots': {
			'morning_hours': morning,
			'afternoon_hours': afternoon,
			'night_hours': night,
		},
		'preferred_slot': preferred,
	}

# Calcule l'historique du niveau de l'eleve et la moyenne du groupe decoupe en 4 semaines
def compute_xp_history(profil) -> list[list[dict]]:
	# Import local pour eviter l'import circulaire
	from auth42.models import DailyXp

	# Initialisation stricte des 4 semaines attendues par le front
	weeks: list[list[dict]] = [[], [], [], []]

	# Lecture des releves du profil tries par date
	records = DailyXp.objects.filter(profil=profil).order_by('date')
	if not records.exists():
		return weeks

	# Calcul d'xp moyenne de la piscine
	daily_averages = dict(
		DailyXp.objects.values('date')
		.annotate(avg_level=Avg('level'))
		.values_list('date', 'avg_level')
	)

	# Recuperation de la date de debut pour ventiler par semaine
	start_date = get_piscine_start_date(profil)

	# Repartition des jours dans leur semaine respective
	for record in records:
		raw_avg = daily_averages.get(record.date, 0.0)
		pool_avg = round(raw_avg or 0.0, 2)
		
		# Calcul de l'index de la semaine
		days_diff = (record.date - start_date).days
		week_idx = max(0, min(3, days_diff // 7))

		weeks[week_idx].append({
			"day": record.date.strftime("%a %d"),
			"xp": round(record.level, 2),
			"average": pool_avg,
		})

	return weeks

# Recupere le login du premier tuteur qui suit cet etudiant via la ManyToMany
def get_assigned_tutor(profil: Any) -> str | None:
    followers = list(profil.ftuser_set.all())
    return followers[0].user_login if len(followers) > 0 else None

# Calcule les heures depuis la derniere activite sans casser le cache prefetch
def compute_last_push_hours(profil: Any) -> int:
	projects = profil.project_set.all()
	now: datetime = datetime.now(timezone.utc)
	latest_dt: datetime | None = None

	for p in projects:
		dt = getattr(p, 'updated_at', None) or getattr(p, 'marked_at', None)
		if dt:
			if dt.tzinfo is None:
				dt = dt.replace(tzinfo=timezone.utc)
			if latest_dt is None or dt > latest_dt:
				latest_dt = dt

	if latest_dt:
		delta = now - latest_dt
		return max(0, int(delta.total_seconds() // 3600))

	# Secours : analyse en memoire Python (0 requete SQL)
	if profil.profil_is_online:
		return 1
	if any(p.status == 'in_progress' for p in projects):
		return 6
	return 24


# Calcule le score de risque (0 a 100) avec deux modes : Live ou Bilan (post-piscine)
def compute_risk_score(profil: Any, progress: dict) -> tuple[int, str]:
	score: int = 0
	start_date = get_piscine_start_date(profil)
	days_since_start = (date.today() - start_date).days
	is_finished = days_since_start > 25

	if is_finished:
		# --- MODE BILAN ARCHIVE (Post-Piscine) ---
		
		# 1. Projets (Days) : Retard sur l'objectif de fin de mois (C08 / gap = 0) (40 pts max)
		gap: int = progress.get('days_gap', 0)
		if gap >= 5: # Bloqué vers le C03
			score += 40
		elif gap >= 3: # Bloqué vers le C05
			score += 20
			
		# 2. Examens : Note du tout dernier examen passe (30 pts max)
		graded_exams = sorted(
			[p for p in profil.project_set.all() if p.get_category() == 'Exams' and p.note is not None],
			key=lambda p: p.slug
		)
		if graded_exams:
			last_exam = graded_exams[-1]
			note: int = int(last_exam.note)
			if note < 30:
				score += 30
			elif note < 50:
				score += 15
		else:
			score += 70 # Grosse penalite si aucun examen n'a ete passe

		# 3. Rushs : Participation uniquement (15 pts max)
		rush_count = len([p for p in profil.project_set.all() if p.get_category() == 'Rushs'])
		if rush_count == 0:
			score += 15 # N'a participe a aucun Rush
		elif rush_count == 1:
			score += 5  # N'en a fait qu'un seul

		# 4. Presence globale (15 pts max)
		total_hours = profil.profil_total_hours or 0.0
		if total_hours < 120.0: # Moins de 4h30 par jour en moyenne
			score += 15
		elif total_hours < 160.0:
			score += 5

	else:
		# --- MODE PISCINE ACTIVE (Live) ---
		
		# 1. Retard progression immediate (30 pts max)
		gap: int = progress.get('days_gap', 0)
		if gap >= 4:
			score += 35
		elif gap >= 2:
			score += 20
		elif gap == 1:
			score += 5

		# 2. Resultats aux examens (30 pts max)
		graded_exams = sorted(
			[p for p in profil.project_set.all() if p.get_category() == 'Exams' and p.note is not None],
			key=lambda p: p.slug
		)
		if graded_exams:
			last_exam = graded_exams[-1]
			note: int = int(last_exam.note)
			if note == 0:
				score += 25
			elif note < 30:
				score += 15
			elif note < 50:
				score += 5

		# 3. Inactivite (20 pts max)
		hours: int = progress.get('last_push_hours', 0)
		if hours >= 48:
			score += 20
		elif hours >= 24:
			score += 10

		# 4. Rushs : Inscription et Participation (10 pts max)
		rush_count = len([p for p in profil.project_set.all() if p.get_category() == 'Rushs'])
		# Si on est en Semaine 2 (après le 1er week-end) et 0 rush en base
		if days_since_start >= 7 and rush_count == 0:
			score += 10
		# Si on est en Semaine 3 ou 4 (après le 2e week-end) et 1 seul rush (ou 0)
		elif days_since_start >= 14 and rush_count <= 1:
			score += 10

		# 5. Points de correction (10 pts max)
		pts: int = profil.profil_correction_point if profil.profil_correction_point is not None else 5
		if pts <= 0:
			score += 10
		elif pts == 1:
			score += 5

	# --- LABEL COMMUN ---
	score = min(100, score)
	risk_level: str = 'ok'
	
	if score >= 70:
		risk_level = 'critical'
	elif score >= 40:
		risk_level = 'warning'

	return score, risk_level

# Calcule le rang d'un etudiant au sein de sa promotion selon son niveau d'XP
def compute_student_rank(profil: Any) -> int:
	if profil.profil_lvl is None:
		return 0

	# profil.__class__ permet de requeter Profil sans importer le modele au sommet du fichier
	ProfilModel = profil.__class__
	qs = ProfilModel.objects.all()

	if profil.profil_pool_year and profil.profil_pool_month:
		qs = qs.filter(
			profil_pool_year=profil.profil_pool_year,
			profil_pool_month=profil.profil_pool_month,
		)

	# Nombre d'etudiants avec un niveau strictement superieur
	higher_students: int = qs.filter(profil_lvl__gt=profil.profil_lvl).count()
	return higher_students + 1