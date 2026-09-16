from django.contrib import admin

# Pour pouvoir utiliser les models dans le pannel admin
from .models import FtUser, WhitelistUser

admin.site.register(FtUser)
admin.site.register(WhitelistUser)
