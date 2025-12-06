from typing import List, Optional, Dict, Any
from quizzes.models import Answer
from quizzes.repositories.answer_repository import AnswerRepository
from .base import BaseService


class AnswerService(BaseService[Answer]):
    """
    Servicio con lógica de negocio para Answer.
    """
    
    def __init__(self):
        repository = AnswerRepository()
        super().__init__(repository)
        self.answer_repository = repository
    
    def get_by_question(self, question_id: int) -> List[Answer]:
        """Obtiene todas las respuestas de una pregunta."""
        return list(self.answer_repository.get_by_question(question_id))
    
    def get_correct_answer(self, question_id: int) -> Optional[Answer]:
        """Obtiene la respuesta correcta de una pregunta."""
        return self.answer_repository.get_correct_answer(question_id)
    
    def get_incorrect_answers(self, question_id: int) -> List[Answer]:
        """Obtiene las respuestas incorrectas de una pregunta."""
        return list(self.answer_repository.get_incorrect_answers(question_id))
    
    def validate_answer(self, answer_id: int) -> bool:
        """Verifica si una respuesta es correcta."""
        return self.answer_repository.validate_answer(answer_id)
    
    def validate_create(self, data: Dict[str, Any]) -> None:
        """Validaciones antes de crear una respuesta."""
        if not data.get('text'):
            raise ValueError("El texto de la respuesta es obligatorio.")
        if not data.get('question'):
            raise ValueError("La pregunta asociada es obligatoria.")
        
        # Verificar que no haya más de una respuesta correcta si esta es correcta
        if data.get('is_correct', False):
            question_id = data.get('question')
            if isinstance(question_id, int) and self.answer_repository.has_correct_answer(question_id):
                raise ValueError("Esta pregunta ya tiene una respuesta correcta.")
    
    def validate_update(self, id: int, data: Dict[str, Any]) -> None:
        """Validaciones antes de actualizar una respuesta."""
        answer = self.get_by_id(id)
        if not answer:
            raise ValueError(f"No se encontró la respuesta con ID {id}.")
        
        # Verificar que no haya más de una respuesta correcta
        if data.get('is_correct', False) and not answer.is_correct:
            if self.answer_repository.has_correct_answer(answer.question_id):
                raise ValueError("Esta pregunta ya tiene una respuesta correcta.")
