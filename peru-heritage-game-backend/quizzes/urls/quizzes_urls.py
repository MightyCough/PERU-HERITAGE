from django.urls import path
from quizzes.views.trivia_fact_view import TriviaFactViewSet
from quizzes.views.question_view import QuestionViewSet
from quizzes.views.answer_view import AnswerViewSet

app_name = 'quizzes'

urlpatterns = [
    # Rutas para TriviaFact (Datos Curiosos)
    path('datos-curiosos/', TriviaFactViewSet.as_view({'get': 'list', 'post': 'create'}), name='lista-creacion-datos-curiosos'),
    path('datos-curiosos/<int:pk>/', TriviaFactViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='detalle-dato-curioso'),
    path('datos-curiosos/tema/<str:theme>/', TriviaFactViewSet.as_view({'get': 'by_theme'}), name='datos-curiosos-por-tema'),
    path('datos-curiosos/random/', TriviaFactViewSet.as_view({'get': 'random'}), name='dato-curioso-aleatorio'),
    path('datos-curiosos/<int:pk>/desactivar/', TriviaFactViewSet.as_view({'patch': 'deactivate'}), name='desactivar-dato-curioso'),
    path('datos-curiosos/<int:pk>/activar/', TriviaFactViewSet.as_view({'patch': 'activate'}), name='activar-dato-curioso'),
    
    # Rutas para Question (Preguntas)
    path('preguntas/', QuestionViewSet.as_view({'get': 'list', 'post': 'create'}), name='lista-creacion-preguntas'),
    path('preguntas/<int:pk>/', QuestionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='detalle-pregunta'),
    path('preguntas/tema/<str:theme>/', QuestionViewSet.as_view({'get': 'by_theme'}), name='preguntas-por-tema'),
    path('preguntas/random/', QuestionViewSet.as_view({'get': 'random'}), name='pregunta-aleatoria'),
    path('preguntas/con-respuestas/', QuestionViewSet.as_view({'get': 'with_answers'}), name='preguntas-con-respuestas'),
    path('preguntas/<int:pk>/validar-respuesta/', QuestionViewSet.as_view({'post': 'validate_answer'}), name='validar-respuesta'),
    path('preguntas/<int:pk>/desactivar/', QuestionViewSet.as_view({'patch': 'deactivate'}), name='desactivar-pregunta'),
    path('preguntas/<int:pk>/activar/', QuestionViewSet.as_view({'patch': 'activate'}), name='activar-pregunta'),
    
    # Rutas para Answer (Respuestas)
    path('respuestas/', AnswerViewSet.as_view({'get': 'list', 'post': 'create'}), name='lista-creacion-respuestas'),
    path('respuestas/<int:pk>/', AnswerViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='detalle-respuesta'),
    path('respuestas/pregunta/<int:question_id>/', AnswerViewSet.as_view({'get': 'by_question'}), name='respuestas-por-pregunta'),
    path('respuestas/correcta/<int:question_id>/', AnswerViewSet.as_view({'get': 'correct_answer'}), name='respuesta-correcta'),
    path('respuestas/<int:pk>/validar/', AnswerViewSet.as_view({'get': 'validate'}), name='validar-respuesta-id'),
]
