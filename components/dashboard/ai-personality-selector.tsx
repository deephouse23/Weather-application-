'use client'

import { Bot, Zap, Coffee, Sparkles } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import { useAIChat, type AIPersonality } from '@/hooks/useAIChat'
import { cn } from '@/lib/utils'

const personalities = [
    {
        id: 'storm' as AIPersonality,
        name: 'Storm',
        description: 'Friendly and enthusiastic weather buddy',
        icon: Zap,
        color: 'bg-weather-primary',
        hoverColor: 'hover:border-weather-primary',
        textColor: 'text-weather-primary'
    },
    {
        id: 'sass' as AIPersonality,
        name: 'Sass',
        description: 'Sarcastic and brutally honest',
        icon: Sparkles,
        color: 'bg-pink-500',
        hoverColor: 'hover:border-pink-500',
        textColor: 'text-pink-500'
    },
    {
        id: 'chill' as AIPersonality,
        name: 'Chill',
        description: 'Laid-back and minimal vibes',
        icon: Coffee,
        color: 'bg-green-500',
        hoverColor: 'hover:border-green-500',
        textColor: 'text-green-500'
    }
]

export default function AIPersonalitySelector() {
    const { theme } = useTheme()
    const themeClasses = getComponentStyles(theme as ThemeType, 'dashboard')
    const { personality, setPersonality, isAuthenticated } = useAIChat()

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="space-y-4">
            <p className={`text-sm font-mono ${themeClasses.text} opacity-75`}>
                Choose how the AI assistant responds to your weather queries.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {personalities.map((p) => {
                    const Icon = p.icon
                    const isSelected = personality === p.id

                    return (
                        <button
                            key={p.id}
                            onClick={() => setPersonality(p.id)}
                            className={cn(
                                "p-4 border-2 rounded-lg transition-all duration-200 text-left",
                                "bg-black/40 hover:bg-black/60",
                                isSelected
                                    ? `border-2 ${p.textColor} shadow-lg`
                                    : `border-weather-border ${p.hoverColor}`,
                                isSelected && "ring-2 ring-offset-2 ring-offset-black ring-opacity-50",
                                p.id === 'storm' && isSelected && "ring-weather-primary",
                                p.id === 'sass' && isSelected && "ring-pink-500",
                                p.id === 'chill' && isSelected && "ring-green-500"
                            )}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                    isSelected ? p.color : "bg-weather-border"
                                )}>
                                    <Icon className={cn(
                                        "w-4 h-4",
                                        isSelected ? "text-white" : themeClasses.text
                                    )} />
                                </div>
                                <span className={cn(
                                    "font-mono font-bold uppercase tracking-wider",
                                    isSelected ? p.textColor : themeClasses.text
                                )}>
                                    {p.name}
                                </span>
                                {isSelected && (
                                    <span className={cn(
                                        "ml-auto text-xs font-mono uppercase",
                                        p.textColor
                                    )}>
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className={cn(
                                "text-xs font-mono",
                                isSelected ? "opacity-90" : "opacity-60",
                                themeClasses.text
                            )}>
                                {p.description}
                            </p>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
