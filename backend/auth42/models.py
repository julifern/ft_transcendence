from django.db import models
from datetime import datetime

# Class par user se connectant au site
class FtUser(models.Model):
	user_id: int 				= models.IntegerField(unique=True) # unique=True: jamais 2 fois le meme utilisateur
	user_login: str 			= models.CharField(max_length=50)
	user_email: str 			= models.EmailField()
	user_first_name: str		= models.CharField(max_length=100)
	user_last_name: str			= models.CharField(max_length=100)
	user_image_url: str			= models.URLField(blank=True) # blank: le champ peut être vide
	user_created_at: datetime	= models.DateTimeField(auto_now_add=True)
	user_updated_at: datetime	= models.DateTimeField(auto_now=True)
	user_kind: str				= models.CharField(max_length=50, default='')
	user_location: str			= models.CharField(max_length=20, blank=True)
	user_followed				= models.ManyToManyField('Profil', blank=True)


	# Surcharge operator<<
	def	__str__(self) -> str:
		return self.user_login

	# Revoi un dict des valeur de la class
	def to_dict(self) -> dict:
		followed: list[str] = []
		for f in self.user_followed.all():
			followed.append(f.profil_login)
		return {
			'id': self.user_id,
			'login': self.user_login,
			'email': self.user_email,
			'first_name': self.user_first_name,
			'last_name': self.user_last_name,
			'image_url': self.user_image_url,
			'kind': self.user_kind,
			'location': self.user_location,
			'followed': followed,
		}

# Class Whitelist
class WhitelistUser(models.Model):
	wl_login: str = models.CharField(max_length=50, unique=True)

	# Surcharge operator<<
	def	__str__(self) -> str:
		return self.wl_login

# Class Picsineux
class Profil(models.Model):
	profil_id: int 						= models.IntegerField(unique=True)
	profil_login: str 					= models.CharField(max_length=50)
	profil_email: str 					= models.EmailField()
	profil_first_name: str 				= models.CharField(max_length=100)
	profil_last_name: str 				= models.CharField(max_length=100)
	profil_image_url: str 				= models.URLField(blank=True)
	profil_pool_year: str 				= models.CharField(max_length=4)
	profil_pool_month: str 				= models.CharField(max_length=20)
	profil_lvl: float | None 			= models.FloatField(null=True)
	profil_location: str				= models.CharField(max_length=20, blank=True)
	profil_correction_point: int | None	= models.IntegerField(null=True)
	profil_is_online: bool 				= models.BooleanField(default=False)

	# soft_skills
	profil_timidity: int | None 		= models.IntegerField(null=True)
	profil_stress: int | None 			= models.IntegerField(null=True)
	profil_peer_help: int | None 		= models.IntegerField(null=True)
	profil_self_research: int | None 	= models.IntegerField(null=True)
	profil_perseverance: int | None 	= models.IntegerField(null=True)

	# presence
	profil_total_hours: float | None 			= models.FloatField(null=True)
	profil_daily_average_hours: float | None	= models.FloatField(null=True)
	profil_morning_hours: float | None 			= models.FloatField(null=True)
	profil_afternoon_hours: float | None 		= models.FloatField(null=True)
	profil_night_hours: float | None 			= models.FloatField(null=True)
	profil_preferred_slot: str 					= models.CharField(max_length=20, blank=True)

	# risk
	profil_risk_score: int | None	= models.IntegerField(null=True)
	profil_risk_level: str 			= models.CharField(max_length=20, blank=True)

	def __str__(self) -> str:
		return self.profil_login

	def to_dict(self) -> dict:
		projects: list[dict] = []
		for p in self.project_set.all():
			projects.append(p.to_dict())
		comments: list[dict] = []
		for c in self.comment_set.all():
			comments.append(c.to_dict())
		return {
			'id': self.profil_id,
			'login': self.profil_login,
			'email': self.profil_email,
			'first_name': self.profil_first_name,
			'last_name': self.profil_last_name,
			'image_url': self.profil_image_url,
			'pool_year': self.profil_pool_year,
			'pool_month': self.profil_pool_month,
			'lvl': self.profil_lvl,
			'location': self.profil_location,
			'is_online': self.profil_is_online,
			'correction_point': self.profil_correction_point,
			'soft_skills': {
				'timidity': self.profil_timidity,
				'stress': self.profil_stress,
				'peer_help': self.profil_peer_help,
				'self_research': self.profil_self_research,
				'perseverance': self.profil_perseverance,
			},
			'presence': {
				'total_hours': self.profil_total_hours,
				'daily_average_hours': self.profil_daily_average_hours,
				'time_slots': {
					'morning_hours': self.profil_morning_hours,
					'afternoon_hours': self.profil_afternoon_hours,
					'night_hours': self.profil_night_hours,
				},
				'preferred_slot': self.profil_preferred_slot,
			},
			'risk_score': self.profil_risk_score,
			'risk_level': self.profil_risk_level,
			'projects': projects,
			'comments': comments,
		}



# Class pour les projets
class Project(models.Model):
	profil: Profil = models.ForeignKey(Profil, on_delete=models.CASCADE)
	name: str = models.CharField(max_length=100)
	slug: str = models.CharField(max_length=100)
	valid: bool = models.BooleanField(default=False)
	note: int | None = models.IntegerField(null=True)

	def to_dict(self) -> dict:
		return {
			'name': self.name,
			'slug': self.slug,
			'valid': self.valid,
			'note': self.note,
		}

# Class pour les commentaires
class Comment(models.Model):
	profil: Profil = models.ForeignKey(Profil, on_delete=models.CASCADE)
	author: FtUser = models.ForeignKey(FtUser, on_delete=models.CASCADE)
	content: str = models.CharField(max_length=200)
	created_at: datetime = models.DateTimeField(auto_now_add=True)

	def to_dict(self) -> dict:
		return {
			'author': self.author.user_login,
			'content': self.content,
			'created_at': self.created_at,
		}
