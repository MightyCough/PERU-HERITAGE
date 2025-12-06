from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from ranking.models import PlayerScore
from ranking.serializers.player_score_serializer import (
    PlayerScoreSerializer,
    PlayerScoreCreateUpdateSerializer,
    LeaderboardSerializer
)
from ranking.services.player_score_service import PlayerScoreService
from .base import BaseViewSet


class PlayerScoreViewSet(BaseViewSet):
    """
    ViewSet para gestionar PlayerScore (Puntuaciones de Jugadores).
    """
    
    queryset = PlayerScore.objects.all()
    serializer_class = PlayerScoreSerializer
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = PlayerScoreService()
    
    def get_serializer_class(self):
        """Retorna el serializador apropiado según la acción."""
        if self.action in ['create', 'update', 'partial_update']:
            return PlayerScoreCreateUpdateSerializer
        elif self.action == 'leaderboard':
            return LeaderboardSerializer
        return PlayerScoreSerializer
    
    @action(detail=False, methods=['get'], url_path='jugador/(?P<player_id>[^/.]+)')
    def by_player(self, request, player_id=None):
        """Obtiene la puntuación de un jugador específico."""
        player_score = self.service.get_by_player(player_id)
        
        if not player_score:
            return self.error_response(
                message="No se encontró la puntuación del jugador",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(player_score)
        return self.success_response(
            serializer.data,
            message="Puntuación del jugador obtenida exitosamente"
        )
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Obtiene el ranking/leaderboard de jugadores."""
        limit = int(request.query_params.get('limit', 10))
        leaderboard = self.service.get_leaderboard(limit)
        serializer = LeaderboardSerializer(leaderboard, many=True)
        return self.success_response(
            serializer.data,
            message="Leaderboard obtenido exitosamente"
        )
    
    @action(detail=False, methods=['get'], url_path='jugador/(?P<player_id>[^/.]+)/ranking')
    def player_rank(self, request, player_id=None):
        """Obtiene el ranking de un jugador específico."""
        rank = self.service.get_player_rank(player_id)
        
        if rank is None:
            return self.error_response(
                message="No se encontró el jugador en el ranking",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return self.success_response(
            {'rank': rank},
            message=f"El jugador está en la posición {rank}"
        )
    
    @action(detail=False, methods=['get'], url_path='jugador/(?P<player_id>[^/.]+)/completo')
    def player_with_rank(self, request, player_id=None):
        """Obtiene la puntuación del jugador junto con su ranking."""
        result = self.service.get_player_with_rank(player_id)
        
        if not result:
            return self.error_response(
                message="No se encontró la puntuación del jugador",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        player_score = result['player_score']
        serializer = PlayerScoreSerializer(player_score)
        data = serializer.data
        data['rank'] = result['rank']
        data['total_players'] = result['total_players']
        
        return self.success_response(
            data,
            message="Información completa del jugador obtenida exitosamente"
        )
    
    @action(detail=False, methods=['post'], url_path='jugador/(?P<player_id>[^/.]+)/agregar-puntos')
    def add_points(self, request, player_id=None):
        """Añade puntos a un jugador."""
        points = request.data.get('points')
        
        if not points or points <= 0:
            return self.error_response(
                message="Debe proporcionar una cantidad válida de puntos",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            player_score = self.service.add_points(player_id, points)
            serializer = self.get_serializer(player_score)
            return self.success_response(
                serializer.data,
                message=f"Se añadieron {points} puntos exitosamente"
            )
        except ValueError as e:
            return self.error_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'], url_path='jugador/(?P<player_id>[^/.]+)/restar-puntos')
    def subtract_points(self, request, player_id=None):
        """Resta puntos a un jugador."""
        points = request.data.get('points')
        
        if not points or points <= 0:
            return self.error_response(
                message="Debe proporcionar una cantidad válida de puntos",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            player_score = self.service.subtract_points(player_id, points)
            serializer = self.get_serializer(player_score)
            return self.success_response(
                serializer.data,
                message=f"Se restaron {points} puntos exitosamente"
            )
        except ValueError as e:
            return self.error_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'], url_path='jugador/(?P<player_id>[^/.]+)/juego-completado')
    def game_completed(self, request, player_id=None):
        """Incrementa el contador de juegos completados."""
        player_score = self.service.increment_games_completed(player_id)
        serializer = self.get_serializer(player_score)
        return self.success_response(
            serializer.data,
            message="Juego completado registrado exitosamente"
        )
    
    @action(detail=False, methods=['post'], url_path='jugador/(?P<player_id>[^/.]+)/reiniciar')
    def reset_score(self, request, player_id=None):
        """Reinicia la puntuación de un jugador."""
        player_score = self.service.reset_player_score(player_id)
        
        if not player_score:
            return self.error_response(
                message="No se encontró la puntuación del jugador",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(player_score)
        return self.success_response(
            serializer.data,
            message="Puntuación reiniciada exitosamente"
        )
