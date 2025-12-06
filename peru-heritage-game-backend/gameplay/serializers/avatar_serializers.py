from rest_framework import serializers
from gameplay.models import Avatar

class AvatarSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Avatar.
    """
    class Meta:
        model = Avatar
        fields = ['id', 'name', 'description', 'image_url']
    
class AvatarCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear o actualizar Avatares.
    """
    class Meta:
        model = Avatar
        fields = ['name', 'description', 'image_url']
        
class AvatarListSerializer(serializers.ModelSerializer):
    """
    Serializer para listar Avatares con información básica.
    """
    class Meta:
        model = Avatar
        fields = ['id', 'name', 'image_url']
        
class AvatarDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para ver detalles completos de un Avatar.
    """
    class Meta:
        model = Avatar
        fields = ['id', 'name', 'description', 'image_url']