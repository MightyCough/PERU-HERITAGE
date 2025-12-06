from rest_framework import serializers
from gameplay.models import GameSession
from .base import BaseModelSerializer
from .board_location_serializer import BoardLocationSerializer
from .avatar_serializers import AvatarSerializer
from django.contrib.auth import get_user_model

class GameSessionSerializer(BaseModelSerializer):
    """
    Serializador básico para GameSession.
    """
    player_email = serializers.EmailField(source='player.email', read_only=True)
    current_position = serializers.IntegerField(
        source='current_location.location_id', 
        read_only=True
    )
    avatar = AvatarSerializer(read_only=True)
    
    class Meta:
        model = GameSession
        fields = [
            'id',
            'player',
            'player_email',
            'current_position',
            'last_dice_roll',
            'is_completed',
            'started_at',
            'completed_at',
            'avatar',  # Agregar avatar al serializer básico
        ]
        read_only_fields = ['player', 'started_at', 'completed_at']


class GameSessionDetailSerializer(BaseModelSerializer):
    """
    Serializador detallado para GameSession (incluye información completa).
    """
    player_email = serializers.EmailField(source='player.email', read_only=True)
    player_username = serializers.CharField(source='player.username', read_only=True)
    current_location = BoardLocationSerializer(read_only=True)
    progress = serializers.SerializerMethodField()
    avatar = AvatarSerializer(read_only=True)
    
    class Meta:
        model = GameSession
        fields = [
            'id',
            'player',
            'player_email',
            'player_username',
            'current_location',
            'last_dice_roll',
            'is_completed',
            'started_at',
            'completed_at',
            'progress',
            'avatar',  # Agregar avatar al serializer detallado
        ]
        read_only_fields = ['player', 'started_at', 'completed_at']
    
    def get_progress(self, obj):
        """Calcula el progreso de la sesión."""
        from gameplay.services import GameSessionService
        service = GameSessionService()
        return service.get_session_progress(obj)


class StartGameSerializer(serializers.Serializer):
    """
    Serializador para iniciar una nueva partida.
    """
    avatar_name = serializers.CharField(required=True, help_text="Nombre del avatar seleccionado")
    
    def validate_avatar_name(self, value):
        """Valida que el avatar_name no esté vacío."""
        if not value or value.strip() == "":
            raise serializers.ValidationError("Debes proporcionar un nombre de avatar válido.")
        return value


class RollDiceSerializer(serializers.Serializer):
    """
    Serializador para tirar el dado y mover al jugador.
    """
    dice_result = serializers.IntegerField(min_value=1, max_value=6)
    
    def validate_dice_result(self, value):
        """Valida que el resultado del dado esté en el rango correcto."""
        if value < 1 or value > 6:
            raise serializers.ValidationError(
                "El resultado del dado debe estar entre 1 y 6."
            )
        return value


class GameSessionUpdateSerializer(serializers.ModelSerializer):
    """
    Serializador para actualizar manualmente una sesión de juego.
    """
    
    class Meta:
        model = GameSession
        fields = ['current_location', 'last_dice_roll', 'is_completed']
    
    def validate_current_location(self, value):
        """Valida que la ubicación exista."""
        if not value:
            raise serializers.ValidationError("La ubicación es requerida.")
        return value
