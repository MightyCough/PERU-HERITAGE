from typing import Optional
from django.db.models import QuerySet
from django.contrib.auth import get_user_model
from gameplay.models import GameSession, BoardLocation, Avatar
from .base import BaseRepository
from users.models import UserProfile

User = get_user_model()


class GameSessionRepository(BaseRepository[GameSession]):
    """
    Repositorio para operaciones específicas de GameSession.
    """
    
    def __init__(self):
        super().__init__(GameSession)
    
    def get_by_player(self, player: UserProfile) -> Optional[GameSession]:
        """Obtiene la sesión de juego de un jugador específico."""
        try:
            return self.model.objects.get(player=player)
        except self.model.DoesNotExist:
            return None
    
    def get_active_sessions(self) -> QuerySet[GameSession]:
        """Obtiene todas las sesiones activas (no completadas)."""
        return self.filter(is_completed=False)
    
    def get_completed_sessions(self) -> QuerySet[GameSession]:
        """Obtiene todas las sesiones completadas."""
        return self.filter(is_completed=True)
    
    def get_sessions_at_location(self, location: BoardLocation) -> QuerySet[GameSession]:
        """Obtiene todas las sesiones en una ubicación específica."""
        return self.filter(current_location=location)
    
    def create_session(self, player: UserProfile, start_location: BoardLocation, avatar: Avatar) -> GameSession:
        """Crea una nueva sesión de juego para un jugador con un avatar seleccionado."""
        return self.create(
            player=player,
            current_location=start_location,
            avatar=avatar,
            is_completed=False,
            last_dice_roll=0
        )
    
    def update_location(self, session: GameSession, new_location: BoardLocation, dice_roll: int) -> GameSession:
        """Actualiza la ubicación actual de una sesión."""
        session.current_location = new_location
        session.last_dice_roll = dice_roll
        session.save()
        return session
    
    def complete_session(self, session: GameSession) -> GameSession:
        """Marca una sesión como completada."""
        from django.utils import timezone
        session.is_completed = True
        session.completed_at = timezone.now()
        session.save()
        return session
    
    def player_has_active_session(self, player: UserProfile) -> bool:
        """Verifica si un jugador tiene una sesión activa."""
        return self.filter(player=player, is_completed=False).exists()
    
    def delete_player_session(self, player: UserProfile) -> bool:
        """Elimina la sesión de un jugador."""
        session = self.get_by_player(player)
        if session:
            session.delete()
            return True
        return False
