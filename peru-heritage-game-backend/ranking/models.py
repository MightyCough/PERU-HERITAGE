from django.db import models
from django.conf import settings
from quizzes.models import Question
from gameplay.models import BoardLocation # Opcional, pero útil para contexto
from .options import EVENT_TYPE_CHOICES

# Modelo 1: ScoreEvent (Registro de cada movimiento de puntos)
class ScoreEvent(models.Model):
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='score_events')
    event_type = models.CharField(max_length=30, choices=EVENT_TYPE_CHOICES, verbose_name="Tipo de Evento")
    points_awarded = models.IntegerField(verbose_name="Puntos otorgados/restados" ) # Puede ser negativo
    timestamp = models.DateTimeField(auto_now_add=True)
    # Contexto del evento (para saber dónde ocurrió)
    related_question = models.ForeignKey(Question, on_delete=models.SET_NULL, blank=True, null=True)
    related_location = models.ForeignKey(BoardLocation, on_delete=models.SET_NULL, blank=True, null=True)
    class Meta:
        verbose_name = "Evento de Puntuación"
        verbose_name_plural = "Eventos de Puntuación"
        ordering = ['-timestamp'] # Ordenar por más reciente

    def __str__(self):
        sign = "+" if self.points_awarded >= 0 else ""
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {self.player.email} -> {sign}{self.points_awarded} pts"


# Modelo 2: PlayerScore (Puntuación total consolidada)
# El modelo que se consulta para generar el Ranking (optimizado para velocidad).
class PlayerScore(models.Model):
    player = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='total_score')
    total_points = models.PositiveIntegerField(default=0, verbose_name="Puntos Totales Acumulados")
    games_completed = models.PositiveSmallIntegerField(default=0, verbose_name="Juegos Completados")
    last_updated = models.DateTimeField(auto_now=True)  # Última vez que se actualizó el puntaje

    class Meta:
        verbose_name = "Puntuación de Jugador"
        verbose_name_plural = "Puntuaciones de Jugadores"
        ordering = ['-total_points', 'last_updated'] # Ranking: de mayor a menor puntaje

    def __str__(self):
        return f"Ranking: {self.player.email} con {self.total_points} puntos"