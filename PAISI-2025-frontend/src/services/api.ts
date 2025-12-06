import axios, { AxiosError } from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Crear instancia de Axios
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para requests - agregar token de autenticación
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token del localStorage
    const authStorage = localStorage.getItem('auth-storage')
    
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage)
        const token = state?.token
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error)
      }
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses - manejo de errores global
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    // Manejo de errores comunes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token inválido o expirado - logout automático
          localStorage.removeItem('auth-storage')
          window.location.href = '/'
          break
        case 403:
          console.error('Acceso prohibido')
          break
        case 404:
          console.error('Recurso no encontrado')
          break
        case 500:
          console.error('Error del servidor')
          break
        default:
          console.error('Error en la petición:', error.response.status)
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor')
    } else {
      console.error('Error al configurar la petición:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Tipos para respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

// Helper para manejar errores
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>
    return axiosError.response?.data?.message || axiosError.message || 'Error desconocido'
  }
  return error instanceof Error ? error.message : 'Error desconocido'
}

/**
 * Helper para extraer datos de respuestas del API
 * El backend puede devolver: {success, message, data} o directamente los datos
 */
export const extractApiData = <T>(response: any): T => {
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    // Formato: {success: true, message: '...', data: T}
    return response.data.data as T
  }
  // Formato directo: T
  return response.data as T
}

export default apiClient
