from typing import List, Optional, Dict, Any
from ranking.models import PlayerScore
from ranking.repositories.player_score_repository import PlayerScoreRepository
from .base import BaseService


class PlayerScoreService(BaseService[PlayerScore]):
    """
    Servicio con lógica de negocio para PlayerScore.
    """
    
    def __init__(self):
        repository = PlayerScoreRepository()
        super().__init__(repository)
        self.player_score_repository = repository
    
    def get_by_player(self, player_id: int) -> Optional[PlayerScore]:
        """Obtiene la puntuación de un jugador."""
        return self.player_score_repository.get_by_player(player_id)
    
    def get_or_create_player_score(self, player_id: int) -> PlayerScore:
        """Obtiene o crea la puntuación de un jugador."""
        return self.player_score_repository.get_or_create_player_score(player_id)
    
    def get_top_players(self, limit: int = 10) -> List[PlayerScore]:
        """Obtiene el ranking de los mejores jugadores."""
        return list(self.player_score_repository.get_top_players(limit))
    
    def get_player_rank(self, player_id: int) -> Optional[int]:
        """Obtiene la posición de un jugador en el ranking."""
        return self.player_score_repository.get_player_rank(player_id)
    
    def add_points(self, player_id: int, points: int) -> Optional[PlayerScore]:
        """Añade puntos a un jugador."""
        if points <= 0:
            raise ValueError("Los puntos deben ser positivos.")
        return self.player_score_repository.add_points(player_id, points)
    
    def subtract_points(self, player_id: int, points: int) -> Optional[PlayerScore]:
        """Resta puntos a un jugador."""
        if points <= 0:
            raise ValueError("Los puntos deben ser positivos.")
        return self.player_score_repository.subtract_points(player_id, points)
    
    def increment_games_completed(self, player_id: int) -> Optional[PlayerScore]:
        """Incrementa el contador de juegos completados."""
        return self.player_score_repository.increment_games_completed(player_id)
    
    def reset_player_score(self, player_id: int) -> Optional[PlayerScore]:
        """Reinicia la puntuación de un jugador."""
        return self.player_score_repository.reset_player_score(player_id)
    
    def get_player_with_rank(self, player_id: int) -> Dict[str, Any]:
        """Obtiene la puntuación del jugador junto con su ranking."""
        player_score = self.get_by_player(player_id)
        if not player_score:
            return None
        
        rank = self.get_player_rank(player_id)
        total_players = self.player_score_repository.get_total_players()
        
        return {
            'player_score': player_score,
            'rank': rank,
            'total_players': total_players,
        }
    
    def get_leaderboard(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Obtiene el leaderboard con rankings."""
        top_players = self.get_top_players(limit)
        
        leaderboard = []
        for index, player_score in enumerate(top_players, start=1):
            leaderboard.append({
                'rank': index,
                'player': player_score.player,
                'total_points': player_score.total_points,
                'games_completed': player_score.games_completed,
            })
        
        return leaderboard
    
    def validate_create(self, data: Dict[str, Any]) -> None:
        """Validaciones antes de crear una puntuación."""
        player_id = data.get('player_id') or data.get('player')
        if not player_id:
            raise ValueError("El ID del jugador es obligatorio.")
    
    def validate_update(self, id: int, data: Dict[str, Any]) -> None:
        """Validaciones antes de actualizar una puntuación."""
        player_score = self.get_by_id(id)
        if not player_score:
            raise ValueError(f"No se encontró la puntuación con ID {id}.")
        
        total_points = data.get('total_points')
        if total_points is not None and total_points < 0:
            raise ValueError("Los puntos totales no pueden ser negativos.")
