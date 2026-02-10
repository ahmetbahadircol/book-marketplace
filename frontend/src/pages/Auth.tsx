import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Sparkles } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

interface AuthProps {
    onAuthSuccess: () => void
}

export default function Auth({ onAuthSuccess }: AuthProps) {
    const [isSignIn, setIsSignIn] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({})

    const validateForm = () => {
        const newErrors: typeof errors = {}

        if (!email) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid'
        }

        if (!password) {
            newErrors.password = 'Password is required'
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        if (!isSignIn && password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)

        // TODO: Replace with actual API call
        // const endpoint = isSignIn ? '/api/auth/signin' : '/api/auth/signup'
        // const response = await fetch(endpoint, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email, password })
        // })

        // Simulate API call
        setTimeout(() => {
            setLoading(false)
            onAuthSuccess()
        }, 1500)
    }

    const toggleMode = () => {
        setIsSignIn(!isSignIn)
        setErrors({})
        setConfirmPassword('')
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-accent-primary/10 to-transparent rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                <motion.div
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent-secondary/10 to-transparent rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [90, 0, 90],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>

            {/* Auth Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card p-8 md:p-12 w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl mb-4"
                    >
                        <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                        {isSignIn ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {isSignIn ? 'Sign in to continue' : 'Start your journey today'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        type="email"
                        label="Email Address"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        icon={<Mail className="w-5 h-5" />}
                    />

                    <Input
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        icon={<Lock className="w-5 h-5" />}
                    />

                    {!isSignIn && (
                        <Input
                            type="password"
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={errors.confirmPassword}
                            icon={<Lock className="w-5 h-5" />}
                        />
                    )}

                    <Button type="submit" loading={loading} className="mt-6">
                        {isSignIn ? 'Sign In' : 'Sign Up'}
                    </Button>
                </form>

                {/* Toggle */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        {isSignIn ? "Don't have an account?" : 'Already have an account?'}
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="ml-2 text-accent-primary hover:text-accent-secondary transition-colors font-medium"
                        >
                            {isSignIn ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
