from django.urls import path
from gameplay.views.avatar_views import AvatarViewSet


urlpatterns = [
    # Rutas en español para consistencia
    path('avatares/', AvatarViewSet.as_view({'get': 'list', 'post': 'create'}), name='avatar-list-create'),
    path('avatares/<str:pk>/', AvatarViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='avatar-detail'),
    
    # Rutas en inglés (alias) para compatibilidad
    path('avatars/', AvatarViewSet.as_view({'get': 'list', 'post': 'create'}), name='avatar-list-create-en'),
    path('avatars/<str:pk>/', AvatarViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='avatar-detail-en'),
]