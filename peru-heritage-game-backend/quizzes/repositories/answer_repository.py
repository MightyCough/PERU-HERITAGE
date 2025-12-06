from typing import Optional, List
from django.db.models import QuerySet
from quizzes.models import Answer
from .base import BaseRepository


class AnswerRepository(BaseRepository[Answer]):
    """
    Repositorio para operaciones específicas de Answer.
    """
    
    def __init__(self):
        super().__init__(Answer)
    
    def get_by_question(self, question_id: int) -> QuerySet[Answer]:
        """Obtiene todas las respuestas de una pregunta específica."""
        return self.filter(question_id=question_id)
    
    def get_correct_answer(self, question_id: int) -> Optional[Answer]:
        """Obtiene la respuesta correcta de una pregunta."""
        return self.filter(question_id=question_id, is_correct=True).first()
    
    def get_incorrect_answers(self, question_id: int) -> QuerySet[Answer]:
        """Obtiene las respuestas incorrectas de una pregunta."""
        return self.filter(question_id=question_id, is_correct=False)
    
    def validate_answer(self, answer_id: int) -> bool:
        """Verifica si una respuesta es correcta."""
        answer = self.get_by_id(answer_id)
        return answer.is_correct if answer else False
    
    def count_answers_by_question(self, question_id: int) -> int:
        """Cuenta cuántas respuestas tiene una pregunta."""
        return self.count(question_id=question_id)
    
    def has_correct_answer(self, question_id: int) -> bool:
        """Verifica si una pregunta tiene al menos una respuesta correcta."""
        return self.exists(question_id=question_id, is_correct=True)
