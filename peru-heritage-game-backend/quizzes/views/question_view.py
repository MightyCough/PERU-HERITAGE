from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from quizzes.models import Question
from quizzes.serializers.question_serializer import (
    QuestionSerializer,
    QuestionCreateUpdateSerializer
)
from quizzes.services.question_service import QuestionService
from .base import BaseViewSet


class QuestionViewSet(BaseViewSet):
    """
    ViewSet para gestionar Question (Preguntas de Trivia).
    """
    
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = QuestionService()
    
    def get_serializer_class(self):
        """Retorna el serializador apropiado según la acción."""
        if self.action in ['create', 'update', 'partial_update']:
            return QuestionCreateUpdateSerializer
        return QuestionSerializer
    
    @action(detail=False, methods=['get'], url_path='tema/(?P<theme>[^/.]+)')
    def by_theme(self, request, theme=None):
        """Obtiene preguntas por tema."""
        questions = self.service.get_by_theme(theme)
        serializer = self.get_serializer(questions, many=True)
        return self.success_response(
            serializer.data,
            message=f"Preguntas del tema {theme} obtenidas exitosamente"
        )
    
    @action(detail=False, methods=['get'])
    def random(self, request):
        """Obtiene una pregunta aleatoria."""
        theme = request.query_params.get('theme', None)
        question = self.service.get_random_question(theme)
        
        if not question:
            return self.error_response(
                message="No se encontró ninguna pregunta disponible",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(question)
        return self.success_response(
            serializer.data,
            message="Pregunta aleatoria obtenida exitosamente"
        )
    
    @action(detail=False, methods=['get'])
    def with_answers(self, request):
        """Obtiene todas las preguntas con sus respuestas."""
        questions = self.service.get_with_answers()
        serializer = self.get_serializer(questions, many=True)
        return self.success_response(
            serializer.data,
            message="Preguntas con respuestas obtenidas exitosamente"
        )
    
    @action(detail=True, methods=['post'])
    def validate_answer(self, request, pk=None):
        """Valida si una respuesta es correcta para esta pregunta."""
        answer_id = request.data.get('answer_id')
        
        if not answer_id:
            return self.error_response(
                message="Debe proporcionar un answer_id",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        is_correct = self.service.validate_answer(pk, answer_id)
        
        return self.success_response(
            {'is_correct': is_correct},
            message="Respuesta validada exitosamente"
        )
    
    @action(detail=True, methods=['patch'])
    def deactivate(self, request, pk=None):
        """Desactiva una pregunta."""
        if self.service.deactivate(pk):
            return self.success_response(
                None,
                message="Pregunta desactivada exitosamente"
            )
        return self.error_response(
            message="No se pudo desactivar la pregunta",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=True, methods=['patch'])
    def activate(self, request, pk=None):
        """Activa una pregunta."""
        if self.service.activate(pk):
            return self.success_response(
                None,
                message="Pregunta activada exitosamente"
            )
        return self.error_response(
            message="No se pudo activar la pregunta",
            status_code=status.HTTP_404_NOT_FOUND
        )
