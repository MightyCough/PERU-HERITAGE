from typing import List, Optional, Dict, Any
from quizzes.models import Question
from quizzes.repositories.question_repository import QuestionRepository
from quizzes.repositories.answer_repository import AnswerRepository
from .base import BaseService


class QuestionService(BaseService[Question]):
    """
    Servicio con lógica de negocio para Question.
    """
    
    def __init__(self):
        repository = QuestionRepository()
        super().__init__(repository)
        self.question_repository = repository
        self.answer_repository = AnswerRepository()
    
    def get_by_theme(self, theme: str) -> List[Question]:
        """Obtiene todas las preguntas activas de un tema."""
        return list(self.question_repository.get_by_theme(theme))
    
    def get_random_question(self, theme: str = None) -> Optional[Question]:
        """Obtiene una pregunta aleatoria."""
        return self.question_repository.get_random_question(theme)
    
    def get_with_answers(self) -> List[Question]:
        """Obtiene preguntas con sus respuestas precargadas."""
        return list(self.question_repository.get_questions_with_answers())
    
    def get_by_points_range(self, min_points: int, max_points: int) -> List[Question]:
        """Obtiene preguntas dentro de un rango de puntos."""
        return list(self.question_repository.get_by_points_range(min_points, max_points))
    
    def deactivate(self, id: int) -> bool:
        """Desactiva una pregunta."""
        return self.question_repository.deactivate_question(id)
    
    def activate(self, id: int) -> bool:
        """Activa una pregunta."""
        return self.question_repository.activate_question(id)
    
    def validate_answer(self, question_id: int, answer_id: int) -> bool:
        """Valida si una respuesta es correcta para una pregunta."""
        answer = self.answer_repository.get_by_id(answer_id)
        if not answer or answer.question_id != question_id:
            return False
        return answer.is_correct
    
    def validate_create(self, data: Dict[str, Any]) -> None:
        """Validaciones antes de crear una pregunta."""
        if not data.get('text'):
            raise ValueError("El texto de la pregunta es obligatorio.")
        if not data.get('theme'):
            raise ValueError("El tema es obligatorio.")
        
        points = data.get('points', 0)
        if points < 0:
            raise ValueError("Los puntos no pueden ser negativos.")
    
    def validate_update(self, id: int, data: Dict[str, Any]) -> None:
        """Validaciones antes de actualizar una pregunta."""
        question = self.get_by_id(id)
        if not question:
            raise ValueError(f"No se encontró la pregunta con ID {id}.")
        
        points = data.get('points')
        if points is not None and points < 0:
            raise ValueError("Los puntos no pueden ser negativos.")
