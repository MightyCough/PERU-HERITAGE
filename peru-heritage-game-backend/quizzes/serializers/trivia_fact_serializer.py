from rest_framework import serializers
from quizzes.models import TriviaFact
from .base import BaseModelSerializer


class TriviaFactSerializer(BaseModelSerializer):
    """
    Serializador para el modelo TriviaFact.
    """
    
    theme_display = serializers.CharField(source='get_theme_display', read_only=True)
    
    class Meta:
        model = TriviaFact
        fields = ['id', 'title', 'content', 'theme', 'theme_display', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at', 'theme_display']
    
    def validate_title(self, value):
        """Valida que el título no esté vacío."""
        return self.validate_required_field(value, "Título")
    
    def validate_content(self, value):
        """Valida que el contenido no esté vacío."""
        return self.validate_required_field(value, "Contenido")


class TriviaFactCreateUpdateSerializer(BaseModelSerializer):
    """
    Serializador para crear y actualizar TriviaFact.
    """
    
    class Meta:
        model = TriviaFact
        fields = ['title', 'content', 'theme', 'is_active']
    
    def validate_title(self, value):
        """Valida que el título no esté vacío."""
        if not value or not value.strip():
            raise serializers.ValidationError("El título es obligatorio.")
        return value.strip()
    
    def validate_content(self, value):
        """Valida que el contenido no esté vacío."""
        if not value or not value.strip():
            raise serializers.ValidationError("El contenido es obligatorio.")
        return value.strip()
