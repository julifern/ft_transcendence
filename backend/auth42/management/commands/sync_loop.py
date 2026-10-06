import time
from datetime import datetime, date, timedelta
from django.core.management.base import BaseCommand
from django.db import connection
from django.db.models import Avg
from auth42.views import sync_all_profils
from auth42.models import Profil, DailyXp, SyncConfig
from auth42.services.metrics import get_piscine_start_date

# Selection de la piscine (septembre 2026 par défaut)
def get_target_pool_config() -> tuple[str, str]:
	config = SyncConfig.objects.first()
	if config:
		return str(config.pool_year), str(config.pool_month).lower()
	return "2026", "september"

# Determine si la piscine est actuellement en cours
def is_piscine_active() -> bool:
	today = date.today()
	pool_year, pool_month = get_target_pool_config()
	dummy_profil = Profil(profil_pool_year=pool_year, profil_pool_month=pool_month)
	start_date = get_piscine_start_date(dummy_profil)
	end_date = start_date + timedelta(days=25)
	return start_date <= today <= end_date

# Enregistre le niveau du jour pour chaque etudiant et calcule la moyenne
def record_daily_xp() -> tuple[int, float]:
	today = date.today()
	updated_count = 0
	pool_year, pool_month = get_target_pool_config()

	active_profiles = Profil.objects.filter(
		profil_pool_year=pool_year,
		profil_pool_month=pool_month,
	)

	for profil in active_profiles:
		if profil.profil_lvl is not None:
			DailyXp.objects.update_or_create(
				profil=profil,
				date=today,
				defaults={'level': profil.profil_lvl}
			)
			updated_count += 1

	# Calcul de la moyenne
	result = DailyXp.objects.filter(
		profil__in=active_profiles,
		date=today
	).aggregate(Avg('level'))
	avg_level = round(result['level__avg'] or 0.0, 2)

	return updated_count, avg_level

class Command(BaseCommand):
	help = "Sync 42 profiles and record daily XP levels"

	def handle(self, *args, **options):
		while True:
			try:
				# Bouclier anti-requetes inutiles
				if not is_piscine_active():
					timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
					self.stdout.write(self.style.WARNING(f"[{timestamp}] Outside of pool season. 24-hour standby."))
					connection.close()
					time.sleep(86400) # Pause d'une journée au lieu de 5 minutes
					continue

				# Mise a jour des profils depuis l'API 42 (Uniquement si actif)
				synced_logins: list[str] = sync_all_profils()
				timestamp: str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
				message: str = f"[{timestamp}] {len(synced_logins)} profiles synced."

				if len(synced_logins) == 0:
					self.stdout.write(self.style.WARNING(message))
				else:
					self.stdout.write(self.style.SUCCESS(message))

				# Sauvegarde de l'xp quotidienne en base
				xp_count, avg_level = record_daily_xp()
				self.stdout.write(self.style.SUCCESS(
					f"[{timestamp}] {xp_count} DailyXp records saved for {date.today()} (pool avg: lvl {avg_level})."
				))

			except Exception as e:
				timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
				self.stdout.write(self.style.ERROR(f"[{timestamp}] Sync error: {e}"))

			finally:
				# Fermeture propre de la session SQL avant la pause
				connection.close()

			# Pause de 5 minutes en periode de piscine
			time.sleep(300)