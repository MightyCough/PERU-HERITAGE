from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from gameplay.models import BoardLocation
from gameplay.services import BoardLocationService
from gameplay.serializers import (
    BoardLocationSerializer,
    BoardLocationDetailSerializer,
    BoardLocationCreateUpdateSerializer
)
from .base import BaseViewSet


class BoardLocationViewSet(BaseViewSet):
    """
    ViewSet para gestionar las casillas del tablero (BoardLocation).
    
    Endpoints:
    - GET /board-locations/ - Lista todas las casillas
    - GET /board-locations/{id}/ - Detalle de una casilla
    - POST /board-locations/ - Crear una casilla
    - PUT/PATCH /board-locations/{id}/ - Actualizar una casilla
    - DELETE /board-locations/{id}/ - Eliminar una casilla
    - GET /board-locations/ordered/ - Lista ordenada del tablero
    - GET /board-locations/by-type/{type}/ - Casillas por tipo
    """
    
    queryset = BoardLocation.objects.all()
    serializer_class = BoardLocationSerializer
    permission_classes = [AllowAny]  # Cambiar según necesidades
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = BoardLocationService()
    
    def get_serializer_class(self):
        """Selecciona el serializador según la acción."""
        if self.action == 'retrieve':
            return BoardLocationDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BoardLocationCreateUpdateSerializer
        return BoardLocationSerializer
    
    @action(detail=False, methods=['get'], url_path='ordered')
    def ordered_board(self, request):
        """
        Obtiene todas las casillas del tablero en orden.
        GET /board-locations/ordered/
        """
        try:
            locations = self.service.get_ordered_board()
            serializer = BoardLocationSerializer(locations, many=True)
            return self.success_response(
                serializer.data,
                message="Tablero obtenido exitosamente"
            )
        except Exception as e:
            return self.error_response(
                message=f"Error al obtener el tablero: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='by-type/(?P<location_type>[^/.]+)')
    def by_type(self, request, location_type=None):
        """
        Obtiene casillas por tipo.
        GET /board-locations/by-type/{type}/
        """
        try:
            locations = self.service.get_locations_by_type(location_type)
            serializer = BoardLocationSerializer(locations, many=True)
            return self.success_response(
                serializer.data,
                message=f"Casillas de tipo {location_type} obtenidas exitosamente"
            )
        except Exception as e:
            return self.error_response(
                message=f"Error al obtener casillas: {str(e)}"
            )
    
    @action(detail=False, methods=['get'], url_path='start')
    def start_location(self, request):
        """
        Obtiene la casilla de inicio.
        GET /board-locations/start/
        """
        try:
            location = self.service.get_start_location()
            serializer = BoardLocationDetailSerializer(location)
            return self.success_response(
                serializer.data,
                message="Casilla de inicio obtenida exitosamente"
            )
        except Exception as e:
            return self.error_response(
                message=f"Error: {str(e)}",
                status_code=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='end')
    def end_location(self, request):
        """
        Obtiene la casilla final.
        GET /board-locations/end/
        """
        try:
            location = self.service.get_end_location()
            serializer = BoardLocationDetailSerializer(location)
            return self.success_response(
                serializer.data,
                message="Casilla final obtenida exitosamente"
            )
        except Exception as e:
            return self.error_response(
                message=f"Error: {str(e)}",
                status_code=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'], url_path='content')
    def get_content(self, request, pk=None):
        """
        Obtiene el contenido asociado a una casilla (pregunta o trivia).
        GET /board-locations/{id}/content/
        """
        try:
            location = self.get_object()
            content = self.service.get_location_content(location)
            return self.success_response(
                content,
                message="Contenido obtenido exitosamente"
            )
        except Exception as e:
            return self.error_response(
                message=f"Error al obtener contenido: {str(e)}"
            )
