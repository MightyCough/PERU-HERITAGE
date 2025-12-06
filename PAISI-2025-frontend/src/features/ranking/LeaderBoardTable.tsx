import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { AvatarCircle } from '../../components/ui/AvatarCircle'
import { rankingService } from '../../services/rankingService'
import { useAuthStore } from '../../store/useAuthStore'
"use client"

interface Player {
  id: number
  name: string
  score: number
  avatar?: string
}

export function LeaderBoardTable() {
  const { user } = useAuthStore()
  const [players, setPlayers] = useState<Player[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
  const [currentUserScore, setCurrentUserScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Obtener leaderboard completo
        const leaderboard = await rankingService.obtenerLeaderboard()
        
        // Obtener solo los jugadores después del top 3
        const playersAfterTop3 = leaderboard.slice(3).map(player => ({
          id: player.player,
          name: player.player_username || player.player_email || `Jugador ${player.player}`,
          score: player.total_points,
          avatar: player.avatar_url
        }))
        
        setPlayers(playersAfterTop3)

        // Obtener ranking del usuario actual si está autenticado
        if (user?.id) {
          try {
            const userInfo = await rankingService.obtenerInfoCompletaJugador(Number(user.id))
            setCurrentUserRank(userInfo.rank)
            setCurrentUserScore(userInfo.total_points)
          } catch (error) {
            console.error('Error al obtener ranking del usuario:', error)
          }
        }
      } catch (error) {
        console.error('Error al cargar leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [user?.id])
  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-white text-xl">Cargando ranking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Ranking de Danzantes</h1>
            <p className="text-gray-300 text-lg">¡Compite y demuestra tu conocimiento sobre Los Negritos de Huánuco!</p>
          </div>

          {/* User Position Card */}
          {currentUserRank && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-linear-to-r from-red-600 to-rose-600 rounded-2xl shadow-2xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20" />

                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex-1">
                    <p className="text-red-100 text-sm font-semibold mb-2">TU POSICIÓN ACTUAL</p>
                    <h2 className="text-5xl font-bold text-white mb-1">Puesto #{currentUserRank}</h2>
                    <p className="text-red-100 text-lg mb-6">{currentUserScore.toLocaleString()} Puntos</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-3"
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-900/50 rounded-xl border border-gray-800">
              <div className="col-span-1">
                <p className="text-gray-400 text-sm font-semibold">#</p>
              </div>
              <div className="col-span-7">
                <p className="text-gray-400 text-sm font-semibold">Jugador</p>
              </div>
              <div className="col-span-4 text-right">
                <p className="text-gray-400 text-sm font-semibold">Puntuación</p>
              </div>
            </div>

            {/* Table Rows */}
            <div className="space-y-2">
              {players.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No hay más jugadores en el ranking</p>
                </div>
              ) : (
                players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  className="group relative"
                >
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 rounded-xl bg-gray-900/30 border border-gray-800 hover:border-rose-500/50 transition-all duration-300 cursor-pointer overflow-hidden">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-linear-to-r from-red-500/0 via-red-500/5 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Position */}
                    <div className="col-span-1 relative z-10 flex items-center">
                      <span className="text-xl font-bold bg-linear-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                        {index + 4}
                      </span>
                    </div>

                    {/* Player Info */}
                    <div className="col-span-7 relative z-10 flex items-center gap-3">
                      <AvatarCircle
                        src={player.avatar}
                        alt={player.name}
                        size="md"
                        fallback={player.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      />
                      <span className="font-medium text-white group-hover:text-rose-300 transition-colors">
                        {player.name}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="col-span-4 relative z-10 flex items-center justify-end">
                      <span className="text-lg font-bold text-transparent bg-linear-to-r from-red-400 to-rose-400 bg-clip-text group-hover:from-rose-300 group-hover:to-red-300 transition-all">
                        {player.score.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
              )}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8"
          >
            <button className="w-full bg-linear-to-r from-red-500 to-rose-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
              ¡Juega para subir de puesto!
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}