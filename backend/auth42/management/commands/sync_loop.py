import time
from datetime import datetime, date
from django.core.management.base import BaseCommand
from django.db import connection
from django.db.models import Avg
from auth42.views import sync_all_profils
from auth42.models import Profil, DailyXp

# Enregistre le niveau du jour pour chaque etudiant et calcule la moyenne
def record_daily_xp() -> tuple[int, float]:
	today = date.today()
	updated_count = 0

	for profil in Profil.objects.all():
		if profil.profil_lvl is not None:
			DailyXp.objects.update_or_create(
				profil=profil,
				date=today,
				defaults={'level': profil.profil_lvl}
			)
			updated_count += 1

	# Calcul de la moyenne de la promo pour aujourd'hui
	result = DailyXp.objects.filter(date=today).aggregate(Avg('level'))
	avg_level = round(result['level__avg'] or 0.0, 2)

	return updated_count, avg_level

class Command(BaseCommand):
	help = "Sync 42 profiles and record daily XP levels"

	def handle(self, *args, **options):
		while True:
			try:
				# 1. Mise a jour des profils depuis l'API 42
				synced_logins: list[str] = sync_all_profils()
				timestamp: str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
				message: str = f"[{timestamp}] {len(synced_logins)} profiles synced."

				if len(synced_logins) == 0:
					self.stdout.write(self.style.WARNING(message))
				else:
					self.stdout.write(self.style.SUCCESS(message))

				# 2. Sauvegarde de l'xp quotidienne en base
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

			time.sleep(300)