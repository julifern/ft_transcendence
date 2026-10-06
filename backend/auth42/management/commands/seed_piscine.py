import json
import random
from datetime import timedelta, date
from django.core.management.base import BaseCommand
from auth42.models import Profil, DailyXp, Project, Comment
from auth42.services.metrics import get_piscine_start_date

class Command(BaseCommand):
    help = "Generate a fake Piscine for AI or import real data from a JSON file."

    def add_arguments(self, parser):
        # Arguments principaux
        parser.add_argument('--generate', type=int, help="Number of students to generate (e.g., 50)")
        parser.add_argument('--import-file', type=str, help="Path to a JSON file to import")
        
        # Nouveaux arguments optionnels pour la date (valeurs par defaut securisees)
        parser.add_argument('--year', type=str, default='4242', help="Pool year (e.g., 2026, 2222)")
        parser.add_argument('--month', type=str, default='july', help="Pool month (e.g., september, july)")

    def handle(self, *args, **options):
        # Recuperation de l'annee et du mois
        pool_year = options['year']
        pool_month = options['month']

        # Routage selon l'action choisie
        if options.get('import_file'):
            self.import_historical_data(options['import_file'])
        elif options.get('generate'):
            self.generate_fake_piscine(options['generate'], pool_year, pool_month)
        else:
            self.stdout.write(self.style.ERROR("Please provide --generate <number> or --import-file <file.json>"))

    def import_historical_data(self, filepath: str):
        self.stdout.write(f"Importing historical data from {filepath}...")
        try:
            with open(filepath, 'r') as file:
                data = json.load(file)
                
            for student in data:
                # 1. Creation ou mise a jour du profil de l'etudiant
                profil, created = Profil.objects.update_or_create(
                    profil_login=student['profil_login'],
                    defaults={
                        'profil_id': student['profil_id'],
                        'profil_email': student.get('profil_email', f"{student['profil_login']}@student.42.fr"),
                        'profil_first_name': student.get('profil_first_name', 'Unknown'),
                        'profil_last_name': student.get('profil_last_name', 'Unknown'),
                        'profil_pool_year': student.get('profil_pool_year', '2026'),
                        'profil_pool_month': student.get('profil_pool_month', 'september'),
                        'profil_lvl': student.get('profil_lvl', 0.0),
                    }
                )

                # 2. Importation de l'historique d'experience (XP)
                if 'daily_xp' in student:
                    DailyXp.objects.filter(profil=profil).delete()
                    for xp_record in student['daily_xp']:
                        DailyXp.objects.create(
                            profil=profil,
                            date=xp_record['date'],
                            level=xp_record['level']
                        )

                # 3. Importation de l'historique des projets
                if 'projects' in student:
                    Project.objects.filter(profil=profil).delete()
                    for proj in student['projects']:
                        Project.objects.create(
                            profil=profil,
                            name=proj['name'],
                            slug=proj['slug'],
                            valid=proj.get('valid', False),
                            note=proj.get('note'),
                            status=proj.get('status', 'finished')
                        )
            
            self.stdout.write(self.style.SUCCESS(f"Import success: {len(data)} profiles loaded."))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File not found: {filepath}"))
        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR("Invalid JSON format in file."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Import error: {e}"))

    def generate_fake_piscine(self, student_count: int, pool_year: str, pool_month: str):
        self.stdout.write(f"Generating a pool of {student_count} students for {pool_month} {pool_year}...")
        
        # 1. Calcul de la vraie date de depart pour ce mois/annee precis
        temp_profil = Profil(profil_pool_year=pool_year, profil_pool_month=pool_month)
        start_date = get_piscine_start_date(temp_profil)
        
        # 2. Boucle de creation des etudiants factices
        for i in range(student_count):
            # On ajoute l'annee au login pour eviter les conflits (ex: user_2222_001)
            login = f"user_{pool_year}_{i:03d}"
            
            # Choix aleatoire du comportement de l'etudiant
            archetype_roll = random.randint(1, 100)
            
            if archetype_roll <= 20:
                self.create_elite_student(login, start_date, pool_year, pool_month)
            elif archetype_roll <= 80:
                self.create_average_student(login, start_date, pool_year, pool_month)
            else:
                self.create_ghost_student(login, start_date, pool_year, pool_month)
                
        self.stdout.write(self.style.SUCCESS(f"Piscine generated with {student_count} students starting on {start_date}!"))

# --- METHODES DE GENERATION PAR ARCHETYPE --- #
    
    def create_elite_student(self, login: str, start_date: date, pool_year: str, pool_month: str):
        profil = Profil.objects.create(
            profil_id=random.randint(100000, 999999),
            profil_login=login,
            profil_email=f"{login}@student.42.fr",
            profil_first_name="Elite",
            profil_last_name=f"User_{login.split('_')[-1]}",
            profil_pool_year=pool_year,
            profil_pool_month=pool_month,
            profil_location=f"c{random.randint(1,3)}{random.choice('abcdefgh')}{random.randint(1,7)}",
            profil_is_online=True,
            profil_correction_point=random.randint(5, 15),
            profil_total_hours=random.uniform(250.0, 350.0),
            profil_daily_average_hours=random.uniform(10.0, 14.0),
            profil_morning_hours=random.uniform(50.0, 80.0),
            profil_afternoon_hours=random.uniform(100.0, 150.0),
            profil_night_hours=random.uniform(100.0, 120.0),
            profil_preferred_slot=random.choice(["night", "afternoon"]),
            profil_timidity=random.randint(10, 40),
            profil_stress=random.randint(10, 40),
            profil_peer_help=random.randint(70, 100),
            profil_self_research=random.randint(80, 100),
            profil_perseverance=random.randint(80, 100),
        )
        
        current_level = 0.0
        for i in range(25):
            current_date = start_date + timedelta(days=i)
            current_level += random.uniform(0.4, 0.8)
            DailyXp.objects.create(profil=profil, date=current_date, level=round(current_level, 2))
        
        profil.profil_lvl = round(current_level, 2)
        profil.save()

        mock_projects = ["shell-00", "shell-01", "c-00", "c-01", "c-02", "c-03", "c-04", "c-05", "c-06", "c-07", "c-08", "c-09", "c-10"]
        for p in mock_projects:
            Project.objects.create(profil=profil, name=p.upper(), slug=f"piscine-c-{p}", valid=True, note=100, status="finished")
        
        for i in range(4):
            Project.objects.create(profil=profil, name=f"Exam 0{i}", slug=f"exam-0{i}", valid=True, note=random.randint(80, 100), status="finished")

        for i in range(3):
            Project.objects.create(profil=profil, name=f"Rush 0{i}", slug=f"rush-0{i}", valid=True, note=random.randint(50, 120), status="finished")

        # Faux commentaires de l'equipe
        Comment.objects.create(profil=profil, content="Impressive progress, helps others frequently in the cluster.")
        Comment.objects.create(profil=profil, content="Perfect score on the last exam.")

    def create_average_student(self, login: str, start_date: date, pool_year: str, pool_month: str):
        profil = Profil.objects.create(
            profil_id=random.randint(100000, 999999),
            profil_login=login,
            profil_email=f"{login}@student.42.fr",
            profil_first_name="Average",
            profil_last_name=f"User_{login.split('_')[-1]}",
            profil_pool_year=pool_year,
            profil_pool_month=pool_month,
            profil_location=f"c{random.randint(1,3)}{random.choice('abcdefgh')}{random.randint(1,7)}",
            profil_is_online=random.choice([True, False]),
            profil_correction_point=random.randint(0, 5),
            profil_total_hours=random.uniform(150.0, 220.0),
            profil_daily_average_hours=random.uniform(6.0, 9.0),
            profil_morning_hours=random.uniform(50.0, 80.0),
            profil_afternoon_hours=random.uniform(80.0, 100.0),
            profil_night_hours=random.uniform(20.0, 40.0),
            profil_preferred_slot=random.choice(["morning", "afternoon"]),
            profil_timidity=random.randint(40, 70),
            profil_stress=random.randint(50, 80),
            profil_peer_help=random.randint(40, 70),
            profil_self_research=random.randint(40, 70),
            profil_perseverance=random.randint(40, 70),
        )
        
        current_level = 0.0
        for i in range(25):
            current_date = start_date + timedelta(days=i)
            gain = random.uniform(0.1, 0.5) if i < 14 else random.uniform(0.05, 0.2)
            current_level += gain
            DailyXp.objects.create(profil=profil, date=current_date, level=round(current_level, 2))
        
        profil.profil_lvl = round(current_level, 2)
        profil.save()

        mock_projects = ["shell-00", "shell-01", "c-00", "c-01", "c-02", "c-03", "c-04"]
        for p in mock_projects:
            Project.objects.create(profil=profil, name=p.upper(), slug=f"piscine-c-{p}", valid=True, note=random.choice([80, 90, 100]), status="finished")
        Project.objects.create(profil=profil, name="C05", slug="piscine-c-c-05", valid=False, note=None, status="in_progress")
        
        for i in range(4):
            Project.objects.create(profil=profil, name=f"Exam 0{i}", slug=f"exam-0{i}", valid=True, note=random.randint(30, 60), status="finished")

        Project.objects.create(profil=profil, name="Rush 00", slug="rush-00", valid=False, note=10, status="finished")
        Project.objects.create(profil=profil, name="Rush 01", slug="rush-01", valid=False, note=None, status="in_progress")

        Comment.objects.create(profil=profil, content="Struggles a bit with C pointers but keeps trying.")

    def create_ghost_student(self, login: str, start_date: date, pool_year: str, pool_month: str):
        profil = Profil.objects.create(
            profil_id=random.randint(100000, 999999),
            profil_login=login,
            profil_email=f"{login}@student.42.fr",
            profil_first_name="Ghost",
            profil_last_name=f"User_{login.split('_')[-1]}",
            profil_pool_year=pool_year,
            profil_pool_month=pool_month,
            profil_location="Unavailable",
            profil_is_online=False,
            profil_correction_point=0,
            profil_total_hours=random.uniform(10.0, 40.0),
            profil_daily_average_hours=random.uniform(0.5, 2.0),
            profil_morning_hours=random.uniform(5.0, 20.0),
            profil_afternoon_hours=random.uniform(5.0, 20.0),
            profil_night_hours=0.0,
            profil_preferred_slot="morning",
            profil_timidity=random.randint(70, 100),
            profil_stress=random.randint(80, 100),
            profil_peer_help=random.randint(0, 20),
            profil_self_research=random.randint(0, 30),
            profil_perseverance=random.randint(0, 20),
        )
        
        current_level = 0.0
        for i in range(25):
            current_date = start_date + timedelta(days=i)
            if i < 4:
                current_level += random.uniform(0.1, 0.3)
            DailyXp.objects.create(profil=profil, date=current_date, level=round(current_level, 2))
        
        profil.profil_lvl = round(current_level, 2)
        profil.save()

        Project.objects.create(profil=profil, name="SHELL-00", slug="piscine-c-shell-00", valid=True, note=100, status="finished")
        Project.objects.create(profil=profil, name="SHELL-01", slug="piscine-c-shell-01", valid=False, note=10, status="finished")
        
        for i in range(4):
            Project.objects.create(profil=profil, name=f"Exam 0{i}", slug=f"exam-0{i}", valid=False, note=0, status="finished")

        Project.objects.create(profil=profil, name="Rush 00", slug="rush-00", valid=False, note=0, status="finished")

        Comment.objects.create(profil=profil, content="Has not been seen in the cluster for days. No response on Discord.")