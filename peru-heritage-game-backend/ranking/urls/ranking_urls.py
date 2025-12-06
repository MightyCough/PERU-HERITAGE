from django.urls import path
from ranking.views.score_event_view import ScoreEventViewSet
from ranking.views.player_score_view import PlayerScoreViewSet

app_name = 'ranking'

urlpatterns = [
    # Rutas para ScoreEvent (Eventos de Puntuación)
    path('eventos-puntuacion/', ScoreEventViewSet.as_view({'get': 'list', 'post': 'create'}), name='lista-creacion-eventos-puntuacion'),
    path('eventos-puntuacion/<int:pk>/', ScoreEventViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='detalle-evento-puntuacion'),
    path('eventos-puntuacion/jugador/<int:player_id>/', ScoreEventViewSet.as_view({'get': 'by_player'}), name='eventos-por-jugador'),
    path('eventos-puntuacion/tipo/<str:event_type>/', ScoreEventViewSet.as_view({'get': 'by_type'}), name='eventos-por-tipo'),
    path('eventos-puntuacion/recientes/', ScoreEventViewSet.as_view({'get': 'recent'}), name='eventos-recientes'),
    path('eventos-puntuacion/jugador/<int:player_id>/estadisticas/', ScoreEventViewSet.as_view({'get': 'player_statistics'}), name='estadisticas-jugador'),
    path('eventos-puntuacion/crear-evento/', ScoreEventViewSet.as_view({'post': 'create_event'}), name='crear-evento-puntuacion'),
    
    # Rutas para PlayerScore (Puntuaciones de Jugadores)
    path('puntuaciones/', PlayerScoreViewSet.as_view({'get': 'list', 'post': 'create'}), name='lista-creacion-puntuaciones'),
    path('puntuaciones/<int:pk>/', PlayerScoreViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='detalle-puntuacion'),
    path('puntuaciones/jugador/<int:player_id>/', PlayerScoreViewSet.as_view({'get': 'by_player'}), name='puntuacion-por-jugador'),
    path('puntuaciones/leaderboard/', PlayerScoreViewSet.as_view({'get': 'leaderboard'}), name='leaderboard'),
    path('puntuaciones/jugador/<int:player_id>/ranking/', PlayerScoreViewSet.as_view({'get': 'player_rank'}), name='ranking-jugador'),
    path('puntuaciones/jugador/<int:player_id>/completo/', PlayerScoreViewSet.as_view({'get': 'player_with_rank'}), name='info-completa-jugador'),
    path('puntuaciones/jugador/<int:player_id>/agregar-puntos/', PlayerScoreViewSet.as_view({'post': 'add_points'}), name='agregar-puntos'),
    path('puntuaciones/jugador/<int:player_id>/restar-puntos/', PlayerScoreViewSet.as_view({'post': 'subtract_points'}), name='restar-puntos'),
    path('puntuaciones/jugador/<int:player_id>/juego-completado/', PlayerScoreViewSet.as_view({'post': 'game_completed'}), name='juego-completado'),
    path('puntuaciones/jugador/<int:player_id>/reiniciar/', PlayerScoreViewSet.as_view({'post': 'reset_score'}), name='reiniciar-puntuacion'),
]
