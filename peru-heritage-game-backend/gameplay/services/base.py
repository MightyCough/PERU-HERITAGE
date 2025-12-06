from typing import Generic, TypeVar, Optional, List, Dict, Any
from django.db.models import Model
from gameplay.repositories.base import BaseRepository

T = TypeVar('T', bound=Model)


class BaseService(Generic[T]):
    """
    Servicio base con lógica de negocio genérica.
    Cada servicio específico heredará de esta clase y utilizará un repositorio.
    """
    
    def __init__(self, repository: BaseRepository[T]):
        self.repository = repository
    
    def get_all(self) -> List[T]:
        """Obtiene todos los registros."""
        return list(self.repository.get_all())
    
    def get_by_id(self, id: int) -> Optional[T]:
        """Obtiene un registro por su ID."""
        return self.repository.get_by_id(id)
    
    def create(self, data: Dict[str, Any]) -> T:
        """Crea un nuevo registro con validación de negocio."""
        self.validate_create(data)
        return self.repository.create(**data)
    
    def update(self, id: int, data: Dict[str, Any]) -> Optional[T]:
        """Actualiza un registro existente con validación de negocio."""
        self.validate_update(id, data)
        return self.repository.update(id, **data)
    
    def delete(self, id: int) -> bool:
        """Elimina un registro."""
        return self.repository.delete(id)
    
    def exists(self, **kwargs) -> bool:
        """Verifica si existe un registro con los parámetros dados."""
        return self.repository.exists(**kwargs)
    
    def validate_create(self, data: Dict[str, Any]) -> None:
        """
        Validación personalizada antes de crear un registro.
        Sobrescribir en servicios específicos si se necesita validación adicional.
        """
        pass
    
    def validate_update(self, id: int, data: Dict[str, Any]) -> None:
        """
        Validación personalizada antes de actualizar un registro.
        Sobrescribir en servicios específicos si se necesita validación adicional.
        """
        pass
