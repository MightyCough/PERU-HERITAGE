from rest_framework import viewsets, status
from rest_framework.response import Response
from gameplay.serializers.avatar_serializers import (
    AvatarSerializer,
    AvatarCreateUpdateSerializer,
    AvatarListSerializer,
    AvatarDetailSerializer
)
from gameplay.services.avatar_service import AvatarService

class AvatarViewSet(viewsets.ViewSet):
    """
    Vista para manejar operaciones relacionadas con Avatares.
    """

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = AvatarService()

    def list(self, request):
        """
        Lista todos los avatares disponibles.
        """
        avatars = self.service.get_all_avatars()
        serializer = AvatarListSerializer(avatars, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        """
        Obtiene los detalles de un avatar específico.
        """
        try:
            avatar = self.service.get_avatar_by_name(pk)
            serializer = AvatarDetailSerializer(avatar)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        """
        Crea un nuevo avatar.
        """
        serializer = AvatarCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                avatar = self.service.create_avatar(**serializer.validated_data)
                return Response(AvatarSerializer(avatar).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        """
        Actualiza un avatar existente.
        """
        serializer = AvatarCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                avatar = self.service.update_avatar(pk, **serializer.validated_data)
                return Response(AvatarSerializer(avatar).data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """
        Elimina un avatar existente.
        """
        try:
            self.service.delete_avatar(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)