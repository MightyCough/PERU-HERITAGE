from typing import Optional, List, Dict, Any
from django.core.exceptions import ValidationError
from gameplay.models import BoardLocation
from gameplay.repositories import BoardLocationRepository
from .base import BaseService


class BoardLocationService(BaseService[BoardLocation]):
    """
    Servicio con lógica de negocio para BoardLocation.
    """
    
    def __init__(self):
        super().__init__(BoardLocationRepository())
    
    def get_by_location_id(self, location_id: int) -> Optional[BoardLocation]:
        """Obtiene una casilla por su location_id."""
        return self.repository.get_by_location_id(location_id)
    
    def get_ordered_board(self) -> List[BoardLocation]:
        """Obtiene el tablero completo ordenado."""
        return list(self.repository.get_ordered_locations())
    
    def get_start_location(self) -> BoardLocation:
        """Obtiene la casilla de inicio. Lanza excepción si no existe."""
        start_location = self.repository.get_start_location()
        if not start_location:
            raise ValidationError("No se encontró la casilla de inicio del tablero.")
        return start_location
    
    def get_end_location(self) -> BoardLocation:
        """Obtiene la casilla final. Lanza excepción si no existe."""
        end_location = self.repository.get_end_location()
        if not end_location:
            raise ValidationError("No se encontró la casilla final del tablero.")
        return end_location
    
    def get_next_location(self, current_location_id: int, dice_roll: int) -> Optional[BoardLocation]:
        """
        Calcula y obtiene la siguiente ubicación después de tirar el dado.
        Retorna None si no hay más casillas disponibles.
        """
        return self.repository.get_next_location(current_location_id, dice_roll)
    
    def get_locations_by_type(self, location_type: str) -> List[BoardLocation]:
        """Obtiene todas las casillas de un tipo específico."""
        return list(self.repository.get_by_type(location_type))
    
    def validate_create(self, data: Dict[str, Any]) -> None:
        """Valida que no exista otra casilla con el mismo location_id."""
        location_id = data.get('location_id')
        if location_id and self.repository.get_by_location_id(location_id):
            raise ValidationError(
                f"Ya existe una casilla con location_id={location_id}."
            )
    
    def validate_update(self, id: int, data: Dict[str, Any]) -> None:
        """Valida que la casilla exista antes de actualizarla."""
        instance = self.get_by_id(id)
        if not instance:
            raise ValidationError(f"No se encontró la casilla con id={id}.")
        
        # Validar que no se duplique location_id si se está cambiando
        location_id = data.get('location_id')
        if location_id and location_id != instance.location_id:
            if self.repository.get_by_location_id(location_id):
                raise ValidationError(
                    f"Ya existe otra casilla con location_id={location_id}."
                )
    
    def is_final_location(self, location: BoardLocation) -> bool:
        """Verifica si una casilla es la casilla final del tablero."""
        return location.type == 'END'
    
    def get_location_content(self, location: BoardLocation) -> Dict[str, Any]:
        """
        Obtiene el contenido asociado a una casilla (pregunta o trivia).
        Retorna un diccionario con el tipo de contenido y los datos.
        """
        if location.related_question:
            return {
                'content_type': 'question',
                'content': location.related_question
            }
        elif location.related_trivia:
            return {
                'content_type': 'trivia',
                'content': location.related_trivia
            }
        else:
            return {
                'content_type': 'none',
                'content': None
            }
