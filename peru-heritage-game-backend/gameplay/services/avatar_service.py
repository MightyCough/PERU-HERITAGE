from gameplay.models import Avatar
from gameplay.repositories.avatar_repository import AvatarRepository
from django.core.exceptions import ValidationError

class AvatarService:
    """
    Servicio para manejar la lógica de negocio relacionada con los avatares.
    """

    def __init__(self):
        self.repository = AvatarRepository()

    def get_all_avatars(self):
        """
        Obtiene todos los avatares disponibles.
        """
        return self.repository.list_all()

    def get_avatar_by_name(self, name: str) -> Avatar:
        """
        Obtiene un avatar por su nombre.
        Lanza una excepción si el avatar no existe.
        """
        avatar = self.repository.get_by_name(name)
        if not avatar:
            raise ValidationError(f"El avatar con el nombre '{name}' no existe.")
        return avatar

    def create_avatar(self, name: str, description: str = "", image_url: str = "") -> Avatar:
        """
        Crea un nuevo avatar.
        Lanza una excepción si el nombre ya existe.
        """
        if self.repository.get_by_name(name):
            raise ValidationError(f"El avatar con el nombre '{name}' ya existe.")
        return self.repository.create_avatar(name=name, description=description, image_url=image_url)

    def update_avatar(self, name: str, **kwargs) -> Avatar:
        """
        Actualiza un avatar existente.
        Lanza una excepción si el avatar no existe.
        """
        avatar = self.get_avatar_by_name(name)
        return self.repository.update_avatar(avatar, **kwargs)

    def delete_avatar(self, name: str) -> None:
        """
        Elimina un avatar por su nombre.
        Lanza una excepción si el avatar no existe.
        """
        avatar = self.get_avatar_by_name(name)
        self.repository.delete_avatar(avatar)
