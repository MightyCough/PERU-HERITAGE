from typing import Optional, List
from django.db.models import QuerySet, Sum
from django.contrib.auth import get_user_model
from ranking.models import ScoreEvent
from .base import BaseRepository

User = get_user_model()


class ScoreEventRepository(BaseRepository[ScoreEvent]):
    """
    Repositorio para operaciones específicas de ScoreEvent.
    """
    
    def __init__(self):
        super().__init__(ScoreEvent)
    
    def get_by_player(self, player_id: int) -> QuerySet[ScoreEvent]:
        """Obtiene todos los eventos de puntuación de un jugador."""
        return self.filter(player_id=player_id).order_by('-timestamp')
    
    def get_by_event_type(self, event_type: str) -> QuerySet[ScoreEvent]:
        """Obtiene todos los eventos de un tipo específico."""
        return self.filter(event_type=event_type)
    
    def get_by_question(self, question_id: int) -> QuerySet[ScoreEvent]:
        """Obtiene todos los eventos relacionados con una pregunta."""
        return self.filter(related_question_id=question_id)
    
    def get_by_location(self, location_id: int) -> QuerySet[ScoreEvent]:
        """Obtiene todos los eventos relacionados con una ubicación del tablero."""
        return self.filter(related_location_id=location_id)
    
    def get_recent_events(self, limit: int = 10) -> QuerySet[ScoreEvent]:
        """Obtiene los eventos más recientes."""
        return self.get_all().order_by('-timestamp')[:limit]
    
    def get_player_total_points(self, player_id: int) -> int:
        """Calcula el total de puntos de un jugador sumando todos sus eventos."""
        total = self.filter(player_id=player_id).aggregate(
            total=Sum('points_awarded')
        )['total']
        return total if total is not None else 0
    
    def get_positive_events(self, player_id: int) -> QuerySet[ScoreEvent]:
        """Obtiene eventos donde se ganaron puntos."""
        return self.filter(player_id=player_id, points_awarded__gt=0)
    
    def get_negative_events(self, player_id: int) -> QuerySet[ScoreEvent]:
        """Obtiene eventos donde se perdieron puntos."""
        return self.filter(player_id=player_id, points_awarded__lt=0)
    
    def create_score_event(
        self,
        player_id: int,
        event_type: str,
        points: int,
        question_id: Optional[int] = None,
        location_id: Optional[int] = None
    ) -> ScoreEvent:
        """Crea un nuevo evento de puntuación."""
        return self.create(
            player_id=player_id,
            event_type=event_type,
            points_awarded=points,
            related_question_id=question_id,
            related_location_id=location_id
        )
