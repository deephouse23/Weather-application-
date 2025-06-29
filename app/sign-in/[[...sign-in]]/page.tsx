import { SignIn } from '@clerk/nextjs'
import { ClerkWrapper } from '@/components/clerk-wrapper'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative crt-scanlines">
      
      <div className="w-full max-w-md relative z-10">
        {/* ASCII Header */}
        <div className="text-center mb-8 crt-flicker">
          <pre className="text-cyan-400 text-xs leading-none font-mono">
{`██╗      ██████╗  ██████╗ ██╗███╗   ██╗
██║     ██╔═══██╗██╔════╝ ██║████╗  ██║
██║     ██║   ██║██║  ███╗██║██╔██╗ ██║
██║     ██║   ██║██║   ██║██║██║╚██╗██║
███████╗╚██████╔╝╚██████╔╝██║██║ ╚████║
╚══════╝ ╚═════╝  ╚═════╝ ╚═╝╚═╝  ╚═══╝`}
          </pre>
          <div className="text-cyan-600 text-xs mt-4 font-mono tracking-wider">
            16-BIT WEATHER • USER AUTHENTICATION PROTOCOL
          </div>
        </div>
        
        <ClerkWrapper 
          fallback={
            <div className="text-center p-8 border border-cyan-400 text-cyan-400">
              <div className="text-lg font-mono mb-4">AUTHENTICATION UNAVAILABLE</div>
              <div className="text-sm text-cyan-600">
                Clerk authentication is not configured.
                <br />
                Please check your environment variables.
              </div>
            </div>
          }
        >
          <SignIn 
            redirectUrl="/weather"
            fallbackRedirectUrl="/weather"
          />
        </ClerkWrapper>
        
        {/* Terminal Footer */}
        <div className="text-center mt-6 text-cyan-600 text-xs font-mono">
          ░ SECURE CONNECTION ESTABLISHED • SSL ENCRYPTED • RETRO TERMINAL v0.2.9 ░
        </div>
      </div>
    </div>
  )
} 