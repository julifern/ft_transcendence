import calendar
from datetime import date, datetime, timezone
from typing import Any

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

# Calcule l'index du projet solo attendu (exclut Vendredi d'exam et Weekend de rush)
def get_expected_project_index(start_date: date) -> int:
	today: date = date.today()
	if today < start_date:
		return 0

	solo_days_elapsed: int = 0
	current_day: date = start_date

	while current_day <= today:
		# 0 = Lundi, 1 = Mardi, 2 = Mercredi, 3 = Jeudi (jours de Days solo)
		# 4 = Vendredi (Exam), 5 = Samedi (Rush), 6 = Dimanche (Rush)
		if current_day.weekday() < 4:
			solo_days_elapsed += 1
		current_day = current_day.fromordinal(current_day.toordinal() + 1)

	# L'index 0 correspond au premier jour (Shell00)
	expected_idx: int = max(0, solo_days_elapsed - 1)
	return min(expected_idx, len(PROJECT_SEQUENCE) - 1)

# Calcule les heures depuis la derniere activite
def compute_last_push_hours(profil: Any) -> int:
	projects = profil.project_set.all()
	now: datetime = datetime.now(timezone.utc)
	latest_dt: datetime | None = None

	# 1. Lecture en base si un champ DateTime existe sur Project
	for p in projects:
		dt = getattr(p, 'updated_at', None) or getattr(p, 'marked_at', None)
		if dt:
			# Securite offset-naive vs offset-aware pour Django
			if dt.tzinfo is None:
				dt = dt.replace(tzinfo=timezone.utc)
			if latest_dt is None or dt > latest_dt:
				latest_dt = dt

	if latest_dt:
		delta = now - latest_dt
		return max(0, int(delta.total_seconds() // 3600))

	# 2. Secours : estimation basee sur la connexion et le statut
	if profil.profil_is_online:
		return 1
	if projects.filter(status='in_progress').exists():
		return 6
	return 24


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

# Calcule l'historique d'XP de la semaine pour le graphique front
def compute_xp_history(profil: Any) -> list[dict]:
	current_lvl: float = float(profil.profil_lvl or 0.0)
	days: list[str] = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
	history: list[dict] = []
	step: float = current_lvl / max(1, len(days))

	for i, day in enumerate(days):
		student_xp: float = round(step * (i + 1), 2)
		promo_avg: float = round(0.35 * (i + 1), 2)
		history.append({
			'day': day,
			'xp': student_xp,
			'average': promo_avg,
		})

	return history

# Recupere le login du premier tuteur qui suit cet etudiant via la ManyToMany
def get_assigned_tutor(profil: Any) -> str | None:
	follower = profil.ftuser_set.first()
	return follower.user_login if follower else None

# Calcule le score de risque (0 a 100) et le niveau
def compute_risk_score(profil: Any, progress: dict) -> tuple[int, str]:
	score: int = 0

	# 1. Retard progression (40 pts max)
	gap: int = progress.get('days_gap', 0)
	if gap >= 4:
		score += 40
	elif gap >= 2:
		score += 20
	elif gap == 1:
		score += 10

	# 2. Resultats aux examens (30 pts max)
	exams: list = [p for p in profil.project_set.all() if p.get_category() == 'Exams']
	if exams:
		last_exam = exams[-1]
		note: int = last_exam.note or 0
		if note == 0:
			score += 30
		elif note < 50:
			score += 20
		elif note < 75:
			score += 5

	# 3. Inactivite (20 pts max)
	hours: int = progress.get('last_push_hours', 0)
	if hours >= 48:
		score += 20
	elif hours >= 24:
		score += 10

	# 4. Points de correction (10 pts max)
	pts: int = profil.profil_correction_point or 0
	if pts == 0:
		score += 10
	elif pts == 1:
		score += 5

	score = min(100, score)

	# Determination du label
	risk_level: str = 'ok'
	if score >= 70:
		risk_level = 'critical'
	elif score >= 40:
		risk_level = 'warning'

	return score, risk_level