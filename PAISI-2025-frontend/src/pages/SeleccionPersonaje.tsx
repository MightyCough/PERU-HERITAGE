import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJuegoStore, type Personaje } from '../store/useJuegoStore'
import { Button } from '../components/ui/Button'
import { MainLayout, Navbar } from '../components/layout'

// Personajes de ejemplo (temporales hasta que se conecte con el backend)
const personajesEjemplo: Personaje[] = [
    {
        id: '1',
        nombre: 'Científico',
        descripcion: 'Experto en ciencias y matemáticas',
        avatar: '🧑‍🔬',
        habilidadEspecial: 'Doble puntos en preguntas de ciencias'
    },
    {
        id: '2',
        nombre: 'Historiador',
        descripcion: 'Maestro de la historia y cultura',
        avatar: '📚',
        habilidadEspecial: 'Doble puntos en preguntas de historia'
    },
    {
        id: '3',
        nombre: 'Artista',
        descripcion: 'Creativo y conocedor del arte',
        avatar: '🎨',
        habilidadEspecial: 'Doble puntos en preguntas de arte'
    },
    {
        id: '4',
        nombre: 'Deportista',
        descripcion: 'Apasionado por los deportes',
        avatar: '⚽',
        habilidadEspecial: 'Doble puntos en preguntas de deportes'
    }
]

export default function SeleccionPersonaje() {
    const navigate = useNavigate()
    const { seleccionarPersonaje, personajeSeleccionado } = useJuegoStore()
    const [personajes] = useState<Personaje[]>(personajesEjemplo)
    const [selectedId, setSelectedId] = useState<string | null>(
        personajeSeleccionado?.id || null
    )

    useEffect(() => {
        // TODO: Cargar personajes desde la API
        // const cargarPersonajes = async () => {
        //   const data = await personajesService.obtenerPersonajes()
        //   setPersonajes(data)
        // }
        // cargarPersonajes()
    }, [])

    const handleSeleccionar = (personaje: Personaje) => {
        setSelectedId(personaje.id)
        seleccionarPersonaje(personaje)
    }

    const handleContinuar = () => {
        if (personajeSeleccionado) {
            navigate('/juego')
        }
    }

    return (
        <MainLayout>
            <div className="min-h-screen p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold text-white mb-4">
                            Selecciona tu Personaje
                        </h1>
                        <p className="text-xl text-white/90">
                            Cada personaje tiene habilidades especiales únicas
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {personajes.map((personaje) => (
                            <button
                                key={personaje.id}
                                onClick={() => handleSeleccionar(personaje)}
                                className={`bg-white rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${selectedId === personaje.id
                                    ? 'ring-4 ring-yellow-400 shadow-2xl scale-105'
                                    : 'shadow-lg'
                                    }`}
                            >
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="text-6xl">{personaje.avatar}</div>

                                    <h3 className="text-xl font-bold text-gray-800">
                                        {personaje.nombre}
                                    </h3>

                                    <p className="text-sm text-gray-600 text-center">
                                        {personaje.descripcion}
                                    </p>

                                    {personaje.habilidadEspecial && (
                                        <div className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-xs font-medium text-center">
                                            ⭐ {personaje.habilidadEspecial}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => navigate('/')}
                            className="bg-white"
                        >
                            Volver
                        </Button>

                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleContinuar}
                            disabled={!selectedId}
                        >
                            Continuar al Juego →
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
