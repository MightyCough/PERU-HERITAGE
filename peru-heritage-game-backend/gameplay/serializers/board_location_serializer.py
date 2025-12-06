from rest_framework import serializers
from gameplay.models import BoardLocation
from quizzes.models import Question, TriviaFact
from .base import BaseModelSerializer


class BoardLocationSerializer(BaseModelSerializer):
    """
    Serializador básico para BoardLocation (lista y creación).
    """
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = BoardLocation
        fields = [
            'id',
            'location_id',
            'name',
            'description',
            'type',
            'type_display',
        ]
    
    def validate_location_id(self, value):
        """Valida que location_id sea positivo."""
        return self.validate_positive_integer(value, 'location_id')


class BoardLocationDetailSerializer(BaseModelSerializer):
    """
    Serializador detallado para BoardLocation (incluye relaciones).
    """
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    # Serializadores anidados para las relaciones
    related_question = serializers.SerializerMethodField()
    related_trivia = serializers.SerializerMethodField()
    
    class Meta:
        model = BoardLocation
        fields = [
            'id',
            'location_id',
            'name',
            'description',
            'type',
            'type_display',
            'related_question',
            'related_trivia',
        ]
    
    def get_related_question(self, obj):
        """Serializa la pregunta relacionada si existe."""
        if obj.related_question:
            return {
                'id': obj.related_question.id,
                'text': obj.related_question.text,
                'points': obj.related_question.points,
                'theme': obj.related_question.theme,
            }
        return None
    
    def get_related_trivia(self, obj):
        """Serializa el dato curioso relacionado si existe."""
        if obj.related_trivia:
            return {
                'id': obj.related_trivia.id,
                'title': obj.related_trivia.title,
                'content': obj.related_trivia.content,
                'theme': obj.related_trivia.theme,
            }
        return None


class BoardLocationCreateUpdateSerializer(BaseModelSerializer):
    """
    Serializador para crear/actualizar BoardLocation.
    """
    
    class Meta:
        model = BoardLocation
        fields = [
            'location_id',
            'name',
            'description',
            'type',
            'related_question',
            'related_trivia',
        ]
    
    def validate(self, data):
        """
        Validación a nivel de objeto:
        - Una casilla no puede tener pregunta y trivia al mismo tiempo
        - Casillas tipo QUESTION deben tener una pregunta
        - Casillas tipo TRIVIA deben tener un dato curioso
        """
        location_type = data.get('type')
        related_question = data.get('related_question')
        related_trivia = data.get('related_trivia')
        
        # No puede tener ambos
        if related_question and related_trivia:
            raise serializers.ValidationError(
                "Una casilla no puede tener una pregunta y un dato curioso al mismo tiempo."
            )
        
        # Validar según el tipo
        if location_type == 'QUESTION' and not related_question:
            raise serializers.ValidationError(
                "Las casillas de tipo QUESTION deben tener una pregunta asociada."
            )
        
        if location_type == 'TRIVIA' and not related_trivia:
            raise serializers.ValidationError(
                "Las casillas de tipo TRIVIA deben tener un dato curioso asociado."
            )
        
        return data
