from typing import List, Optional, Dict, Any
from quizzes.models import TriviaFact
from quizzes.repositories.trivia_fact_repository import TriviaFactRepository
from .base import BaseService


class TriviaFactService(BaseService[TriviaFact]):
    """
    Servicio con lógica de negocio para TriviaFact.
    """
    
    def __init__(self):
        repository = TriviaFactRepository()
        super().__init__(repository)
        self.trivia_repository = repository
    
    def get_by_theme(self, theme: str) -> List[TriviaFact]:
        """Obtiene todos los datos curiosos activos de un tema."""
        return list(self.trivia_repository.get_by_theme(theme))
    
    def get_random_fact(self, theme: str = None) -> Optional[TriviaFact]:
        """Obtiene un dato curioso aleatorio."""
        return self.trivia_repository.get_random_fact(theme)
    
    def search_by_title(self, title: str) -> List[TriviaFact]:
        """Busca datos curiosos por título."""
        return list(self.trivia_repository.get_facts_by_title(title))
    
    def deactivate(self, id: int) -> bool:
        """Desactiva un dato curioso."""
        return self.trivia_repository.deactivate_fact(id)
    
    def activate(self, id: int) -> bool:
        """Activa un dato curioso."""
        return self.trivia_repository.activate_fact(id)
    
    def validate_create(self, data: Dict[str, Any]) -> None:
        """Validaciones antes de crear un dato curioso."""
        if not data.get('title'):
            raise ValueError("El título es obligatorio.")
        if not data.get('content'):
            raise ValueError("El contenido es obligatorio.")
        if not data.get('theme'):
            raise ValueError("El tema es obligatorio.")
