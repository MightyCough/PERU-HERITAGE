from rest_framework import serializers
from ranking.models import ScoreEvent
from .base import BaseModelSerializer


class ScoreEventSerializer(BaseModelSerializer):
    """
    Serializador para el modelo ScoreEvent.
    """
    
    player_email = serializers.CharField(source='player.email', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    question_text = serializers.CharField(source='related_question.text', read_only=True, allow_null=True)
    location_id = serializers.IntegerField(source='related_location.location_id', read_only=True, allow_null=True)
    
    class Meta:
        model = ScoreEvent
        fields = [
            'id', 'player', 'player_email', 'event_type', 'event_type_display',
            'points_awarded', 'timestamp', 'related_question', 'question_text',
            'related_location', 'location_id'
        ]
        read_only_fields = ['id', 'timestamp', 'player_email', 'event_type_display', 'question_text', 'location_id']
    
    def validate_points_awarded(self, value):
        """Valida que los puntos no sean 0."""
        if value == 0:
            raise serializers.ValidationError("Los puntos otorgados no pueden ser 0.")
        return value


class ScoreEventCreateSerializer(BaseModelSerializer):
    """
    Serializador para crear ScoreEvent.
    """
    
    class Meta:
        model = ScoreEvent
        fields = ['player', 'event_type', 'points_awarded', 'related_question', 'related_location']
    
    def validate_points_awarded(self, value):
        """Valida que los puntos no sean 0."""
        if value == 0:
            raise serializers.ValidationError("Los puntos otorgados no pueden ser 0.")
        return value
    
    def validate(self, attrs):
        """Validaciones adicionales."""
        player = attrs.get('player')
        if not player:
            raise serializers.ValidationError("El jugador es obligatorio.")
        
        event_type = attrs.get('event_type')
        if not event_type:
            raise serializers.ValidationError("El tipo de evento es obligatorio.")
        
        return attrs
