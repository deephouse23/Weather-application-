'use client'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<any>({})

  useEffect(() => {
    setEnvVars({
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
    })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Environment Debug</h1>
      <pre className="bg-gray-800 p-4 rounded text-sm">
        {JSON.stringify(envVars, null, 2)}
      </pre>
    </div>
  )
} 