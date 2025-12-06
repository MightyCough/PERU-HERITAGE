import { create } from 'zustand'

// Tipos para modales
export type ModalType = 
  | 'personaje-selection'
  | 'pregunta'
  | 'resultado'
  | 'pausa'
  | 'game-over'
  | null

// Tipos para notificaciones
export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

// Estado de UI
interface UIState {
  // Modales
  modalActivo: ModalType
  modalData: any
  
  // Notificaciones
  notifications: Notification[]
  
  // Loading states
  isLoading: boolean
  loadingMessage: string | null
  
  // Audio
  soundEnabled: boolean
  musicEnabled: boolean
  volume: number
  
  // Tema
  theme: 'light' | 'dark'
  
  // Acciones para modales
  openModal: (type: ModalType, data?: any) => void
  closeModal: () => void
  
  // Acciones para notificaciones
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Acciones para loading
  setLoading: (isLoading: boolean, message?: string) => void
  
  // Acciones para audio
  toggleSound: () => void
  toggleMusic: () => void
  setVolume: (volume: number) => void
  
  // Acciones para tema
  toggleTheme: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // Estado inicial
  modalActivo: null,
  modalData: null,
  
  notifications: [],
  
  isLoading: false,
  loadingMessage: null,
  
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.7,
  
  theme: 'light',
  
  // Implementación de acciones
  openModal: (type: ModalType, data?: any) => {
    console.log('🎭 UIStore.openModal llamado:', { type, data })
    set({
      modalActivo: type,
      modalData: data || null
    })
    console.log('✅ UIStore estado actualizado:', { modalActivo: type, modalData: data })
  },
  
  closeModal: () => {
    console.log('🚪 UIStore.closeModal llamado')
    set({
      modalActivo: null,
      modalData: null
    })
  },
  
  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`
    const newNotification: Notification = {
      id,
      ...notification,
      duration: notification.duration || 3000
    }
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }))
    
    // Auto-remover después de la duración especificada
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id)
      }, newNotification.duration)
    }
  },
  
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },
  
  clearNotifications: () => {
    set({ notifications: [] })
  },
  
  setLoading: (isLoading: boolean, message?: string) => {
    set({
      isLoading,
      loadingMessage: message || null
    })
  },
  
  toggleSound: () => {
    set((state) => ({
      soundEnabled: !state.soundEnabled
    }))
  },
  
  toggleMusic: () => {
    set((state) => ({
      musicEnabled: !state.musicEnabled
    }))
  },
  
  setVolume: (volume: number) => {
    set({ volume: Math.max(0, Math.min(1, volume)) })
  },
  
  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light'
    }))
  }
}))
