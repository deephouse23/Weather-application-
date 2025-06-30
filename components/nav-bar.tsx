"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from 'next-auth/react'

export default function NavBar() {
  const { data: session, status } = useSession()

  return (
    <nav className="flex items-center justify-between p-4 border-b border-cyan-400/20">
      <div className="flex items-center space-x-8">
        <Link href="/" className="text-xl font-bold text-cyan-400">
          16 BIT WEATHER
        </Link>
        
        <div className="flex space-x-6">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300">HOME</Link>
          <Link href="/cloud-types" className="text-cyan-400 hover:text-cyan-300">CLOUD TYPES</Link>
          <Link href="/weather-systems" className="text-cyan-400 hover:text-cyan-300">WEATHER SYSTEMS</Link>
          <Link href="/fun-facts" className="text-cyan-400 hover:text-cyan-300">16-BIT TAKES</Link>
          <Link href="/games" className="text-cyan-400 hover:text-cyan-300">GAMES</Link>
          <Link href="/about" className="text-cyan-400 hover:text-cyan-300">ABOUT</Link>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {status === 'loading' && (
          <span className="text-cyan-400">Loading...</span>
        )}
        
        {session ? (
          <div className="flex items-center space-x-4">
            <span className="text-cyan-400">
              Welcome, {session.user?.name || 'User'}
            </span>
            <button 
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={() => signIn('google')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Google
            </button>
            <button 
              onClick={() => signIn('github')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded"
            >
              GitHub
            </button>
          </div>
        )}
      </div>
    </nav>
  );
} 