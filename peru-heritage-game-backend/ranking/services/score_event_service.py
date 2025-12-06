from typing import List, Optional, Dict, Any
from ranking.models import ScoreEvent
from ranking.repositories.score_event_repository import ScoreEventRepository
from ranking.repositories.player_score_repository import PlayerScoreRepository
from .base import BaseService


class ScoreEventService(BaseService[ScoreEvent]):
    """
    Servicio con lógica de negocio para ScoreEvent.
    """
    
    def __init__(self):
        repository = ScoreEventRepository()
        super().__init__(repository)
        self.score_event_repository = repository
        self.player_score_repository = PlayerScoreRepository()
    
    def get_by_player(self, player_id: int) -> List[ScoreEvent]:
        """Obtiene todos los eventos de un jugador."""
        return list(self.score_event_repository.get_by_player(player_id))
    
    def get_by_event_type(self, event_type: str) -> List[ScoreEvent]:
        """Obtiene eventos por tipo."""
        return list(self.score_event_repository.get_by_event_type(event_type))
    
    def get_recent_events(self, limit: int = 10) -> List[ScoreEvent]:
        """Obtiene los eventos más recientes."""
        return list(self.score_event_repository.get_recent_events(limit))
    
    def get_player_total_points(self, player_id: int) -> int:
        """Calcula el total de puntos de un jugador."""
        return self.score_event_repository.get_player_total_points(player_id)
    
    def create_score_event(
        self,
        player_id: int,
        event_type: str,
        points: int,
        question_id: Optional[int] = None,
        location_id: Optional[int] = None
    ) -> ScoreEvent:
        """
        Crea un evento de puntuación y actualiza el puntaje total del jugador.
        """
        # Validar datos
        self.validate_score_event(player_id, event_type, points)
        
        # Crear el evento
        event = self.score_event_repository.create_score_event(
            player_id=player_id,
            event_type=event_type,
            points=points,
            question_id=question_id,
            location_id=location_id
        )
        
        # Actualizar el puntaje total del jugador
        if points > 0:
            self.player_score_repository.add_points(player_id, points)
        elif points < 0:
            self.player_score_repository.subtract_points(player_id, abs(points))
        
        return event
    
    def get_player_statistics(self, player_id: int) -> Dict[str, Any]:
        """Obtiene estadísticas detalladas de un jugador."""
        total_events = self.score_event_repository.count(player_id=player_id)
        positive_events = self.score_event_repository.get_positive_events(player_id).count()
        negative_events = self.score_event_repository.get_negative_events(player_id).count()
        total_points = self.score_event_repository.get_player_total_points(player_id)
        
        return {
            'total_events': total_events,
            'positive_events': positive_events,
            'negative_events': negative_events,
            'total_points': total_points,
        }
    
    def validate_score_event(self, player_id: int, event_type: str, points: int) -> None:
        """Validaciones antes de crear un evento de puntuación."""
        if not player_id:
            raise ValueError("El ID del jugador es obligatorio.")
        if not event_type:
            raise ValueError("El tipo de evento es obligatorio.")
        if points == 0:
            raise ValueError("Los puntos no pueden ser 0.")
    
    def validate_create(self, data: Dict[str, Any]) -> None:
        """Validaciones antes de crear un evento."""
        player_id = data.get('player_id') or data.get('player')
        event_type = data.get('event_type')
        points = data.get('points_awarded', 0)
        
        self.validate_score_event(player_id, event_type, points)
