from django.db import models
from .options import THEME_CHOICES

# Modelo para los datos de "Sabías que..." (informativos, sin respuesta)
class TriviaFact(models.Model):
    title = models.CharField(max_length=200, verbose_name="Título del Dato Curioso")
    content = models.TextField(verbose_name="Contenido (Sabías que...)")
    theme = models.CharField(
        max_length=50, 
        choices=THEME_CHOICES, 
        default='NEGRITOS'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Dato Curioso"
        verbose_name_plural = "Datos Curiosos"

    def __str__(self):
        return f"Dato: {self.title} ({self.get_theme_display()})"


# Modelo para las preguntas de trivia (las que dan puntos)
class Question(models.Model):
    text = models.TextField(verbose_name="Texto de la Pregunta")
    points = models.PositiveSmallIntegerField(
        default=10, 
        verbose_name="Puntos por respuesta correcta"
    )
    theme = models.CharField(
        max_length=50, 
        choices=THEME_CHOICES, 
        default='NEGRITOS'
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Pregunta de Trivia"
        verbose_name_plural = "Preguntas de Trivia"

    def __str__(self):
        return f"Q{self.id}: {self.text[:50]}..."


# Modelo para las respuestas (depende de una Pregunta)
class Answer(models.Model):
    question = models.ForeignKey(
        Question, 
        on_delete=models.CASCADE, 
        related_name='answers' # Nombre para acceder a las respuestas desde la pregunta
    )
    text = models.CharField(max_length=300, verbose_name="Texto de la Respuesta")
    is_correct = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Respuesta"
        verbose_name_plural = "Respuestas"

    def __str__(self):
        return f"{self.text} (Correcta: {self.is_correct})"