from django.urls import path, include

app_name = 'api'

urlpatterns = [
    # Incluir las rutas de gameplay
    path('gameplay/', include('gameplay.urls')),
    
    # Incluir las rutas de quizzes
    path('quizzes/', include('quizzes.urls')),
    
    # Incluir las rutas de ranking
    path('ranking/', include('ranking.urls')),
    
    # Rutas futuras de otras aplicaciones
    path('', include('users.urls')),
]
