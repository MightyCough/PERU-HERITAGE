from rest_framework import serializers
from django.db.models import Model
from typing import TypeVar

T = TypeVar('T', bound=Model)


class BaseModelSerializer(serializers.ModelSerializer):
    """
    Serializador base con funcionalidad común para todos los serializadores.
    Proporciona métodos utilitarios y validaciones comunes.
    """
    
    class Meta:
        model = None
        fields = '__all__'
    
    def validate_positive_integer(self, value: int, field_name: str) -> int:
        """Valida que un valor sea un entero positivo."""
        if value < 0:
            raise serializers.ValidationError(
                f"{field_name} debe ser un número positivo."
            )
        return value
    
    def validate_required_field(self, value, field_name: str):
        """Valida que un campo requerido no esté vacío."""
        if not value:
            raise serializers.ValidationError(
                f"{field_name} es un campo requerido."
            )
        return value
    
    def get_request_user(self):
        """Obtiene el usuario autenticado desde el contexto de la petición."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return request.user
        return None
