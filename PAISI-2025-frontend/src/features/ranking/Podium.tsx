"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Corona from "../../components/ui/corona"
import { rankingService } from "../../services/rankingService"

interface Player {
  id: number
  name: string
  score: number
  avatar?: string
  position: number
}

export default function PodiumComponent() {
  const [topPlayers, setTopPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const leaderboard = await rankingService.obtenerLeaderboard(3)
        const players = leaderboard.map((player, index) => ({
          id: player.player,
          name: player.player_username || player.player_email || `Jugador ${player.player}`,
          score: player.total_points,
          position: index + 1,
          avatar: player.avatar_url
        }))
        setTopPlayers(players)
      } catch (error) {
        console.error('Error al cargar top jugadores:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopPlayers()
  }, [])

  if (loading || topPlayers.length === 0) {
    return (
      <div className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto text-center">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-white text-xl">{loading ? 'Cargando podio...' : 'No hay datos de ranking aún'}</p>
        </div>
      </div>
    )
  }

  const desktopOrder = topPlayers.length >= 3 ? [topPlayers[1], topPlayers[0], topPlayers[2]] : topPlayers
  const mobileOrder = topPlayers

  return (
    <div className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Podium Structure - Responsive Layout */}
        <div className="relative w-full mb-8 sm:mb-10 lg:mb-16">
          {/* Mobile Stack View (< 1024px) - Orden 1, 2, 3 */}
          <div className="lg:hidden flex flex-col gap-4 sm:gap-6">
            {mobileOrder.map((player) => (
              <PodiumCardMobile key={player.id} player={player} />
            ))}
          </div>

          {/* Desktop Podium View (1024px+) - Orden 2, 1, 3 */}
          <div className="hidden lg:flex justify-center items-end gap-3 lg:gap-6 min-h-96">
            {desktopOrder.map((player) => (
              <PodiumCardDesktop key={player.id} player={player} />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex justify-center w-full"
        >
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: "0 20px 60px rgba(239, 68, 68, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-linear-to-r from-red-600 to-rose-600 text-white font-bold py-2.5 sm:py-3 lg:py-4 px-6 sm:px-10 lg:px-16 rounded-full shadow-2xl text-xs sm:text-sm lg:text-base relative overflow-hidden group transition-all duration-300"
          >
            <span className="relative z-10">¡Únete al ranking!</span>
            <div className="absolute inset-0 bg-linear-to-r from-red-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

interface PodiumCardProps {
  player: Player
}

// Mobile Card Component - Horizontal Layout
function PodiumCardMobile({ player }: PodiumCardProps) {
  const { position, name, score, avatar } = player

  const podiumConfig = {
    1: {
      gradient: "from-amber-400 via-yellow-500 to-amber-600",
      bgColor: "bg-purple-600",
      borderColor: "border-amber-400",
      shadowColor: "shadow-amber-500/50",
      title: "🏆 Campeón",
    },
    2: {
      gradient: "from-slate-300 via-gray-400 to-slate-500",
      bgColor: "bg-cyan-500",
      borderColor: "border-slate-300",
      shadowColor: "shadow-slate-400/50",
      title: "🥈 Subcampeón",
    },
    3: {
      gradient: "from-orange-400 via-amber-500 to-orange-600",
      bgColor: "bg-slate-400",
      borderColor: "border-orange-400",
      shadowColor: "shadow-orange-500/50",
      title: "🥉 Tercer Lugar",
    },
  }

  const config = podiumConfig[position as keyof typeof podiumConfig]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 * position }}
      className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-linear-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl border border-slate-700 shadow-lg hover:shadow-xl transition-shadow"
    >
      {/* Position Number */}
      <div
        className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full ${config.bgColor} flex items-center justify-center font-black text-lg sm:text-xl text-white shadow-lg border-2 ${config.borderColor}`}
      >
        {position}
      </div>

      {/* Avatar */}
      <div
        className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 sm:border-3 ${config.borderColor} overflow-hidden shadow-md bg-linear-to-br from-slate-700 to-slate-800`}
      >
        {avatar ? (
          <img 
            src={avatar} 
            alt={name} 
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              if (target.parentElement) {
                target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-xl font-bold">${name.charAt(0).toUpperCase()}</div>`
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">{config.title}</p>
        <h3 className="text-sm sm:text-base font-bold text-white truncate">{name}</h3>
        <div
          className={`text-base sm:text-lg font-black bg-linear-to-r ${config.gradient} bg-clip-text text-transparent`}
        >
          {score.toLocaleString()}
        </div>
      </div>
    </motion.div>
  )
}

// Desktop Podium Card Component - Traditional Podium Layout
function PodiumCardDesktop({ player }: PodiumCardProps) {
  const { position, name, score, avatar } = player

  const podiumConfig = {
    1: {
      gradient: "from-amber-400 via-yellow-500 to-amber-600",
      bgGradient: "from-amber-500/20 to-yellow-600/20",
      borderColor: "border-amber-400",
      shadowColor: "shadow-amber-500/50",
      bgColor: "bg-purple-600",
      height: "h-56 lg:h-72 xl:h-80",
      delay: 0.5,
      title: "Campeón",
      width: "w-44 lg:w-56 xl:w-64",
    },
    2: {
      gradient: "from-slate-300 via-gray-400 to-slate-500",
      bgGradient: "from-slate-400/20 to-gray-500/20",
      borderColor: "border-slate-300",
      shadowColor: "shadow-slate-400/50",
      bgColor: "bg-cyan-500",
      height: "h-44 lg:h-56 xl:h-64",
      delay: 0.3,
      title: "Subcampeón",
      width: "w-40 lg:w-48 xl:w-56",
    },
    3: {
      gradient: "from-orange-400 via-amber-500 to-orange-600",
      bgGradient: "from-orange-400/20 to-amber-600/20",
      borderColor: "border-orange-400",
      shadowColor: "shadow-orange-500/50",
      bgColor: "bg-slate-400",
      height: "h-40 lg:h-48 xl:h-56",
      delay: 0.7,
      title: "Tercer Lugar",
      width: "w-40 lg:w-44 xl:w-52",
    },
  }

  const config = podiumConfig[position as keyof typeof podiumConfig]

  return (
    <div className={`flex flex-col items-center mt-6 ${config.width}`}>
      {/* Player Card */}
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 150,
          delay: config.delay,
        }}
        className="relative mb-3 lg:mb-4 w-full"
      >
        <div className="relative bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-4 lg:p-5 xl:p-6 shadow-2xl border-2 border-slate-700 overflow-visible group hover:scale-105 transition-transform duration-300">
          {/* Background glow */}
          <div className={`absolute inset-0 bg-linear-to-br ${config.bgGradient} opacity-30 blur-xl`}></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                delay: config.delay + 0.4,
              }}
              className="mb-3 lg:mb-4 relative"
            >
              {position === 1 && (
                <motion.div
                  initial={{ y: -40, opacity: 0, rotate: -12 }}
                  animate={{ y: 0, opacity: 1, rotate: 24 }}
                  transition={{
                    type: "spring",
                    stiffness: 160,
                    damping: 12,
                    delay: config.delay + 0.5
                  }}
                  className="absolute -top-70 -right-36 z-20 pointer-events-none drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
                >
                  <Corona className="scale-[0.3] md:scale-[0.45] origin-bottom-right" />
                </motion.div>
              )}
              <div
                className={`relative w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-full overflow-hidden border-3 lg:border-4 ${config.borderColor} shadow-2xl ${config.shadowColor} bg-linear-to-br from-slate-700 to-slate-800`}
              >
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt={name} 
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget
                      target.style.display = 'none'
                      if (target.parentElement) {
                        const initials = name.charAt(0).toUpperCase()
                        target.parentElement.innerHTML += `<div class="w-full h-full flex items-center justify-center text-white text-3xl lg:text-4xl font-bold" style="position: absolute; top: 0; left: 0;">${initials}</div>`
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl lg:text-4xl font-bold">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>
              </div>
            </motion.div>

            {/* Position */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: config.delay + 0.5 }}
              className={`text-2xl lg:text-3xl xl:text-4xl font-black bg-linear-to-r ${config.gradient} bg-clip-text text-transparent mb-1.5 lg:mb-2`}
            >
              #{position}
            </motion.div>

            {/* Name */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: config.delay + 0.6 }}
              className="text-sm lg:text-base xl:text-lg font-bold text-white mb-1.5 lg:mb-2 text-center line-clamp-2"
            >
              {name}
            </motion.h3>

            {/* Score */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: config.delay + 0.7 }}
              className="text-center mb-2 lg:mb-3"
            >
              <div
                className={`text-lg lg:text-2xl xl:text-3xl font-black bg-linear-to-r ${config.gradient} bg-clip-text text-transparent`}
              >
                {score.toLocaleString()}
              </div>
              <div className="text-[10px] lg:text-xs text-slate-500 font-semibold uppercase tracking-wide">puntos</div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: config.delay + 0.8 }}
            >
              <div
                className={`px-3 lg:px-4 py-1 lg:py-1.5 rounded-full bg-linear-to-r ${config.gradient} text-white font-bold text-[10px] lg:text-xs shadow-lg uppercase tracking-wider`}
              >
                {config.title}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Pedestal */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{
          type: "spring",
          stiffness: 120,
          delay: config.delay + 0.2,
          duration: 0.8,
        }}
        className={`w-full ${config.height} bg-linear-to-b ${config.gradient} rounded-t-2xl lg:rounded-t-3xl shadow-2xl ${config.shadowColor} relative overflow-hidden`}
        style={{ transformOrigin: "bottom" }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-transparent"></div>

        {/* Stripes decoration */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)",
          }}
        ></div>

        {/* Position number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              delay: config.delay + 0.9,
            }}
            className="text-5xl lg:text-7xl xl:text-8xl font-black text-white/20"
          >
            {position}
          </motion.span>
        </div>

        {/* Bottom shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-2 lg:h-3 bg-black/30"></div>

        {/* Top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/40"></div>
      </motion.div>
    </div>
  )
}
