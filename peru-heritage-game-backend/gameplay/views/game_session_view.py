from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from gameplay.models import GameSession
from gameplay.services import GameSessionService
from gameplay.serializers import (
    GameSessionSerializer,
    GameSessionDetailSerializer,
    StartGameSerializer,
    RollDiceSerializer,
    GameSessionUpdateSerializer
)
from .base import BaseViewSet
from ranking.models import PlayerScore


class GameSessionViewSet(BaseViewSet):
    """
    ViewSet para gestionar las sesiones de juego (GameSession).
    
    Endpoints:
    - GET /game-sessions/ - Lista todas las sesiones
    - GET /game-sessions/{id}/ - Detalle de una sesión
    - POST /game-sessions/start/ - Iniciar nueva partida
    - POST /game-sessions/roll-dice/ - Tirar dado y mover
    - GET /game-sessions/my-session/ - Obtener sesión del usuario autenticado
    - POST /game-sessions/reset/ - Reiniciar partida
    - GET /game-sessions/active/ - Sesiones activas
    - GET /game-sessions/completed/ - Sesiones completadas
    """
    
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = GameSessionService()
    
    def get_permissions(self):
        """
        Personaliza los permisos por acción.
        """
        # Permitir acceso sin autenticación a 'my-session' para que retorne error claro
        if self.action == 'my_session':
            return []
        return super().get_permissions()
    
    def get_serializer_class(self):
        """Selecciona el serializador según la acción."""
        if self.action == 'retrieve':
            return GameSessionDetailSerializer
        elif self.action == 'start_game':
            return StartGameSerializer
        elif self.action == 'roll_dice':
            return RollDiceSerializer
        elif self.action in ['update', 'partial_update']:
            return GameSessionUpdateSerializer
        return GameSessionSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Desactiva la creación directa de sesiones.
        Las sesiones deben crearse usando el endpoint /start/.
        """
        return self.error_response(
            message="No puedes crear una sesión directamente. "
                    "Usa el endpoint /api/gameplay/sesiones-juego/start/ para iniciar una nueva partida.",
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    @action(detail=False, methods=['post'], url_path='start')
    def start_game(self, request):
        """
        Inicia una nueva partida para el usuario autenticado con un avatar seleccionado.
        Si ya existe una sesión activa, la retorna en lugar de crear una nueva.
        POST /game-sessions/start/
        Body: { "avatar_name": "nombre_del_avatar" } (opcional si ya tiene sesión)
        """
        try:
            player = request.user
            
            # Primero verificar si ya tiene una sesión activa
            existing_session = self.service.get_player_session(player)
            if existing_session:
                # Si ya tiene sesión, actualizar el avatar si se proporciona uno nuevo
                avatar_name = request.data.get('avatar_name')
                if avatar_name:
                    from gameplay.services.avatar_service import AvatarService
                    avatar_service = AvatarService()
                    avatar = avatar_service.get_avatar_by_name(avatar_name)
                    if avatar:
                        existing_session.avatar = avatar
                        existing_session.save()
                
                serializer = GameSessionDetailSerializer(existing_session)
                return self.success_response(
                    serializer.data,
                    message="Sesión existente cargada exitosamente",
                    status_code=status.HTTP_200_OK
                )
            
            # Si no tiene sesión, crear una nueva
            avatar_name = request.data.get('avatar_name', 'Default')
            session = self.service.start_new_game(player, avatar_name)
            serializer = GameSessionDetailSerializer(session)
            return self.success_response(
                serializer.data,
                message="Partida iniciada exitosamente",
                status_code=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return self.error_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return self.error_response(
                message=f"Error al iniciar partida: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='roll-dice')
    def roll_dice(self, request):
        """
        Tira el dado y mueve al jugador.
        POST /game-sessions/roll-dice/
        Body: { "dice_result": 1-6 }
        """
        serializer = RollDiceSerializer(data=request.data)
        if not serializer.is_valid():
            return self.error_response(
                message="Datos inválidos",
                errors=serializer.errors
            )
        
        try:
            player = request.user
            dice_result = serializer.validated_data['dice_result']
            session = self.service.roll_dice_and_move(player, dice_result)
            
            response_serializer = GameSessionDetailSerializer(session)
            return self.success_response(
                response_serializer.data,
                message=f"Dado tirado: {dice_result}. Jugador movido exitosamente."
            )
        except ValidationError as e:
            return self.error_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return self.error_response(
                message=f"Error al tirar dado: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='my-session')
    def my_session(self, request):
        """
        Obtiene la sesión del usuario autenticado.
        GET /game-sessions/my-session/
        Retorna 404 si no existe sesión (para que el frontend redirija a selección de personaje)
        """
        try:
            # Verificar que el usuario esté autenticado
            if not request.user or not request.user.is_authenticated:
                return self.error_response(
                    message="Usuario no autenticado. Debes iniciar sesión primero.",
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            player = request.user
            session = self.service.get_player_session(player)
            
            if not session:
                return self.error_response(
                    message="No tienes una sesión activa. Debes seleccionar un avatar primero.",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            serializer = GameSessionDetailSerializer(session)
            return self.success_response(
                serializer.data,
                message="Sesión obtenida exitosamente"
            )
        except Exception as e:
            import traceback
            print(f"❌ Error en my_session: {str(e)}")
            print(traceback.format_exc())
            return self.error_response(
                message=f"Error al obtener sesión: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='reset')
    def reset_game(self, request):
        """
        Reinicia la partida del usuario autenticado.
        POST /game-sessions/reset/
        """
        try:
            player = request.user
            session = self.service.reset_player_game(player)
            serializer = GameSessionDetailSerializer(session)
            return self.success_response(
                serializer.data,
                message="Partida reiniciada exitosamente"
            )
        except Exception as e:
            return self.error_response(
                message=f"Error al reiniciar partida: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='active')
    def active_sessions(self, request):
        """
        Obtiene todas las sesiones activas.
        GET /game-sessions/active/
        """
        try:
            sessions = self.service.get_active_sessions()
            serializer = GameSessionSerializer(sessions, many=True)
            return self.success_response(
                serializer.data,
                message="Sesiones activas obtenidas exitosamente"
            )
        except Exception as e:
            return self.error_response(
                message=f"Error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='completed')
    def completed_sessions(self, request):
        """
        Obtiene todas las sesiones completadas.
        GET /game-sessions/completed/
        """
        try:
            sessions = self.service.get_completed_sessions()
            serializer = GameSessionSerializer(sessions, many=True)
            return self.success_response(
                serializer.data,
                message="Sesiones completadas obtenidas exitosamente"
            )
        except Exception as e:
            return self.error_response(
                message=f"Error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'], url_path='progress')
    def get_progress(self, request, pk=None):
        """
        Obtiene el progreso de una sesión específica.
        GET /game-sessions/{id}/progress/
        """
        try:
            session = self.get_object()
            progress = self.service.get_session_progress(session)
            return self.success_response(
                progress,
                message="Progreso obtenido exitosamente"
            )
        except Exception as e:
            return self.error_response(
                message=f"Error al obtener progreso: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    def perform_update(self, serializer):
        """Método auxiliar para guardar el objeto y asegurar la instancia."""
        # Necesario para que self.get_object() obtenga la instancia actualizada
        serializer.save()
        
    def update(self, request, *args, **kwargs):
        """Sobrescribe PUT/PATCH para devolver la serialización detallada."""
        partial = kwargs.get('partial', False)
        instance = self.get_object()
        
        # 1. Usar GameSessionUpdateSerializer para procesar y validar la entrada
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer) # Guarda la instancia
        
        # 2. Re-serializar la instancia actualizada usando el serializador DETALLADO para la SALIDA
        response_serializer = GameSessionDetailSerializer(instance)
        
        return self.success_response(
            response_serializer.data,
            message="Sesión actualizada exitosamente"
        )

    def partial_update(self, request, *args, **kwargs):
        """Llama a update con partial=True, usando el mismo flujo."""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'], url_path='answer-and-advance')
    def answer_and_advance(self, request):
        """
        Valida una respuesta y avanza automáticamente a la siguiente casilla si es correcta.
        POST /game-sessions/answer-and-advance/
        Body: { 
            "question_id": int, 
            "answer_id": int,
            "response_time": float (segundos, opcional, máximo 15)
        }
        """
        try:
            player = request.user
            question_id = request.data.get('question_id')
            answer_id = request.data.get('answer_id')
            response_time = request.data.get('response_time', 15.0)  # Default 15 segundos
            
            # Validar datos requeridos
            if not question_id or not answer_id:
                return self.error_response(
                    message="Se requieren question_id y answer_id",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar y normalizar el tiempo de respuesta
            try:
                response_time = float(response_time)
                if response_time < 0:
                    response_time = 0
                elif response_time > 15:
                    response_time = 15
            except (ValueError, TypeError):
                response_time = 15.0
            
            # Validar respuesta y avanzar
            result = self.service.answer_question_and_advance(
                player, 
                question_id, 
                answer_id,
                response_time
            )
            
            # Retornar resultado con sesión actualizada
            session_serializer = GameSessionDetailSerializer(result['session'])
            
            # Obtener puntos totales del jugador
            try:
                player_score = PlayerScore.objects.get(player=player)
                total_points = player_score.total_points
            except PlayerScore.DoesNotExist:
                total_points = 0
            
            return self.success_response(
                {
                    'is_correct': result['is_correct'],
                    'points_earned': result['points_earned'],
                    'total_points': total_points,
                    'session': session_serializer.data,
                    'message': result['message']
                },
                message=result['message']
            )
            
        except ValidationError as e:
            return self.error_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return self.error_response(
                message=f"Error al procesar respuesta: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )