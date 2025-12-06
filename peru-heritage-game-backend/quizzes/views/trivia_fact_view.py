from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from quizzes.models import TriviaFact
from quizzes.serializers.trivia_fact_serializer import (
    TriviaFactSerializer,
    TriviaFactCreateUpdateSerializer
)
from quizzes.services.trivia_fact_service import TriviaFactService
from .base import BaseViewSet


class TriviaFactViewSet(BaseViewSet):
    """
    ViewSet para gestionar TriviaFact (Datos Curiosos).
    """
    
    queryset = TriviaFact.objects.all()
    serializer_class = TriviaFactSerializer
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = TriviaFactService()
    
    def get_serializer_class(self):
        """Retorna el serializador apropiado según la acción."""
        if self.action in ['create', 'update', 'partial_update']:
            return TriviaFactCreateUpdateSerializer
        return TriviaFactSerializer
    
    @action(detail=False, methods=['get'], url_path='tema/(?P<theme>[^/.]+)')
    def by_theme(self, request, theme=None):
        """Obtiene datos curiosos por tema."""
        facts = self.service.get_by_theme(theme)
        serializer = self.get_serializer(facts, many=True)
        return self.success_response(
            serializer.data,
            message=f"Datos curiosos del tema {theme} obtenidos exitosamente"
        )
    
    @action(detail=False, methods=['get'])
    def random(self, request):
        """Obtiene un dato curioso aleatorio."""
        theme = request.query_params.get('theme', None)
        fact = self.service.get_random_fact(theme)
        
        if not fact:
            return self.error_response(
                message="No se encontró ningún dato curioso disponible",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(fact)
        return self.success_response(
            serializer.data,
            message="Dato curioso aleatorio obtenido exitosamente"
        )
    
    @action(detail=True, methods=['patch'])
    def deactivate(self, request, pk=None):
        """Desactiva un dato curioso."""
        if self.service.deactivate(pk):
            return self.success_response(
                None,
                message="Dato curioso desactivado exitosamente"
            )
        return self.error_response(
            message="No se pudo desactivar el dato curioso",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=True, methods=['patch'])
    def activate(self, request, pk=None):
        """Activa un dato curioso."""
        if self.service.activate(pk):
            return self.success_response(
                None,
                message="Dato curioso activado exitosamente"
            )
        return self.error_response(
            message="No se pudo activar el dato curioso",
            status_code=status.HTTP_404_NOT_FOUND
        )
