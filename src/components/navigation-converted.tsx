// CONVERTED EXAMPLE: Navigation component for React Router
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, Cloud, Zap, BookOpen, Gamepad2, Info, Home, Newspaper, Thermometer } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { getComponentStyles, type ThemeType } from "@/lib/theme-utils"

interface NavigationProps {
  weatherLocation?: string;
  weatherTemperature?: number;
  weatherUnit?: string;
}

export default function Navigation({ weatherLocation, weatherTemperature, weatherUnit }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation() // CHANGED: usePathname → useLocation
  const pathname = location.pathname // CHANGED: Extract pathname from location
  const { theme } = useTheme()

  const themeClasses = getComponentStyles(theme as ThemeType, 'navigation')

  // Navigation items
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/cloud-types", label: "Cloud Types", icon: Cloud },
    { href: "/weather-systems", label: "Weather Systems", icon: Zap },
    { href: "/fun-facts", label: "Fun Facts", icon: BookOpen },
    { href: "/games", label: "Games", icon: Gamepad2 },
    { href: "/news", label: "News", icon: Newspaper },
    { href: "/extremes", label: "Extremes", icon: Thermometer },
  ]

  return (
    <nav className={`w-full ${themeClasses.background} ${themeClasses.border} border-b-2`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link to="/" className={`text-xl font-bold ${themeClasses.accent}`}>
            16-Bit Weather
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  to={item.href} // CHANGED: href → to
                  className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? `${themeClasses.accent} ${themeClasses.glow}` 
                      : `${themeClasses.text} hover:${themeClasses.accent}`
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md ${themeClasses.text} hover:${themeClasses.accent}`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    to={item.href} // CHANGED: href → to
                    className={`flex items-center space-x-2 px-3 py-2 text-base font-medium transition-colors ${
                      isActive 
                        ? `${themeClasses.accent} ${themeClasses.glow}` 
                        : `${themeClasses.text} hover:${themeClasses.accent}`
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}