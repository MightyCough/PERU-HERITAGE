import { clsx } from 'clsx'
import React from 'react'

export interface AvatarCircleProps {
    src?: string
    alt: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    fallback?: string
    className?: string
    border?: boolean
    online?: boolean
}

export function AvatarCircle({
    src,
    alt,
    size = 'md',
    fallback,
    className,
    border = false,
    online
}: AvatarCircleProps) {
    const [imageError, setImageError] = React.useState(false)
    
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl'
    }

    const onlineSizes = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
        xl: 'w-5 h-5'
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const borderClass = border ? 'ring-4 ring-white shadow-lg' : ''
    
    // Reset error cuando cambia el src
    React.useEffect(() => {
        setImageError(false)
    }, [src])

    const showImage = src && !imageError

    return (
        <div className="relative inline-block">
            <div
                className={clsx(
                    'rounded-full overflow-hidden flex items-center justify-center bg-linear-to-br from-blue-400 to-purple-500 text-white font-bold',
                    sizes[size],
                    borderClass,
                    className
                )}
            >
                {showImage ? (
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={() => {
                            setImageError(true)
                        }}
                    />
                ) : (
                    <span>{fallback || getInitials(alt)}</span>
                )}
            </div>

            {/* Indicador de online */}
            {online !== undefined && (
                <span
                    className={clsx(
                        'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
                        onlineSizes[size],
                        online ? 'bg-green-500' : 'bg-gray-400'
                    )}
                />
            )}
        </div>
    )
}
