import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, DollarSign, TrendingUp, BarChart3 } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

interface DashboardProps {
    onLogout: () => void
}

interface MarketConfig {
    usProfitType: 'amount' | 'percentage'
    usProfitValue: string
    caProfitType: 'amount' | 'percentage'
    caProfitValue: string
    usRankMin: string
    usRankMax: string
    caRankMin: string
    caRankMax: string
}

export default function Dashboard({ onLogout }: DashboardProps) {
    const [config, setConfig] = useState<MarketConfig>({
        usProfitType: 'percentage',
        usProfitValue: '',
        caProfitType: 'percentage',
        caProfitValue: '',
        usRankMin: '',
        usRankMax: '',
        caRankMin: '',
        caRankMax: '',
    })

    const [errors, setErrors] = useState<Partial<Record<keyof MarketConfig, string>>>({})

    const validatePositiveInt = (value: string, fieldName: string) => {
        if (!value) return `${fieldName} is required`
        const num = parseInt(value)
        if (isNaN(num) || num < 0) return `${fieldName} must be a positive number`
        return null
    }

    const validateProfit = (value: string, type: 'amount' | 'percentage', fieldName: string) => {
        if (!value) return `${fieldName} is required`
        const num = parseFloat(value)
        if (isNaN(num) || num < 0) return `${fieldName} must be a positive number`
        if (type === 'percentage' && num > 100) return `${fieldName} cannot exceed 100%`
        return null
    }

    const handleSave = () => {
        const newErrors: Partial<Record<keyof MarketConfig, string>> = {}

        // Validate US Profit
        const usProfitError = validateProfit(config.usProfitValue, config.usProfitType, 'US Profit')
        if (usProfitError) newErrors.usProfitValue = usProfitError

        // Validate CA Profit
        const caProfitError = validateProfit(config.caProfitValue, config.caProfitType, 'Canada Profit')
        if (caProfitError) newErrors.caProfitValue = caProfitError

        // Validate US Rank Range
        const usRankMinError = validatePositiveInt(config.usRankMin, 'US Min Rank')
        if (usRankMinError) newErrors.usRankMin = usRankMinError

        const usRankMaxError = validatePositiveInt(config.usRankMax, 'US Max Rank')
        if (usRankMaxError) newErrors.usRankMax = usRankMaxError

        if (!usRankMinError && !usRankMaxError && parseInt(config.usRankMin) > parseInt(config.usRankMax)) {
            newErrors.usRankMax = 'Max rank must be greater than min rank'
        }

        // Validate CA Rank Range
        const caRankMinError = validatePositiveInt(config.caRankMin, 'Canada Min Rank')
        if (caRankMinError) newErrors.caRankMin = caRankMinError

        const caRankMaxError = validatePositiveInt(config.caRankMax, 'Canada Max Rank')
        if (caRankMaxError) newErrors.caRankMax = caRankMaxError

        if (!caRankMinError && !caRankMaxError && parseInt(config.caRankMin) > parseInt(config.caRankMax)) {
            newErrors.caRankMax = 'Max rank must be greater than min rank'
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {
            // TODO: Replace with actual API call
            // await fetch('/api/config', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(config)
            // })
            console.log('Configuration saved:', config)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto mb-8 flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                        Market Configuration
                    </h1>
                    <p className="text-gray-400 mt-1">Set your profit margins and rank ranges</p>
                </div>
                <Button variant="secondary" onClick={onLogout} icon={<LogOut className="w-5 h-5" />}>
                    Logout
                </Button>
            </motion.div>

            {/* Configuration Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6"
            >
                {/* US Profit Margin */}
                <motion.div variants={itemVariants} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-accent-primary/10 rounded-xl">
                            <DollarSign className="w-6 h-6 text-accent-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">US Profit Margin</h2>
                            <p className="text-sm text-gray-400">United States market</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConfig({ ...config, usProfitType: 'amount' })}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${config.usProfitType === 'amount'
                                        ? 'bg-accent-primary text-white'
                                        : 'bg-dark-hover text-gray-400 hover:bg-dark-card'
                                    }`}
                            >
                                Amount ($)
                            </button>
                            <button
                                onClick={() => setConfig({ ...config, usProfitType: 'percentage' })}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${config.usProfitType === 'percentage'
                                        ? 'bg-accent-primary text-white'
                                        : 'bg-dark-hover text-gray-400 hover:bg-dark-card'
                                    }`}
                            >
                                Percentage (%)
                            </button>
                        </div>

                        <Input
                            type="number"
                            placeholder={config.usProfitType === 'amount' ? 'Enter amount' : 'Enter percentage'}
                            value={config.usProfitValue}
                            onChange={(e) => setConfig({ ...config, usProfitValue: e.target.value })}
                            error={errors.usProfitValue}
                            min="0"
                            step="0.01"
                        />
                    </div>
                </motion.div>

                {/* Canada Profit Margin */}
                <motion.div variants={itemVariants} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-accent-secondary/10 rounded-xl">
                            <DollarSign className="w-6 h-6 text-accent-secondary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Canada Profit Margin</h2>
                            <p className="text-sm text-gray-400">Canadian market</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConfig({ ...config, caProfitType: 'amount' })}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${config.caProfitType === 'amount'
                                        ? 'bg-accent-secondary text-white'
                                        : 'bg-dark-hover text-gray-400 hover:bg-dark-card'
                                    }`}
                            >
                                Amount ($)
                            </button>
                            <button
                                onClick={() => setConfig({ ...config, caProfitType: 'percentage' })}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${config.caProfitType === 'percentage'
                                        ? 'bg-accent-secondary text-white'
                                        : 'bg-dark-hover text-gray-400 hover:bg-dark-card'
                                    }`}
                            >
                                Percentage (%)
                            </button>
                        </div>

                        <Input
                            type="number"
                            placeholder={config.caProfitType === 'amount' ? 'Enter amount' : 'Enter percentage'}
                            value={config.caProfitValue}
                            onChange={(e) => setConfig({ ...config, caProfitValue: e.target.value })}
                            error={errors.caProfitValue}
                            min="0"
                            step="0.01"
                        />
                    </div>
                </motion.div>

                {/* US Rank Range */}
                <motion.div variants={itemVariants} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-accent-success/10 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-accent-success" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">US Rank Range</h2>
                            <p className="text-sm text-gray-400">Amazon US sales rank</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="number"
                            label="Min Rank"
                            placeholder="e.g., 10000"
                            value={config.usRankMin}
                            onChange={(e) => setConfig({ ...config, usRankMin: e.target.value })}
                            error={errors.usRankMin}
                            min="0"
                            step="1"
                        />
                        <Input
                            type="number"
                            label="Max Rank"
                            placeholder="e.g., 30000"
                            value={config.usRankMax}
                            onChange={(e) => setConfig({ ...config, usRankMax: e.target.value })}
                            error={errors.usRankMax}
                            min="0"
                            step="1"
                        />
                    </div>
                </motion.div>

                {/* Canada Rank Range */}
                <motion.div variants={itemVariants} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-accent-success/10 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-accent-success" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Canada Rank Range</h2>
                            <p className="text-sm text-gray-400">Amazon Canada sales rank</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="number"
                            label="Min Rank"
                            placeholder="e.g., 10000"
                            value={config.caRankMin}
                            onChange={(e) => setConfig({ ...config, caRankMin: e.target.value })}
                            error={errors.caRankMin}
                            min="0"
                            step="1"
                        />
                        <Input
                            type="number"
                            label="Max Rank"
                            placeholder="e.g., 30000"
                            value={config.caRankMax}
                            onChange={(e) => setConfig({ ...config, caRankMax: e.target.value })}
                            error={errors.caRankMax}
                            min="0"
                            step="1"
                        />
                    </div>
                </motion.div>
            </motion.div>

            {/* Save Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="max-w-7xl mx-auto mt-8"
            >
                <Button onClick={handleSave} className="max-w-md mx-auto">
                    Save Configuration
                </Button>
            </motion.div>
        </div>
    )
}
