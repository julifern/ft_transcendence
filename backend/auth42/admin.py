from django.contrib import admin

# Pour pouvoir utiliser les models dans le pannel admin
from .models import FtUser, WhitelistUser, Profil, Project, Comment

admin.site.register(FtUser)
admin.site.register(WhitelistUser)
admin.site.register(Profil)
admin.site.register(Project)
admin.site.register(Comment)
