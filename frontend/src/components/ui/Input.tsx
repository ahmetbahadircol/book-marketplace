import { type InputHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
            >
                {label && (
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`input-field ${icon ? 'pl-12' : ''} ${error ? 'border-accent-error focus:ring-accent-error/50' : ''
                            } ${className}`}
                        onKeyDown={(e) => {
                            // Prevent minus sign and 'e' for number inputs
                            if (props.type === 'number' && (e.key === '-' || e.key === 'e' || e.key === 'E')) {
                                e.preventDefault()
                            }
                        }}
                        {...props}
                    />
                </div>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-1 text-sm text-accent-error"
                    >
                        {error}
                    </motion.p>
                )}
            </motion.div>
        )
    }
)

Input.displayName = 'Input'

export default Input
