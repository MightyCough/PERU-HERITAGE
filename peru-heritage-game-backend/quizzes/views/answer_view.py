from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from quizzes.models import Answer
from quizzes.serializers.answer_serializer import (
    AnswerSerializer,
    AnswerCreateUpdateSerializer
)
from quizzes.services.answer_service import AnswerService
from .base import BaseViewSet


class AnswerViewSet(BaseViewSet):
    """
    ViewSet para gestionar Answer (Respuestas).
    """
    
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = AnswerService()
    
    def get_serializer_class(self):
        """Retorna el serializador apropiado según la acción."""
        if self.action in ['create', 'update', 'partial_update']:
            return AnswerCreateUpdateSerializer
        return AnswerSerializer
    
    @action(detail=False, methods=['get'], url_path='pregunta/(?P<question_id>[^/.]+)')
    def by_question(self, request, question_id=None):
        """Obtiene todas las respuestas de una pregunta."""
        answers = self.service.get_by_question(question_id)
        serializer = self.get_serializer(answers, many=True)
        return self.success_response(
            serializer.data,
            message=f"Respuestas de la pregunta {question_id} obtenidas exitosamente"
        )
    
    @action(detail=False, methods=['get'], url_path='correcta/(?P<question_id>[^/.]+)')
    def correct_answer(self, request, question_id=None):
        """Obtiene la respuesta correcta de una pregunta."""
        answer = self.service.get_correct_answer(question_id)
        
        if not answer:
            return self.error_response(
                message="No se encontró la respuesta correcta",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(answer)
        return self.success_response(
            serializer.data,
            message="Respuesta correcta obtenida exitosamente"
        )
    
    @action(detail=True, methods=['get'])
    def validate(self, request, pk=None):
        """Verifica si una respuesta es correcta."""
        is_correct = self.service.validate_answer(pk)
        
        return self.success_response(
            {'is_correct': is_correct},
            message="Respuesta validada exitosamente"
        )
