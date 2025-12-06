from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from ranking.models import ScoreEvent
from ranking.serializers.score_event_serializer import (
    ScoreEventSerializer,
    ScoreEventCreateSerializer
)
from ranking.services.score_event_service import ScoreEventService
from .base import BaseViewSet


class ScoreEventViewSet(BaseViewSet):
    """
    ViewSet para gestionar ScoreEvent (Eventos de Puntuación).
    """
    
    queryset = ScoreEvent.objects.all()
    serializer_class = ScoreEventSerializer
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = ScoreEventService()
    
    def get_serializer_class(self):
        """Retorna el serializador apropiado según la acción."""
        if self.action == 'create':
            return ScoreEventCreateSerializer
        return ScoreEventSerializer
    
    @action(detail=False, methods=['get'], url_path='jugador/(?P<player_id>[^/.]+)')
    def by_player(self, request, player_id=None):
        """Obtiene todos los eventos de un jugador."""
        events = self.service.get_by_player(player_id)
        serializer = self.get_serializer(events, many=True)
        return self.success_response(
            serializer.data,
            message=f"Eventos del jugador {player_id} obtenidos exitosamente"
        )
    
    @action(detail=False, methods=['get'], url_path='tipo/(?P<event_type>[^/.]+)')
    def by_type(self, request, event_type=None):
        """Obtiene eventos por tipo."""
        events = self.service.get_by_event_type(event_type)
        serializer = self.get_serializer(events, many=True)
        return self.success_response(
            serializer.data,
            message=f"Eventos del tipo {event_type} obtenidos exitosamente"
        )
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Obtiene los eventos más recientes."""
        limit = int(request.query_params.get('limit', 10))
        events = self.service.get_recent_events(limit)
        serializer = self.get_serializer(events, many=True)
        return self.success_response(
            serializer.data,
            message="Eventos recientes obtenidos exitosamente"
        )
    
    @action(detail=False, methods=['get'], url_path='jugador/(?P<player_id>[^/.]+)/estadisticas')
    def player_statistics(self, request, player_id=None):
        """Obtiene estadísticas de eventos de un jugador."""
        statistics = self.service.get_player_statistics(player_id)
        return self.success_response(
            statistics,
            message=f"Estadísticas del jugador {player_id} obtenidas exitosamente"
        )
    
    @action(detail=False, methods=['post'])
    def create_event(self, request):
        """Crea un evento de puntuación y actualiza el puntaje del jugador."""
        player_id = request.data.get('player')
        event_type = request.data.get('event_type')
        points = request.data.get('points_awarded')
        question_id = request.data.get('related_question')
        location_id = request.data.get('related_location')
        
        try:
            event = self.service.create_score_event(
                player_id=player_id,
                event_type=event_type,
                points=points,
                question_id=question_id,
                location_id=location_id
            )
            serializer = self.get_serializer(event)
            return self.success_response(
                serializer.data,
                message="Evento de puntuación creado exitosamente",
                status_code=status.HTTP_201_CREATED
            )
        except ValueError as e:
            return self.error_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )
