from rest_framework import serializers
from quizzes.models import Answer
from .base import BaseModelSerializer


class AnswerSerializer(BaseModelSerializer):
    """
    Serializador para el modelo Answer.
    """
    
    class Meta:
        model = Answer
        fields = ['id', 'question', 'text', 'is_correct']
        read_only_fields = ['id']
    
    def validate_text(self, value):
        """Valida que el texto no esté vacío."""
        return self.validate_required_field(value, "Texto de la respuesta")


class AnswerCreateUpdateSerializer(BaseModelSerializer):
    """
    Serializador para crear y actualizar Answer.
    """
    
    class Meta:
        model = Answer
        fields = ['question', 'text', 'is_correct']
    
    def validate_text(self, value):
        """Valida que el texto no esté vacío."""
        if not value or not value.strip():
            raise serializers.ValidationError("El texto de la respuesta es obligatorio.")
        return value.strip()
    
    def validate(self, attrs):
        """Validaciones adicionales."""
        # Verificar que la pregunta existe
        question = attrs.get('question')
        if not question:
            raise serializers.ValidationError("Debe especificar una pregunta.")
        
        return attrs
