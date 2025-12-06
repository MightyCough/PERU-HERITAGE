from rest_framework import serializers
from quizzes.models import Question
from .base import BaseModelSerializer


class QuestionSerializer(BaseModelSerializer):
    """
    Serializador para el modelo Question.
    Incluye las respuestas relacionadas.
    """
    
    theme_display = serializers.CharField(source='get_theme_display', read_only=True)
    answers = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'points', 'theme', 'theme_display', 'is_active', 'answers']
        read_only_fields = ['id', 'theme_display']
    
    def get_answers(self, obj):
        """Obtiene las respuestas asociadas a la pregunta."""
        from .answer_serializer import AnswerSerializer
        return AnswerSerializer(obj.answers.all(), many=True).data
    
    def validate_text(self, value):
        """Valida que el texto no esté vacío."""
        return self.validate_required_field(value, "Texto de la pregunta")
    
    def validate_points(self, value):
        """Valida que los puntos sean positivos."""
        return self.validate_positive_integer(value, "Puntos")


class QuestionCreateUpdateSerializer(BaseModelSerializer):
    """
    Serializador para crear y actualizar Question.
    """
    
    class Meta:
        model = Question
        fields = ['text', 'points', 'theme', 'is_active']
    
    def validate_text(self, value):
        """Valida que el texto no esté vacío."""
        if not value or not value.strip():
            raise serializers.ValidationError("El texto de la pregunta es obligatorio.")
        return value.strip()
    
    def validate_points(self, value):
        """Valida que los puntos sean positivos."""
        if value < 0:
            raise serializers.ValidationError("Los puntos no pueden ser negativos.")
        return value
