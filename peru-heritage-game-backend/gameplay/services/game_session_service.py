from typing import Optional, List
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from gameplay.models import GameSession
from gameplay.repositories import GameSessionRepository
from users.models import UserProfile
from .base import BaseService
from .board_location_service import BoardLocationService
from gameplay.services.avatar_service import AvatarService

User = get_user_model()

class GameSessionService(BaseService[GameSession]):
    """
    Servicio con lógica de negocio para GameSession.
    """
    
    def __init__(self):
        super().__init__(GameSessionRepository())
        self.board_service = BoardLocationService()
        self.avatar_service = AvatarService()
    
    def get_player_session(self, player: UserProfile) -> Optional[GameSession]:
        """Obtiene la sesión activa de un jugador."""
        return self.repository.get_by_player(player)
    
    def start_new_game(self, player: UserProfile, avatar_name: str) -> GameSession:
        """
        Inicia una nueva sesión de juego para un jugador con un avatar seleccionado.
        Valida que el jugador no tenga una sesión activa y que el avatar exista.
        """
        # Verificar si ya tiene una sesión activa
        if self.repository.player_has_active_session(player):
            raise ValidationError(
                "El jugador ya tiene una sesión de juego activa. "
                "Debe completarla o eliminarla antes de iniciar una nueva."
            )

        # Validar el avatar seleccionado usando AvatarService
        avatar = self.avatar_service.get_avatar_by_name(avatar_name)
        if not avatar:
            raise ValidationError(f"El avatar '{avatar_name}' no existe.")

        # Obtener la casilla de inicio
        start_location = self.board_service.get_start_location()
        
        # Crear la sesión con el avatar seleccionado
        return self.repository.create_session(player, start_location, avatar)
    
    def roll_dice_and_move(self, player: UserProfile, dice_result: int) -> GameSession:
        """
        Tira el dado y mueve al jugador a la nueva posición.
        Valida que el dado esté en el rango correcto (1-6).
        """
        # Validar resultado del dado
        if dice_result < 1 or dice_result > 6:
            raise ValidationError("El resultado del dado debe estar entre 1 y 6.")
        
        # Obtener sesión del jugador
        session = self.get_player_session(player)
        if not session:
            raise ValidationError("El jugador no tiene una sesión activa.")
        
        if session.is_completed:
            raise ValidationError("La sesión ya ha sido completada.")
        
        # Calcular nueva posición
        current_location_id = session.current_location.location_id
        next_location = self.board_service.get_next_location(
            current_location_id, 
            dice_result
        )
        
        # Si no hay siguiente casilla, el jugador llegó al final
        if not next_location:
            # Obtener la última casilla (END)
            end_location = self.board_service.get_end_location()
            next_location = end_location
            # Completar la sesión
            return self.complete_game(session, dice_result)
        
        # Actualizar la sesión
        return self.repository.update_location(session, next_location, dice_result)
    
    def complete_game(self, session: GameSession, last_dice_roll: int = 0) -> GameSession:
        """Marca una sesión como completada."""
        if session.is_completed:
            raise ValidationError("La sesión ya está completada.")
        
        # Actualizar último dado si se proporciona
        if last_dice_roll > 0:
            session.last_dice_roll = last_dice_roll
        
        return self.repository.complete_session(session)
    
    def reset_player_game(self, player: UserProfile) -> GameSession:
        """
        Reinicia el juego de un jugador eliminando su sesión actual
        y creando una nueva.
        """
        # Eliminar sesión existente si la hay
        self.repository.delete_player_session(player)
        
        # Crear nueva sesión
        return self.start_new_game(player)
    
    def get_active_sessions(self) -> List[GameSession]:
        """Obtiene todas las sesiones activas."""
        return list(self.repository.get_active_sessions())
    
    def get_completed_sessions(self) -> List[GameSession]:
        """Obtiene todas las sesiones completadas."""
        return list(self.repository.get_completed_sessions())
    
    def player_has_active_game(self, player: UserProfile) -> bool:
        """Verifica si un jugador tiene una sesión activa."""
        return self.repository.player_has_active_session(player)
    
    def get_session_progress(self, session: GameSession) -> dict:
        """
        Obtiene información sobre el progreso de una sesión.
        """
        total_locations = len(self.board_service.get_ordered_board())
        current_position = session.current_location.location_id
        
        return {
            'current_position': current_position,
            'total_positions': total_locations,
            'progress_percentage': (current_position / total_locations) * 100,
            'is_completed': session.is_completed,
            'last_dice_roll': session.last_dice_roll,
        }
    
    def answer_question_and_advance(self, player: UserProfile, question_id: int, answer_id: int, response_time: float = 10.0) -> dict:
        """
        Valida una respuesta y avanza a la siguiente casilla si es correcta.
        Calcula puntos dinámicamente según el tiempo de respuesta (máximo 10 segundos).
        
        Retorna un diccionario con:
        - is_correct: bool
        - points_earned: int
        - session: GameSession actualizado
        - message: str
        """
        from quizzes.services.question_service import QuestionService
        from quizzes.models import Question
        
        # Obtener sesión del jugador
        session = self.get_player_session(player)
        if not session:
            raise ValidationError("El jugador no tiene una sesión activa.")
        
        if session.is_completed:
            raise ValidationError("La sesión ya ha sido completada.")
        
        # Validar la respuesta usando QuestionService
        question_service = QuestionService()
        is_correct = question_service.validate_answer(question_id, answer_id)
        
        points_earned = 0
        message = ""
        
        if is_correct:
            # Calcular puntos basados en el tiempo de respuesta
            # Puntos base: 100
            # Tiempo máximo: 15 segundos
            # Fórmula (Curva suave): 100 - ((tiempo / 15)^1.5 * 100)
            # Esto hace que los puntos bajen lento al principio y más rápido al final
            
            base_points = 100
            max_time = 15.0
            
            # Normalizar response_time entre 0 y 15
            response_time = max(0, min(response_time, max_time))
            
            # Calcular ratio (0 a 1)
            time_ratio = response_time / max_time
            
            # Calcular puntos
            points_earned = max(0, int(base_points - (pow(time_ratio, 1.5) * base_points)))
            
            # Actualizar puntos totales del jugador en PlayerScore
            from ranking.models import PlayerScore, ScoreEvent
            player_score, created = PlayerScore.objects.get_or_create(
                player=player,
                defaults={'total_points': 0, 'games_completed': 0}
            )
            player_score.total_points += points_earned
            player_score.save()
            
            # Registrar evento de puntuación
            try:
                question = Question.objects.get(id=question_id)
                ScoreEvent.objects.create(
                    player=player,
                    event_type='QUESTION_CORRECT',
                    points_awarded=points_earned,
                    related_question=question,
                    related_location=session.current_location
                )
            except Question.DoesNotExist:
                pass
            
            # Avanzar a la siguiente casilla (1 posición)
            current_location_id = session.current_location.location_id
            next_location = self.board_service.get_next_location(current_location_id, 1)
            
            if not next_location:
                # Llegó al final del juego
                end_location = self.board_service.get_end_location()
                next_location = end_location
                session = self.complete_game(session, 0)
                message = f"¡Felicidades! Has completado el juego. Ganaste {points_earned} puntos."
            else:
                # Actualizar ubicación
                session = self.repository.update_location(session, next_location, 0)
                message = f"¡Respuesta correcta! +{points_earned} puntos. Avanzaste a: {next_location.name}"
        else:
            # Respuesta incorrecta: descontar puntos
            from ranking.models import PlayerScore, ScoreEvent
            penalty_points = -20  # Penalización por respuesta incorrecta
            points_earned = penalty_points
            
            # Actualizar puntos del jugador (puede llegar a 0 pero no negativo)
            player_score, created = PlayerScore.objects.get_or_create(
                player=player,
                defaults={'total_points': 0, 'games_completed': 0}
            )
            player_score.total_points = max(0, player_score.total_points + penalty_points)
            player_score.save()
            
            # Registrar evento de penalización
            try:
                question = Question.objects.get(id=question_id)
                ScoreEvent.objects.create(
                    player=player,
                    event_type='PENALTY_LOCATION',
                    points_awarded=penalty_points,
                    related_question=question,
                    related_location=session.current_location
                )
            except Question.DoesNotExist:
                pass
            
            message = f"Respuesta incorrecta. {penalty_points} puntos. Permaneces en la casilla actual."
        
        return {
            'is_correct': is_correct,
            'points_earned': points_earned,
            'session': session,
            'message': message
        }
