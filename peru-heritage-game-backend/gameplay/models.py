from django.db import models
from django.conf import settings
from quizzes.models import Question, TriviaFact
from .options import LOCATION_TYPE_CHOICES

# Modelo de la Casilla (Location) del Tablero
class BoardLocation(models.Model):
    # ID secuencial para definir la posición en el "caminito"
    location_id = models.PositiveSmallIntegerField(unique=True, verbose_name="ID de Posición")
    name = models.CharField(max_length=100, verbose_name="Nombre de la Casilla")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción de la Casilla")
    type = models.CharField(max_length=20, choices=LOCATION_TYPE_CHOICES, default='TRIVIA')
    # Una casilla puede tener una Question o un TriviaFact, o ninguno.
    related_question = models.ForeignKey(Question, on_delete=models.SET_NULL, blank=True, null=True, verbose_name="Pregunta asociada (si aplica)")
    related_trivia = models.ForeignKey(TriviaFact, on_delete=models.SET_NULL, blank=True, null=True, verbose_name="Dato Curioso asociado (si aplica)")

    class Meta:
        verbose_name = "Casilla del Tablero"
        verbose_name_plural = "Casillas del Tablero"
        ordering = ['location_id'] # Ordenar por posición

    def __str__(self):
        return f"Pos. {self.location_id}: {self.name} ({self.get_type_display()})"


# Modelo para los Avatares
class Avatar(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Nombre del Avatar")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción del Avatar")
    image_url = models.URLField(max_length=200, blank=True, null=True, verbose_name="URL de la Imagen")

    class Meta:
        verbose_name = "Avatar"
        verbose_name_plural = "Avatares"

    def __str__(self):
        return self.name

# Modelo de la Sesión de Juego (Estado de la Partida del Jugador)
class GameSession(models.Model):
    # Enlace al usuario (CustomUser definido en la app 'users')
    player = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='game_session')    
    # Posición actual en el tablero
    current_location = models.ForeignKey(BoardLocation, on_delete=models.PROTECT, related_name='sessions_at_location')
    # Registro de dados tirados (podría ser útil para la auditoría)
    last_dice_roll = models.PositiveSmallIntegerField(default=0)
    # Estado de la partida
    is_completed = models.BooleanField(default=False)
    
    # Tiempos
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    # Relación con el modelo Avatar
    avatar = models.ForeignKey(Avatar, on_delete=models.SET_NULL, blank=True, null=True, verbose_name="Avatar Seleccionado")

    class Meta:
        verbose_name = "Sesión de Juego"
        verbose_name_plural = "Sesiones de Juego"

    def __str__(self):
        return f"Sesión de {self.player.email} en posición {self.current_location.location_id} con avatar {self.avatar}"