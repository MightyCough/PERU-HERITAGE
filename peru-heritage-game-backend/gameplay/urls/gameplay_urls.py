from django.urls import path
from rest_framework.routers import DefaultRouter
from gameplay.views.board_location_view import BoardLocationViewSet
from gameplay.views.game_session_view import GameSessionViewSet

app_name = 'gameplay_main'

# Crear router para registrar ViewSets con todas sus acciones
router = DefaultRouter()

urlpatterns = [
    path('ubicaciones-tablero/', BoardLocationViewSet.as_view({'get': 'list', 'post': 'create'}), name='lista-creacion-ubicaciones-tablero'),
    path('ubicaciones-tablero/<int:pk>/', BoardLocationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='detalle-ubicacion-tablero'),

    path('sesiones-juego/', GameSessionViewSet.as_view({'get': 'list', 'post': 'create'}), name='lista-creacion-sesiones-juego'),
    path('sesiones-juego/<int:pk>/', GameSessionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='detalle-sesion-juego'),
    
    # Acciones personalizadas del GameSessionViewSet
    path('sesiones-juego/start/', GameSessionViewSet.as_view({'post': 'start_game'}), name='start-game'),
    path('sesiones-juego/roll-dice/', GameSessionViewSet.as_view({'post': 'roll_dice'}), name='roll-dice'),
    path('sesiones-juego/my-session/', GameSessionViewSet.as_view({'get': 'my_session'}), name='my-session'),
    path('sesiones-juego/reset/', GameSessionViewSet.as_view({'post': 'reset_game'}), name='reset-game'),
    path('sesiones-juego/active/', GameSessionViewSet.as_view({'get': 'active_sessions'}), name='active-sessions'),
    path('sesiones-juego/completed/', GameSessionViewSet.as_view({'get': 'completed_sessions'}), name='completed-sessions'),
    path('sesiones-juego/<int:pk>/progress/', GameSessionViewSet.as_view({'get': 'get_progress'}), name='session-progress'),
    path('sesiones-juego/answer-and-advance/', GameSessionViewSet.as_view({'post': 'answer_and_advance'}), name='answer-and-advance'),
]
