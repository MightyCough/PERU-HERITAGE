"""
Script para poblar el tablero de juego con ubicaciones, preguntas y trivias
sobre el patrimonio cultural peruano, especialmente los Negritos de Huánuco.

Para ejecutar este script:
python populate_board.py
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from gameplay.models import BoardLocation, Avatar, GameSession
from quizzes.models import Question, Answer, TriviaFact


def clear_existing_data():
    """Limpia los datos existentes para evitar duplicados."""
    print("🗑️  Limpiando datos existentes...")
    # Eliminar sesiones primero para evitar ProtectedError
    GameSession.objects.all().delete()
    BoardLocation.objects.all().delete()
    Question.objects.all().delete()
    TriviaFact.objects.all().delete()
    Avatar.objects.all().delete()
    print("✅ Datos limpiados correctamente\n")


def create_avatars():
    """Crea los avatares disponibles para los jugadores."""
    print("🎭 Creando avatares...")
    avatars_data = [
        {
            'name': 'Negritos de Huánuco',
            'description': 'Un valiente aventurero listo para explorar la historia del Perú.',
            'image_url': '/personajes/negrito.png'  # ✅ Corregido
        },
        {
            'name': 'Inca',
            'description': 'Maestro de la historia del imperio incaico y sus tradiciones.',
            'image_url': '/personajes/inca.png'  # ✅ Corregido
        },
        {
            'name': 'Chullachaqui',
            'description': 'Guardián de la selva amazónica y conocedor de sus misterios.',
            'image_url': '/personajes/chullachaqui.png'  # ✅ Corregido
        },
    ]
    
    for avatar_data in avatars_data:
        avatar = Avatar.objects.create(**avatar_data)
        print(f"  ✓ Avatar creado: {avatar.name}")
    
    print(f"✅ {len(avatars_data)} avatares creados\n")


def create_questions_and_answers():
    """Crea preguntas de trivia con sus respuestas."""
    print("❓ Creando preguntas y respuestas...")
    
    questions_data = [
        {
            'text': '¿En qué región del Perú se celebra la danza de los Negritos?',
            'theme': 'NEGRITOS',
            'points': 10,
            'answers': [
                {'text': 'Huánuco', 'is_correct': True},
                {'text': 'Cusco', 'is_correct': False},
                {'text': 'Arequipa', 'is_correct': False},
                {'text': 'Lima', 'is_correct': False},
            ]
        },
        {
            'text': '¿Cuándo se celebra principalmente la danza de los Negritos?',
            'theme': 'NEGRITOS',
            'points': 10,
            'answers': [
                {'text': 'Durante las fiestas de Navidad y Año Nuevo', 'is_correct': True},
                {'text': 'En Semana Santa', 'is_correct': False},
                {'text': 'Durante el Carnaval', 'is_correct': False},
                {'text': 'En Fiestas Patrias', 'is_correct': False},
            ]
        },
        {
            'text': '¿Qué representa la danza de los Negritos de Huánuco?',
            'theme': 'NEGRITOS',
            'points': 15,
            'answers': [
                {'text': 'La adoración al Niño Jesús y la herencia afrodescendiente', 'is_correct': True},
                {'text': 'Una batalla histórica', 'is_correct': False},
                {'text': 'La cosecha de productos agrícolas', 'is_correct': False},
                {'text': 'Un ritual incaico', 'is_correct': False},
            ]
        },
        {
            'text': '¿Qué ciudad fue la capital del Imperio Inca?',
            'theme': 'INCAS',
            'points': 10,
            'answers': [
                {'text': 'Cusco', 'is_correct': True},
                {'text': 'Lima', 'is_correct': False},
                {'text': 'Huánuco', 'is_correct': False},
                {'text': 'Arequipa', 'is_correct': False},
            ]
        },
        {
            'text': '¿Cómo se llamaba el emperador inca más famoso?',
            'theme': 'INCAS',
            'points': 10,
            'answers': [
                {'text': 'Pachacútec', 'is_correct': True},
                {'text': 'Atahualpa', 'is_correct': False},
                {'text': 'Manco Cápac', 'is_correct': False},
                {'text': 'Túpac Yupanqui', 'is_correct': False},
            ]
        },
        {
            'text': '¿Qué significa "Machu Picchu" en quechua?',
            'theme': 'INCAS',
            'points': 15,
            'answers': [
                {'text': 'Montaña Vieja', 'is_correct': True},
                {'text': 'Ciudad Sagrada', 'is_correct': False},
                {'text': 'Templo del Sol', 'is_correct': False},
                {'text': 'Fortaleza Imperial', 'is_correct': False},
            ]
        },
        {
            'text': '¿En qué año fue descubierta Machu Picchu por Hiram Bingham?',
            'theme': 'INCAS',
            'points': 15,
            'answers': [
                {'text': '1911', 'is_correct': True},
                {'text': '1850', 'is_correct': False},
                {'text': '1925', 'is_correct': False},
                {'text': '1890', 'is_correct': False},
            ]
        },
        {
            'text': '¿Qué sitio arqueológico de Huánuco es conocido como "Pampa de los Incas"?',
            'theme': 'HUANUCO_GENERAL',
            'points': 15,
            'answers': [
                {'text': 'Huánuco Pampa', 'is_correct': True},
                {'text': 'Kotosh', 'is_correct': False},
                {'text': 'Tantamayo', 'is_correct': False},
                {'text': 'Lauricocha', 'is_correct': False},
            ]
        },
        {
            'text': '¿Cuál es la línea de investigación del "Templo de las Manos Cruzadas"?',
            'theme': 'HUANUCO_GENERAL',
            'points': 20,
            'answers': [
                {'text': 'Kotosh', 'is_correct': True},
                {'text': 'Chavín de Huántar', 'is_correct': False},
                {'text': 'Caral', 'is_correct': False},
                {'text': 'Sechín', 'is_correct': False},
            ]
        },
        {
            'text': '¿Qué plato típico peruano fue declarado Patrimonio Cultural de la Nación?',
            'theme': 'PERU_GENERAL',
            'points': 10,
            'answers': [
                {'text': 'El ceviche', 'is_correct': True},
                {'text': 'El lomo saltado', 'is_correct': False},
                {'text': 'El ají de gallina', 'is_correct': False},
                {'text': 'El tacu tacu', 'is_correct': False},
            ]
        },
        {
            'text': '¿Cuál es la danza peruana más antigua registrada?',
            'theme': 'PERU_GENERAL',
            'points': 15,
            'answers': [
                {'text': 'La Diablada de Puno', 'is_correct': False},
                {'text': 'La Marinera', 'is_correct': False},
                {'text': 'Los Negritos de Huánuco', 'is_correct': True},
                {'text': 'El Huayno', 'is_correct': False},
            ]
        },
        {
            'text': '¿Cuántas lenguas originarias se hablan actualmente en Perú?',
            'theme': 'PERU_GENERAL',
            'points': 20,
            'answers': [
                {'text': 'Más de 40', 'is_correct': True},
                {'text': 'Solo el Quechua y Aymara', 'is_correct': False},
                {'text': 'Alrededor de 10', 'is_correct': False},
                {'text': 'Más de 100', 'is_correct': False},
            ]
        },
        {
            'text': '¿Qué montaña de Huánuco tiene la forma de una mujer recostada?',
            'theme': 'HUANUCO_GENERAL',
            'points': 15,
            'answers': [
                {'text': 'La Bella Durmiente', 'is_correct': True},
                {'text': 'El Huascarán', 'is_correct': False},
                {'text': 'Yerupajá', 'is_correct': False},
                {'text': 'San Cristóbal', 'is_correct': False},
            ]
        },
        {
            'text': '¿Cuál es el río más largo del mundo que nace en Perú?',
            'theme': 'PERU_GENERAL',
            'points': 15,
            'answers': [
                {'text': 'El Amazonas', 'is_correct': True},
                {'text': 'El Nilo', 'is_correct': False},
                {'text': 'El Marañón', 'is_correct': False},
                {'text': 'El Ucayali', 'is_correct': False},
            ]
        },
    ]
    
    created_questions = []
    for q_data in questions_data:
        answers_data = q_data.pop('answers')
        question = Question.objects.create(**q_data)
        
        for a_data in answers_data:
            Answer.objects.create(question=question, **a_data)
        
        created_questions.append(question)
        print(f"  ✓ Pregunta creada: {question.text[:60]}...")
    
    print(f"✅ {len(created_questions)} preguntas creadas con sus respuestas\n")
    return created_questions


def create_trivia_facts():
    """Crea datos curiosos (Sabías que...)."""
    print("💡 Creando datos curiosos...")
    
    trivia_data = [
        {
            'title': 'Origen de los Negritos',
            'content': '¿Sabías que la danza de los Negritos de Huánuco tiene su origen en la época colonial? Representa la fusión de tradiciones africanas traídas por esclavos y costumbres andinas locales.',
            'theme': 'NEGRITOS',
        },
        {
            'title': 'Instrumentos tradicionales',
            'content': '¿Sabías que los Negritos utilizan instrumentos como la tinya, el arpa y el violín? La música es una parte esencial de la danza y puede durar varios días durante las festividades.',
            'theme': 'NEGRITOS',
        },
        {
            'title': 'Vestimenta característica',
            'content': '¿Sabías que los danzantes de Negritos visten trajes coloridos con espejos, cascabeles y máscaras negras? Cada elemento tiene un significado cultural e histórico específico.',
            'theme': 'NEGRITOS',
        },
        {
            'title': 'El Qhapaq Ñan',
            'content': '¿Sabías que el Qhapaq Ñan o Camino Inca tiene más de 30,000 kilómetros de extensión? Conectaba todo el imperio desde Colombia hasta Argentina y fue declarado Patrimonio de la Humanidad.',
            'theme': 'INCAS',
        },
        {
            'title': 'Arquitectura sin cemento',
            'content': '¿Sabías que los incas construyeron sus edificaciones sin usar cemento? Las piedras estaban tan perfectamente talladas que encajaban con precisión milimétrica, resistiendo terremotos por siglos.',
            'theme': 'INCAS',
        },
        {
            'title': 'El sistema de quipus',
            'content': '¿Sabías que los incas no tenían escritura convencional? Usaban quipus, un sistema de cuerdas con nudos de colores para llevar registros administrativos, censo y cálculos matemáticos.',
            'theme': 'INCAS',
        },
        {
            'title': 'Kotosh - El templo más antiguo',
            'content': '¿Sabías que el Templo de las Manos Cruzadas en Kotosh, Huánuco, tiene más de 4,000 años de antigüedad? Es uno de los templos más antiguos de América.',
            'theme': 'HUANUCO_GENERAL',
        },
        {
            'title': 'Biodiversidad peruana',
            'content': '¿Sabías que Perú es uno de los 10 países megadiversos del mundo? Alberga el 70% de la biodiversidad mundial en solo el 2% del territorio terrestre.',
            'theme': 'PERU_GENERAL',
        },
        {
            'title': 'La papa peruana',
            'content': '¿Sabías que en Perú existen más de 3,000 variedades de papa? Este tubérculo es originario de los Andes peruanos y fue domesticado hace más de 8,000 años.',
            'theme': 'PERU_GENERAL',
        },
        {
            'title': 'Líneas de Nazca',
            'content': '¿Sabías que las Líneas de Nazca fueron creadas entre el 500 a.C. y el 500 d.C.? Estas geoglifos gigantes solo pueden ser apreciados completamente desde el aire.',
            'theme': 'PERU_GENERAL',
        },
    ]
    
    created_trivias = []
    for t_data in trivia_data:
        trivia = TriviaFact.objects.create(**t_data)
        created_trivias.append(trivia)
        print(f"  ✓ Trivia creada: {trivia.title}")
    
    print(f"✅ {len(created_trivias)} datos curiosos creados\n")
    return created_trivias


def create_board_locations(questions, trivias):
    """Crea las ubicaciones del tablero con sus contenidos asociados."""
    print("🎲 Creando ubicaciones del tablero...")
    
    # Definir el tablero con 30 casillas
    board_data = [
        # Casilla 1: INICIO
        {
            'location_id': 1,
            'name': 'Inicio del Viaje',
            'description': '¡Comienza tu aventura por el patrimonio peruano!',
            'type': 'START',
        },
        # Casillas 2-29: Mezcla de preguntas y trivias
        {
            'location_id': 2,
            'name': 'Conociendo los Negritos',
            'description': 'Primera parada en tu viaje cultural',
            'type': 'TRIVIA',
            'related_trivia': trivias[0],  # Origen de los Negritos
        },
        {
            'location_id': 3,
            'name': 'Desafío Cultural',
            'description': 'Pon a prueba tus conocimientos',
            'type': 'QUESTION',
            'related_question': questions[0],  # Pregunta sobre Negritos
        },
        {
            'location_id': 4,
            'name': 'Rincón Musical',
            'description': 'Descubre los instrumentos tradicionales',
            'type': 'TRIVIA',
            'related_trivia': trivias[1],  # Instrumentos tradicionales
        },
        {
            'location_id': 5,
            'name': 'Test de Tradiciones',
            'description': '¿Cuánto sabes de las festividades?',
            'type': 'QUESTION',
            'related_question': questions[1],  # Cuándo se celebra
        },
        {
            'location_id': 6,
            'name': '¡Bonificación!',
            'description': 'Avanza 2 casillas adicionales',
            'type': 'BONUS',
        },
        {
            'location_id': 7,
            'name': 'Vestimentas Coloridas',
            'description': 'Aprende sobre el atuendo tradicional',
            'type': 'TRIVIA',
            'related_trivia': trivias[2],  # Vestimenta
        },
        {
            'location_id': 8,
            'name': 'Desafío Negritos',
            'description': '¿Conoces el significado de la danza?',
            'type': 'QUESTION',
            'related_question': questions[2],  # Qué representa
        },
        {
            'location_id': 9,
            'name': 'Camino Inca',
            'description': 'Descubre el Qhapaq Ñan',
            'type': 'TRIVIA',
            'related_trivia': trivias[3],  # Qhapaq Ñan
        },
        {
            'location_id': 10,
            'name': 'Quiz Inca',
            'description': 'Demuestra tus conocimientos sobre los Incas',
            'type': 'QUESTION',
            'related_question': questions[3],  # Capital del Imperio
        },
        {
            'location_id': 11,
            'name': 'Arquitectura Milenaria',
            'description': 'El secreto de las construcciones incas',
            'type': 'TRIVIA',
            'related_trivia': trivias[4],  # Arquitectura sin cemento
        },
        {
            'location_id': 12,
            'name': 'Desafío Imperial',
            'description': '¿Quién fue el emperador más importante?',
            'type': 'QUESTION',
            'related_question': questions[4],  # Pachacútec
        },
        {
            'location_id': 13,
            'name': 'La Bella Durmiente',
            'description': 'Icono natural de Tingo María',
            'type': 'QUESTION',
            'related_question': questions[12],  # La Bella Durmiente
        },
        {
            'location_id': 14,
            'name': 'Los Quipus',
            'description': 'El sistema de registro incaico',
            'type': 'TRIVIA',
            'related_trivia': trivias[5],  # Sistema de quipus
        },
        {
            'location_id': 15,
            'name': 'Machu Picchu',
            'description': '¿Conoces la ciudadela sagrada?',
            'type': 'QUESTION',
            'related_question': questions[5],  # Significado de Machu Picchu
        },
        {
            'location_id': 16,
            'name': 'Descubrimiento Histórico',
            'description': '¿Cuándo fue redescubierta Machu Picchu?',
            'type': 'QUESTION',
            'related_question': questions[6],  # Año de descubrimiento
        },
        {
            'location_id': 17,
            'name': 'Tesoros de Huánuco',
            'description': 'Conoce Kotosh, el templo más antiguo',
            'type': 'TRIVIA',
            'related_trivia': trivias[6],  # Kotosh
        },
        {
            'location_id': 18,
            'name': 'Quiz Huánuco',
            'description': 'Demuestra tu conocimiento local',
            'type': 'QUESTION',
            'related_question': questions[7],  # Huánuco Pampa
        },
        {
            'location_id': 19,
            'name': 'Manos Cruzadas',
            'description': '¿Dónde se encuentra este templo?',
            'type': 'QUESTION',
            'related_question': questions[8],  # Templo de las Manos Cruzadas
        },
        {
            'location_id': 20,
            'name': '¡Bonificación!',
            'description': 'Gana puntos extra',
            'type': 'BONUS',
        },
        {
            'location_id': 21,
            'name': 'Biodiversidad',
            'description': 'Perú: País megadiverso',
            'type': 'TRIVIA',
            'related_trivia': trivias[7],  # Biodiversidad
        },
        {
            'location_id': 22,
            'name': 'Gastronomía Peruana',
            'description': '¿Cuál es el plato Patrimonio Cultural?',
            'type': 'QUESTION',
            'related_question': questions[9],  # Ceviche
        },
        {
            'location_id': 23,
            'name': 'La Papa Peruana',
            'description': 'El origen del tubérculo más versátil',
            'type': 'TRIVIA',
            'related_trivia': trivias[8],  # Papa peruana
        },
        {
            'location_id': 24,
            'name': 'Danzas Ancestrales',
            'description': '¿Cuál es la danza más antigua?',
            'type': 'QUESTION',
            'related_question': questions[10],  # Danza más antigua
        },
        {
            'location_id': 25,
            'name': 'Líneas de Nazca',
            'description': 'Misterios en el desierto',
            'type': 'TRIVIA',
            'related_trivia': trivias[9],  # Líneas de Nazca
        },
        {
            'location_id': 26,
            'name': 'Lenguas Originarias',
            'description': '¿Cuántas lenguas se hablan en Perú?',
            'type': 'QUESTION',
            'related_question': questions[11],  # Lenguas originarias
        },
        {
            'location_id': 27,
            'name': 'El Gran Río',
            'description': 'Maravilla natural del mundo',
            'type': 'QUESTION',
            'related_question': questions[13],  # Amazonas
        },
        {
            'location_id': 28,
            'name': '¡Casi Llegas!',
            'description': 'Prepárate para el final',
            'type': 'BONUS',
        },
        {
            'location_id': 29,
            'name': 'Última Prueba',
            'description': 'Demuestra todo lo que aprendiste',
            'type': 'QUESTION',
            'related_question': questions[0],  # Repite una pregunta importante
        },
        # Casilla 30: FIN
        {
            'location_id': 30,
            'name': '¡Meta!',
            'description': '¡Felicitaciones! Has completado el viaje por el patrimonio peruano',
            'type': 'END',
        },
    ]
    
    created_locations = []
    for loc_data in board_data:
        location = BoardLocation.objects.create(**loc_data)
        created_locations.append(location)
        type_display = location.get_type_display()
        print(f"  ✓ Casilla {location.location_id}: {location.name} ({type_display})")
    
    print(f"✅ {len(created_locations)} ubicaciones del tablero creadas\n")
    return created_locations


def main():
    """Función principal que ejecuta todo el proceso."""
    print("\n" + "="*60)
    print("🎮 SCRIPT DE POBLACIÓN DEL TABLERO DE JUEGO")
    print("   Peru Heritage Game - Backend")
    print("="*60 + "\n")
    
    try:
        # 1. Limpiar datos existentes
        clear_existing_data()
        
        # 2. Crear avatares
        create_avatars()
        
        # 3. Crear preguntas y respuestas
        questions = create_questions_and_answers()
        
        # 4. Crear datos curiosos (trivias)
        trivias = create_trivia_facts()
        
        # 5. Crear ubicaciones del tablero
        locations = create_board_locations(questions, trivias)
        
        # Resumen final
        print("="*60)
        print("✨ ¡PROCESO COMPLETADO EXITOSAMENTE! ✨")
        print("="*60)
        print(f"\n📊 Resumen:")
        print(f"   • {Avatar.objects.count()} avatares")
        print(f"   • {Question.objects.count()} preguntas")
        print(f"   • {Answer.objects.count()} respuestas")
        print(f"   • {TriviaFact.objects.count()} datos curiosos")
        print(f"   • {BoardLocation.objects.count()} ubicaciones del tablero")
        print(f"\n🎯 El tablero está listo para jugar!\n")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == '__main__':
    exit(main())
