from typing import Optional, List
from django.db.models import QuerySet
from gameplay.models import BoardLocation
from .base import BaseRepository


class BoardLocationRepository(BaseRepository[BoardLocation]):
    """
    Repositorio para operaciones específicas de BoardLocation.
    """
    
    def __init__(self):
        super().__init__(BoardLocation)
    
    def get_by_location_id(self, location_id: int) -> Optional[BoardLocation]:
        """Obtiene una casilla por su location_id."""
        try:
            return self.model.objects.get(location_id=location_id)
        except self.model.DoesNotExist:
            return None
    
    def get_by_type(self, location_type: str) -> QuerySet[BoardLocation]:
        """Obtiene todas las casillas de un tipo específico."""
        return self.filter(type=location_type)
    
    def get_ordered_locations(self) -> QuerySet[BoardLocation]:
        """Obtiene todas las casillas ordenadas por location_id."""
        return self.model.objects.order_by('location_id')
    
    def get_start_location(self) -> Optional[BoardLocation]:
        """Obtiene la casilla de inicio."""
        return self.filter(type='START').first()
    
    def get_end_location(self) -> Optional[BoardLocation]:
        """Obtiene la casilla final."""
        return self.filter(type='END').first()
    
    def get_active_locations(self) -> QuerySet[BoardLocation]:
        """Obtiene todas las casillas activas (excluyendo las deshabilitadas si se implementa)."""
        return self.get_ordered_locations()
    
    def get_next_location(self, current_location_id: int, steps: int = 1) -> Optional[BoardLocation]:
        """Obtiene la siguiente casilla después de avanzar 'steps' posiciones."""
        next_location_id = current_location_id + steps
        return self.get_by_location_id(next_location_id)
    
    def get_locations_with_questions(self) -> QuerySet[BoardLocation]:
        """Obtiene todas las casillas que tienen preguntas asociadas."""
        return self.filter(type='QUESTION', related_question__isnull=False)
    
    def get_locations_with_trivia(self) -> QuerySet[BoardLocation]:
        """Obtiene todas las casillas que tienen datos curiosos asociados."""
        return self.filter(type='TRIVIA', related_trivia__isnull=False)
