from typing import List, Optional, Type, TypeVar, Generic
from django.db.models import Model, QuerySet

T = TypeVar('T', bound=Model)


class BaseRepository(Generic[T]):
    """
    Repositorio base con operaciones CRUD genéricas.
    Cada repositorio específico heredará de esta clase.
    """
    
    def __init__(self, model: Type[T]):
        self.model = model
    
    def get_all(self) -> QuerySet[T]:
        """Obtiene todos los registros del modelo."""
        return self.model.objects.all()
    
    def get_by_id(self, id: int) -> Optional[T]:
        """Obtiene un registro por su ID."""
        try:
            return self.model.objects.get(id=id)
        except self.model.DoesNotExist:
            return None
    
    def filter(self, **kwargs) -> QuerySet[T]:
        """Filtra registros según los parámetros dados."""
        return self.model.objects.filter(**kwargs)
    
    def create(self, **kwargs) -> T:
        """Crea un nuevo registro."""
        return self.model.objects.create(**kwargs)
    
    def update(self, id: int, **kwargs) -> Optional[T]:
        """Actualiza un registro existente por su ID."""
        instance = self.get_by_id(id)
        if instance:
            for key, value in kwargs.items():
                setattr(instance, key, value)
            instance.save()
        return instance
    
    def delete(self, id: int) -> bool:
        """Elimina un registro por su ID."""
        instance = self.get_by_id(id)
        if instance:
            instance.delete()
            return True
        return False
    
    def exists(self, **kwargs) -> bool:
        """Verifica si existe un registro con los parámetros dados."""
        return self.model.objects.filter(**kwargs).exists()
    
    def count(self, **kwargs) -> int:
        """Cuenta los registros que coinciden con los parámetros dados."""
        return self.model.objects.filter(**kwargs).count()
    
    def get_or_create(self, defaults=None, **kwargs):
        """Obtiene o crea un registro."""
        return self.model.objects.get_or_create(defaults=defaults, **kwargs)
