from django.urls import path
from . import views

urlpatterns = [
	# <url> <fonction> <name>
	path('login/', views.login, name='login'),
	path('callback/', views.callback, name='callback'),
	path('me/', views.me, name='me'),
	path('sync/<str:login>/', views.sync_profil, name='sync_profil'),
	path('sync_all_profils/', views.sync_all_profils_init, name='sync_all_profils'),
	path('api/dashboard/', views.dashboard, name='dashboard'),
    path('api/profils/', views.dashboard, name='api_profils'),
	path('api/profils/<str:login>/', views.api_profil, name='api_profil'),
	path('debug/<str:login>/', views.debug_profil, name='debug_profil'),
	path('comment/<int:comment_id>/', views.manage_comment, name='manage_comment'), # avant <str:login> : <int:> ne matche que des chiffres
	path('comment/<str:login>/', views.add_comment, name='add_comment'),
	path('follow/<str:profil_login>/', views.follow, name='follow'),
]