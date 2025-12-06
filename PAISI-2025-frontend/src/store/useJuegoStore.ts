import { create } from 'zustand'
import { huanucoTrivia } from '../features/curiosidades/components/huanucoData'

// Tipos para personajes
export interface Personaje {
  id: string
  nombre: string
  descripcion: string
  avatar: string
  habilidadEspecial?: string
}

// Tipos para preguntas
export interface Pregunta {
  id: string
  pregunta: string
  opciones: string[]
  respuestaCorrecta: number
  categoria: string
  dificultad: 'facil' | 'medio' | 'dificil'
}

// Tipos para datos curiosos
export interface DatoCurioso {
  id: string
  titulo: string
  contenido: string
  tema: string
  imagen?: string
}

// Tipos para jugadores
export interface Jugador {
  id: string
  nombre: string
  personaje: Personaje
  posicion: number
  puntos: number
  turno: boolean
}

// Estado del juego
interface JuegoState {
  // Datos del juego
  personajeSeleccionado: Personaje | null
  jugadores: Jugador[]
  preguntaActual: Pregunta | null
  datoCuriosoActual: DatoCurioso | null
  mostrarDatoCurioso: boolean
  turnoActual: number
  tableroSize: number
  usedTips: number[]
  
  // Estado de la partida
  juegoIniciado: boolean
  juegoTerminado: boolean
  ganador: Jugador | null
  
  // Dado
  valorDado: number | null
  rodandoDado: boolean
  
  // Acciones
  seleccionarPersonaje: (personaje: Personaje | null) => void
  iniciarJuego: () => void
  lanzarDado: () => number
  moverJugador: (jugadorId: string, nuevaPosicion: number) => void
  cargarPregunta: (pregunta: Pregunta) => void
  cargarDatoCurioso: (dato: DatoCurioso) => void
  cargarTipAleatorio: () => void
  ocultarDatoCurioso: () => void
  responderPregunta: (respuesta: number) => boolean
  siguienteTurno: () => void
  terminarJuego: (ganador: Jugador) => void
  reiniciarJuego: () => void
}

