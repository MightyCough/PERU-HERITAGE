from gameplay.models import Avatar
from .base import BaseRepository
from typing import Optional

class AvatarRepository(BaseRepository):
    model = Avatar
    
    def __init__(self):
        super().__init__(Avatar)
        
    def get_by_name(self, name: str) -> Optional[Avatar]:
        """Obtiene un avatar por su nombre."""
        try:
            return self.model.objects.get(name=name)
        except self.model.DoesNotExist:
            return None
        
    def list_all(self):
        """Lista todos los avatares disponibles."""
        return self.get_all()  # Usar get_all() del BaseRepository
    
    def create_avatar(self, name: str, description: str = "", image_url: str = "") -> Avatar:
        """Crea un nuevo avatar."""
        return self.create(
            name=name,
            description=description,
            image_url=image_url
        )
    
    def update_avatar(self, avatar: Avatar, **kwargs) -> Avatar:
        """Actualiza los detalles de un avatar."""
        for key, value in kwargs.items():
            setattr(avatar, key, value)
        avatar.save()
        return avatar
    
    def delete_avatar(self, avatar: Avatar) -> None:
        """Elimina un avatar."""
        avatar.delete()