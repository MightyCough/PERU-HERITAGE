import './corona.css'

interface CoronaProps {
    className?: string
}

export default function Corona({ className = '' }: CoronaProps) {
    return (
        <div className={`corona ${className}`} aria-hidden="true">
            <div className="picos" />
            <div className="base" />
            <div className="circulos" />
        </div>
    )
}