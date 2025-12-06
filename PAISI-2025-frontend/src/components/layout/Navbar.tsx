import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, Trophy, Gamepad2 } from 'lucide-react'
import { LazyMotion, domAnimation, motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useAuthStore } from '../../store/useAuthStore'
import logoSistemas from '../../assets/images/ui/logo_sistemas.png'

interface NavLink {
    to: string
    label: string
    icon: React.ReactNode
    color: string
    hoverColor: string
}

export const Navbar = React.memo(function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const reduceMotion = useReducedMotion()

    // Memoize nav links so they don't recreate on each render
    const navLinks: NavLink[] = useMemo(
        () => [
            {
                to: '/juego',
                label: 'Juego',
                icon: <Gamepad2 className="w-5 h-5" />,
                color: 'text-pink-500',
                hoverColor: 'hover:text-pink-400'
            },
            {
                to: '/ranking',
                label: 'Ranking',
                icon: <Trophy className="w-5 h-5" />,
                color: 'text-yellow-500',
                hoverColor: 'hover:text-yellow-400'
            }
        ],
        []
    )

    const handleLogout = () => {
        logout()
        navigate('/inicio-sesion')
        setIsMenuOpen(false)
        setIsProfileOpen(false)
    }

    const isActive = (path: string) => location.pathname === path

    const profileRef = useRef<HTMLDivElement>(null)

    // Detectar scroll para cambiar el fondo del navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Cerrar menú de perfil al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false)
            }
        }

        if (isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isProfileOpen])

    // Variants memoized to avoid recreation
    const itemVariants = useMemo(
        () => ({
            hidden: { opacity: 0 },
            visible: (i: number) => ({
                opacity: 1,
                transition: { delay: i * 0.03, duration: 0.15 }
            })
        }),
        []
    )

    const mobileMenuVariants = useMemo(
        () => ({
            hidden: { opacity: 0, height: 0 },
            visible: { opacity: 1, height: 'auto', transition: { duration: 0.15 } },
            exit: { opacity: 0, height: 0, transition: { duration: 0.1 } }
        }),
        []
    )

    const mobileItemVariants = useMemo(
        () => ({
            hidden: { opacity: 0 },
            visible: (i: number) => ({
                opacity: 1,
                transition: { delay: i * 0.03, duration: 0.15 }
            })
        }),
        []
    )

    // If user prefers reduced motion, provide simplified variants
    const initialAnimateProps = reduceMotion
        ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
        : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }

    return (
        <LazyMotion features={domAnimation}>
            <motion.nav
                // keep will-change and GPU friendly transforms
                style={{ willChange: 'transform, opacity' }}
                className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-24px)] sm:w-11/12 max-w-7xl will-change-transform transform-gpu"
                {...initialAnimateProps}
            >
                <div className={`backdrop-blur-md md:backdrop-blur-xl bg-linear-to-br ${
                    isScrolled 
                        ? 'from-gray-900/95 via-gray-900/95 to-gray-900/95' 
                        : 'from-gray-900/80 via-gray-900/70 to-gray-900/80'
                } border border-gray-700/50 rounded-2xl shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300`}>
                    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
                        <div className="flex items-center justify-between">
                            {/* Logo y título */}
                            <Link to="/juego" className="flex items-center gap-4 sm:gap-5 group shrink-0">
                                <motion.div
                                    whileHover={!reduceMotion ? { scale: 1.1, rotate: 5 } : undefined}
                                    whileTap={!reduceMotion ? { scale: 0.95 } : undefined}
                                    style={{ willChange: 'transform' }}
                                    className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center shrink-0 transform-gpu"
                                >
                                    <img src={logoSistemas} alt="Logo Sistemas" className="w-[160%] h-[160%] max-w-none object-contain" />
                                </motion.div>
                                <div className="hidden sm:block">
                                    <motion.h1
                                        whileHover={!reduceMotion ? { color: '#f87171' } : undefined}
                                        className="text-white font-bold text-base sm:text-lg transition-colors truncate"
                                        style={{ willChange: 'color' }}
                                    >
                                        Cultura Huanuqueña
                                    </motion.h1>
                                    <motion.p className="text-gray-400 text-xs group-hover:text-gray-300 transition-colors">
                                        Aprende jugando
                                    </motion.p>
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center gap-1 lg:gap-2">
                                {navLinks.map((link, i) => (
                                    <motion.div key={link.to} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                                        <Link
                                            to={link.to}
                                            className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-medium transition-all ${
                                                isActive(link.to)
                                                    ? 'bg-linear-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/30'
                                                    : `${link.color} ${link.hoverColor} hover:bg-gray-800/50`
                                            }`}
                                        >
                                            <motion.div
                                                whileHover={!reduceMotion ? { scale: 1.2, rotate: 10 } : undefined}
                                                whileTap={!reduceMotion ? { scale: 0.95 } : undefined}
                                                style={{ willChange: 'transform, opacity' }}
                                                className="will-change-transform"
                                            >
                                                {link.icon}
                                            </motion.div>
                                            <span className="text-sm">{link.label}</span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* User Menu y acciones - Desktop */}
                            <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0 relative" ref={profileRef}>
                                {user && (
                                    <>
                                        <motion.button
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            whileHover={!reduceMotion ? { scale: 1.05 } : undefined}
                                            whileTap={!reduceMotion ? { scale: 0.95 } : undefined}
                                            className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 transform-gpu border-2 border-transparent hover:border-blue-400/50 transition-all"
                                            style={{ willChange: 'transform' }}
                                        >
                                            <User className="w-5 h-5 text-white" />
                                        </motion.button>
                                        
                                        <AnimatePresence>
                                            {isProfileOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute top-full right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-lg border border-gray-700/50 shadow-2xl overflow-hidden z-50"
                                                >
                                                    <div className="px-4 py-3 border-b border-gray-700/50">
                                                        <p className="text-white font-medium text-sm truncate">{user.username}</p>
                                                        <p className="text-gray-400 text-xs truncate">{user.email || 'Usuario'}</p>
                                                    </div>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-400 hover:bg-gray-700/50 transition-all"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        <span className="text-sm">Cerrar sesión</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                )}
                            </div>

                            {/* Mobile menu button */}
                            <motion.button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                whileHover={!reduceMotion ? { scale: 1.1 } : undefined}
                                whileTap={!reduceMotion ? { scale: 0.95 } : undefined}
                                className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors will-change-transform transform-gpu"
                                aria-label="Toggle menu"
                                style={{ willChange: 'transform, opacity' }}
                            >
                                <AnimatePresence mode="wait">
                                    {isMenuOpen ? (
                                        <motion.div
                                            key="close"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className="will-change-transform"
                                            style={{ willChange: 'transform, opacity' }}
                                        >
                                            <X className="w-6 h-6" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="menu"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className="will-change-transform"
                                            style={{ willChange: 'transform, opacity' }}
                                        >
                                            <Menu className="w-6 h-6" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                variants={mobileMenuVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="md:hidden border-t border-gray-700/30 bg-linear-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-md will-change-transform transform-gpu"
                                style={{ willChange: 'transform, opacity' }}
                            >
                                <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-2">
                                    {user && (
                                        <motion.div
                                            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.22 }}
                                            className="flex items-center gap-3 px-3 py-3 bg-gray-800/50 backdrop-blur-md rounded-lg mb-3 border border-gray-700/30 will-change-transform transform-gpu"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-white font-medium text-sm truncate">{user.username}</span>
                                        </motion.div>
                                    )}

                                    {navLinks.map((link, i) => (
                                        <motion.div key={link.to} custom={i} variants={mobileItemVariants} initial="hidden" animate="visible">
                                            <Link
                                                to={link.to}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all will-change-transform transform-gpu ${isActive(link.to)
                                                        ? 'bg-linear-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/30'
                                                        : `${link.color} ${link.hoverColor} hover:bg-gray-800/50`
                                                    }`}
                                            >
                                                <span className="w-5 h-5 flex items-center justify-center">{link.icon}</span>
                                                <span className="text-sm">{link.label}</span>
                                            </Link>
                                        </motion.div>
                                    ))}

                                    <motion.button
                                        onClick={handleLogout}
                                        custom={navLinks.length}
                                        variants={mobileItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="w-full flex items-center gap-3 px-3 py-3 text-red-500 hover:text-red-400 hover:bg-gray-800/50 rounded-lg font-medium transition-all border border-gray-700/30 hover:border-red-500/50 mt-3 will-change-transform transform-gpu"
                                    >
                                        <LogOut className="w-5 h-5 shrink-0" />
                                        <span className="text-sm">Salir</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.nav>
        </LazyMotion>
    )
})
