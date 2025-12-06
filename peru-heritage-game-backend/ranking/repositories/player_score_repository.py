from typing import Optional, List
from django.db.models import QuerySet, F
from django.contrib.auth import get_user_model
from ranking.models import PlayerScore
from .base import BaseRepository

User = get_user_model()


class PlayerScoreRepository(BaseRepository[PlayerScore]):
    """
    Repositorio para operaciones específicas de PlayerScore.
    """
    
    def __init__(self):
        super().__init__(PlayerScore)
    
    def get_by_player(self, player_id: int) -> Optional[PlayerScore]:
        """Obtiene la puntuación de un jugador específico."""
        try:
            return self.model.objects.get(player_id=player_id)
        except self.model.DoesNotExist:
            return None
    
    def get_or_create_player_score(self, player_id: int) -> PlayerScore:
        """Obtiene o crea la puntuación de un jugador."""
        player_score, created = self.get_or_create(
            player_id=player_id,
            defaults={'total_points': 0, 'games_completed': 0}
        )
        return player_score
    
    def get_top_players(self, limit: int = 10) -> QuerySet[PlayerScore]:
        """Obtiene el top de jugadores por puntuación."""
        return self.get_all().order_by('-total_points', 'last_updated')[:limit]
    
    def get_player_rank(self, player_id: int) -> Optional[int]:
        """Obtiene el ranking/posición de un jugador."""
        player_score = self.get_by_player(player_id)
        if not player_score:
            return None
        
        # Cuenta cuántos jugadores tienen más puntos
        rank = self.model.objects.filter(
            total_points__gt=player_score.total_points
        ).count() + 1
        
        return rank
    
    def add_points(self, player_id: int, points: int) -> Optional[PlayerScore]:
        """Añade puntos a un jugador."""
        player_score = self.get_or_create_player_score(player_id)
        player_score.total_points = F('total_points') + points
        player_score.save()
        player_score.refresh_from_db()
        return player_score
    
    def subtract_points(self, player_id: int, points: int) -> Optional[PlayerScore]:
        """Resta puntos a un jugador (no permite valores negativos)."""
        player_score = self.get_or_create_player_score(player_id)
        new_total = max(0, player_score.total_points - points)
        player_score.total_points = new_total
        player_score.save()
        return player_score
    
    def increment_games_completed(self, player_id: int) -> Optional[PlayerScore]:
        """Incrementa el contador de juegos completados."""
        player_score = self.get_or_create_player_score(player_id)
        player_score.games_completed = F('games_completed') + 1
        player_score.save()
        player_score.refresh_from_db()
        return player_score
    
    def reset_player_score(self, player_id: int) -> Optional[PlayerScore]:
        """Reinicia la puntuación de un jugador a 0."""
        player_score = self.get_by_player(player_id)
        if player_score:
            player_score.total_points = 0
            player_score.games_completed = 0
            player_score.save()
        return player_score
    
    def get_players_by_points_range(self, min_points: int, max_points: int) -> QuerySet[PlayerScore]:
        """Obtiene jugadores dentro de un rango de puntos."""
        return self.filter(
            total_points__gte=min_points,
            total_points__lte=max_points
        ).order_by('-total_points')
    
    def get_total_players(self) -> int:
        """Obtiene el número total de jugadores con puntuación."""
        return self.count()
