import time
from datetime import datetime
from django.core.management.base import BaseCommand
from auth42.views import sync_all_profils

class Command(BaseCommand):
	def handle(self, *args, **options):
		while True:
			synced_logins: list[str] = sync_all_profils()
			horodatage: str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
			message: str = f"[{horodatage}] {len(synced_logins)} profils synchronises."
			if len(synced_logins) == 0:
				self.stdout.write(self.style.WARNING(message))
			else:
				self.stdout.write(self.style.SUCCESS(message))
			time.sleep(300)