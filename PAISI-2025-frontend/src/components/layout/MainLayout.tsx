import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

interface MainLayoutProps {
    children: ReactNode
    showNavbar?: boolean
}

/**
 * MainLayout - Layout principal para páginas autenticadas
 * Incluye Navbar en la parte superior y el contenido debajo
 */
export function MainLayout({ children, showNavbar = true }: MainLayoutProps) {
    return (
        <div className="min-h-dvh bg-gray-950">
            {showNavbar && <Navbar />}
            <main className={`w-full ${showNavbar ? 'pt-20 sm:pt-24' : ''}`}>
                {children}
            </main>
        </div>
    )
}
