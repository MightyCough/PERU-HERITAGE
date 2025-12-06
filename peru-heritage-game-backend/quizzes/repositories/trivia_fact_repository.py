from typing import Optional
from django.db.models import QuerySet
from quizzes.models import TriviaFact
from .base import BaseRepository


class TriviaFactRepository(BaseRepository[TriviaFact]):
    """
    Repositorio para operaciones específicas de TriviaFact.
    """
    
    def __init__(self):
        super().__init__(TriviaFact)
    
    def get_by_theme(self, theme: str) -> QuerySet[TriviaFact]:
        """Obtiene todos los datos curiosos de un tema específico."""
        return self.filter(theme=theme, is_active=True)
    
    def get_active_facts(self) -> QuerySet[TriviaFact]:
        """Obtiene todos los datos curiosos activos."""
        return self.filter(is_active=True)
    
    def get_random_fact(self, theme: str = None) -> Optional[TriviaFact]:
        """Obtiene un dato curioso aleatorio, opcionalmente filtrado por tema."""
        queryset = self.get_active_facts()
        if theme:
            queryset = queryset.filter(theme=theme)
        return queryset.order_by('?').first()
    
    def get_facts_by_title(self, title: str) -> QuerySet[TriviaFact]:
        """Busca datos curiosos por título (búsqueda parcial)."""
        return self.filter(title__icontains=title, is_active=True)
    
    def deactivate_fact(self, id: int) -> bool:
        """Desactiva un dato curioso sin eliminarlo."""
        fact = self.get_by_id(id)
        if fact:
            fact.is_active = False
            fact.save()
            return True
        return False
    
    def activate_fact(self, id: int) -> bool:
        """Activa un dato curioso."""
        fact = self.get_by_id(id)
        if fact:
            fact.is_active = True
            fact.save()
            return True
        return False
