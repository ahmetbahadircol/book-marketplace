import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ButtonProps {
    variant?: 'primary' | 'secondary'
    loading?: boolean
    icon?: React.ReactNode
    children?: React.ReactNode
    className?: string
    disabled?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    type?: 'button' | 'submit' | 'reset'
}

export default function Button({
    children,
    variant = 'primary',
    loading = false,
    icon,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary'

    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            className={`${baseClass} ${className} flex items-center justify-center gap-2 relative`}
            disabled={disabled || loading}
            {...(props as HTMLMotionProps<'button'>)}
        >
            {loading && (
                <Loader2 className="w-5 h-5 animate-spin absolute left-4" />
            )}
            {!loading && icon && <span>{icon}</span>}
            <span className={loading ? 'opacity-0' : ''}>{children}</span>
        </motion.button>
    )
}