export const useJuegoStore = create<JuegoState>((set, get) => ({
  // Estado inicial
  personajeSeleccionado: null,
  jugadores: [],
  preguntaActual: null,
  datoCuriosoActual: {
    id: 'intro',
    titulo: '¡Bienvenido a Huánuco!',
    contenido: 'Huánuco es conocido como la ciudad con el mejor clima del mundo. ¡Prepárate para explorar su historia!',
    tema: 'General'
  },
  mostrarDatoCurioso: true,
  turnoActual: 0,
  tableroSize: 30, // 30 casillas en el tablero
  usedTips: [],
  
  juegoIniciado: false,
  juegoTerminado: false,
  ganador: null,
  
  valorDado: null,
  rodandoDado: false,
  
  // Implementación de acciones
  seleccionarPersonaje: (personaje: Personaje | null) => {
    set({ personajeSeleccionado: personaje })
  },
  
  iniciarJuego: () => {
    const { personajeSeleccionado } = get()
    
    if (!personajeSeleccionado) {
      console.error('Debe seleccionar un personaje primero')
      return
    }
    
    // Crear jugador principal
    const jugadorPrincipal: Jugador = {
      id: 'player-1',
      nombre: 'Tú',
      personaje: personajeSeleccionado,
      posicion: 0,
      puntos: 0,
      turno: true
    }
    
    // TODO: Agregar jugadores IA o multijugador
    const jugadores = [jugadorPrincipal]
    
    set({
      jugadores,
      juegoIniciado: true,
      juegoTerminado: false,
      ganador: null,
      turnoActual: 0,
      datoCuriosoActual: {
        id: 'intro',
        titulo: '¡Bienvenido a Huánuco!',
        contenido: 'Huánuco es conocido como la ciudad con el mejor clima del mundo. ¡Prepárate para explorar su historia!',
        tema: 'General'
      },
      mostrarDatoCurioso: true
    })
  },
  
  lanzarDado: () => {
    set({ rodandoDado: true })
    
    // Simular tiempo de lanzamiento
    setTimeout(() => {
      const valor = Math.floor(Math.random() * 6) + 1
      set({ valorDado: valor, rodandoDado: false })
    }, 500)
    
    return get().valorDado || 1
  },
  
  moverJugador: (jugadorId: string, nuevaPosicion: number) => {
    const { jugadores, tableroSize } = get()
    
    const jugadoresActualizados = jugadores.map(jugador => {
      if (jugador.id === jugadorId) {
        const posicionFinal = Math.min(nuevaPosicion, tableroSize - 1)
        
        // Verificar si ganó
        if (posicionFinal >= tableroSize - 1) {
          set({ juegoTerminado: true, ganador: jugador })
        }
        
        return { ...jugador, posicion: posicionFinal }
      }
      return jugador
    })
    
    set({ jugadores: jugadoresActualizados })
  },
  
  cargarPregunta: (pregunta: Pregunta) => {
    set({ preguntaActual: pregunta })
  },
  cargarDatoCurioso: (dato: DatoCurioso) => {
    set({ datoCuriosoActual: dato, mostrarDatoCurioso: true })
  },
  cargarTipAleatorio: () => {
    const { usedTips } = get()
    
    // Obtener tips disponibles
    let availableTips = huanucoTrivia.filter(tip => !usedTips.includes(tip.id))
    
    // Si no hay tips disponibles, resetear la lista
    if (availableTips.length === 0) {
      set({ usedTips: [] })
      availableTips = huanucoTrivia
    }
    
    // Seleccionar un tip aleatorio
    const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)]
    
    // Convertir tip a DatoCurioso
    const datoCurioso: DatoCurioso = {
      id: `tip-${randomTip.id}`,
      titulo: randomTip.title,
      contenido: randomTip.content,
      tema: randomTip.theme,
      imagen: (randomTip as any).image || undefined
    }
    
    // Actualizar estado
    set({
      datoCuriosoActual: datoCurioso,
      mostrarDatoCurioso: true,
      usedTips: [...usedTips, randomTip.id]
    })
  },
  ocultarDatoCurioso: () => {
    set({ mostrarDatoCurioso: false })
  },
  responderPregunta: (respuesta: number) => {
    const { preguntaActual, jugadores, turnoActual } = get()
    
    if (!preguntaActual) return false
    
    const esCorrecto = respuesta === preguntaActual.respuestaCorrecta
    
    if (esCorrecto) {
      // Sumar puntos al jugador actual
      const jugadoresActualizados = jugadores.map((jugador, index) => {
        if (index === turnoActual) {
          return { ...jugador, puntos: jugador.puntos + 10 }
        }
        return jugador
      })
      
      set({ jugadores: jugadoresActualizados })
    }
    
    // Limpiar pregunta
    set({ preguntaActual: null })
    
    return esCorrecto
  },
  
  siguienteTurno: () => {
    const { jugadores, turnoActual } = get()
    
    const nuevoTurno = (turnoActual + 1) % jugadores.length
    
    const jugadoresActualizados = jugadores.map((jugador, index) => ({
      ...jugador,
      turno: index === nuevoTurno
    }))
    
    set({
      turnoActual: nuevoTurno,
      jugadores: jugadoresActualizados,
      valorDado: null
    })
  },
  
  terminarJuego: (ganador: Jugador) => {
    set({
      juegoTerminado: true,
      ganador
    })
  },
  
  reiniciarJuego: () => {
    set({
      jugadores: [],
      preguntaActual: null,
      datoCuriosoActual: null,
      mostrarDatoCurioso: false,
      turnoActual: 0,
      juegoIniciado: false,
      juegoTerminado: false,
      ganador: null,
      valorDado: null,
      rodandoDado: false,
      usedTips: []
    })
  }
}))
