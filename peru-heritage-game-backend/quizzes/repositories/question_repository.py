from typing import Optional
from django.db.models import QuerySet
from quizzes.models import Question
from .base import BaseRepository


class QuestionRepository(BaseRepository[Question]):
    """
    Repositorio para operaciones específicas de Question.
    """
    
    def __init__(self):
        super().__init__(Question)
    
    def get_by_theme(self, theme: str) -> QuerySet[Question]:
        """Obtiene todas las preguntas de un tema específico."""
        return self.filter(theme=theme, is_active=True)
    
    def get_active_questions(self) -> QuerySet[Question]:
        """Obtiene todas las preguntas activas."""
        return self.filter(is_active=True)
    
    def get_random_question(self, theme: str = None) -> Optional[Question]:
        """Obtiene una pregunta aleatoria, opcionalmente filtrada por tema."""
        queryset = self.get_active_questions()
        if theme:
            queryset = queryset.filter(theme=theme)
        return queryset.order_by('?').first()
    
    def get_questions_with_answers(self) -> QuerySet[Question]:
        """Obtiene preguntas que tienen respuestas asociadas."""
        return self.get_active_questions().prefetch_related('answers')
    
    def get_by_points_range(self, min_points: int, max_points: int) -> QuerySet[Question]:
        """Obtiene preguntas dentro de un rango de puntos."""
        return self.filter(points__gte=min_points, points__lte=max_points, is_active=True)
    
    def deactivate_question(self, id: int) -> bool:
        """Desactiva una pregunta sin eliminarla."""
        question = self.get_by_id(id)
        if question:
            question.is_active = False
            question.save()
            return True
        return False
    
    def activate_question(self, id: int) -> bool:
        """Activa una pregunta."""
        question = self.get_by_id(id)
        if question:
            question.is_active = True
            question.save()
            return True
        return False
