from django.urls import path, include

app_name = 'gameplay'

urlpatterns = [
    path('', include('gameplay.urls.gameplay_urls', namespace='gameplay_main')),
    # Incluir rutas de avatares bajo el prefijo gameplay/
    path('', include('gameplay.urls.avatar_urls')),
]
