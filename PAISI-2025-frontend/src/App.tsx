import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import InicioSesion from './pages/InicioSesion'
import JuegoPrincipal from './pages/JuegoPrincipal'
import Ranking from './pages/Ranking'
import GoogleCallback from './pages/GoogleCallback'
import { useAuthStore } from './store/useAuthStore'
import { LeaderBoardTable } from './features/ranking/LeaderBoardTable'
import PodiumComponent from './features/ranking/Podium'

// Componente para rutas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<InicioSesion />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/juego"
          element={
            <ProtectedRoute>
              <JuegoPrincipal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ranking"
          element={
            <ProtectedRoute>
              <Ranking />
            </ProtectedRoute>
          }
        />
        <Route
        path="/leaderboard"
        element={<LeaderBoardTable/>}/>  
        <Route
        path="/podium"
        element={<PodiumComponent />}
        />

        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/seleccion-personaje" element={<Navigate to="/juego" replace />} />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App