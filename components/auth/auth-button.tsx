'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LogIn, LogOut, User, ChevronDown, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function AuthButton() {
  const { user, profile, loading, isInitialized, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Handle click to toggle dropdown
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.auth-dropdown-container')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Show loading spinner only when not initialized
  if (!isInitialized) {
    return (
      <Button variant="outline" size="sm" disabled className="min-w-[80px]">
        <div className="animate-spin rounded-full h-3 w-3 border-b border-current" />
      </Button>
    )
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" asChild className="min-w-[80px]">
        <Link href="/auth/login">
          <LogIn className="w-3 h-3 mr-1" />
          LOGIN
        </Link>
      </Button>
    )
  }

  return (
    <div className="relative auth-dropdown-container">
      <Button
        variant="default"
        size="sm"
        onClick={handleButtonClick}
        className="min-w-[80px]"
      >
        <User className="w-3 h-3 mr-1" />
        <span className="whitespace-nowrap">{profile?.username || user?.email?.split('@')[0] || 'USER'}</span>
        <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* User Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-1 w-44 rounded-md border bg-popover text-popover-foreground shadow-md z-50">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors rounded-t-md"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          
          <Link
            href="/profile"
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors w-full text-left rounded-b-md"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}