import { Github, Twitter, Terminal, Gamepad2, Cpu, Zap, CloudLightning } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/navigation'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-[#00d4ff] selection:text-black overflow-x-hidden">
      <div className="relative z-50">
        <Navigation />
      </div>

      {/* Grid Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 py-16 relative z-10">

        {/* HERO SECTION */}
        <div className="max-w-4xl mx-auto text-center mb-20 space-y-6">
          <div className="inline-block px-4 py-1 border border-[#00d4ff] text-[#00d4ff] font-mono text-sm mb-4 bg-[#00d4ff]/10 rounded-full animate-pulse">
            SYSTEM_STATUS: ONLINE
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase font-mono bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] via-white to-[#ff00ff] drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
            Retro Soul.<br />
            Modern Intelligence.
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-mono max-w-2xl mx-auto leading-relaxed">
            Weather data doesn't have to be boring. Use the terminal. <br />Check the radar. Play the game.
          </p>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">

          {/* THE STORY CARD */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ff00ff] to-[#00d4ff] opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative h-full bg-[#0a0a0a] border border-[#333] p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Terminal className="w-8 h-8 text-[#ff00ff]" />
                  <h2 className="text-2xl font-bold font-mono tracking-wider uppercase text-[#ff00ff]">The Source Code</h2>
                </div>
                <div className="space-y-4 text-gray-300 font-mono leading-relaxed">
                  <p>
                    I've had an interest in weather since I can remember.
                  </p>
                  <p>
                    But this project isn't just about meteorology. It's about the <span className="text-white font-bold">craft</span>.
                    I find it incredibly fun to create "shitty websites" as a proxy to learn software development, explore CI/CD pipelines, and push the boundaries of what a web app can be.
                  </p>
                  <p>
                    16-Bit Weather is where <span className="text-[#00d4ff]">Nostalgia</span> meets a <span className="text-[#ff00ff]">Tron-like aesthetic</span>.
                    It's powered by modern tech agents, but feels like it belongs in an arcade cabinet from 1985.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TECH STACK CARD */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00d4ff] to-[#00ff9d] opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative h-full bg-[#0a0a0a] border border-[#333] p-8 md:p-10">
              <div className="flex items-center space-x-3 mb-6">
                <Cpu className="w-8 h-8 text-[#00d4ff]" />
                <h2 className="text-2xl font-bold font-mono tracking-wider uppercase text-[#00d4ff]">Under the Hood</h2>
              </div>

              <div className="space-y-6">
                <p className="text-gray-300 font-mono">
                  Don't let the pixels fool you. This machine is running on high-octane modern infrastructure.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center p-3 border border-[#333] hover:border-[#00d4ff] transition-colors bg-[#111]">
                    <Zap className="w-6 h-6 text-yellow-400 mr-4" />
                    <div>
                      <div className="font-bold font-mono text-white">THE ENGINE</div>
                      <div className="text-sm text-gray-500 font-mono">Next.js 15 (App Router)</div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 border border-[#333] hover:border-[#00ff9d] transition-colors bg-[#111]">
                    <CloudLightning className="w-6 h-6 text-[#00ff9d] mr-4" />
                    <div>
                      <div className="font-bold font-mono text-white">LIVE DATA</div>
                      <div className="text-sm text-gray-500 font-mono">OpenWeatherMap API + Supabase</div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 border border-[#333] hover:border-[#ff00ff] transition-colors bg-[#111]">
                    <Gamepad2 className="w-6 h-6 text-[#ff00ff] mr-4" />
                    <div>
                      <div className="font-bold font-mono text-white">THE AESTHETIC</div>
                      <div className="text-sm text-gray-500 font-mono">TailwindCSS + Framer Motion</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONNECT / PLAYER 1 SECTION */}
        <div className="max-w-3xl mx-auto">
          <div className="border-4 border-double border-[#333] bg-[#050505] p-2">
            <div className="border border-[#00d4ff] p-8 text-center relative overflow-hidden">
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>

              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto bg-[#00d4ff] rounded-full mb-6 flex items-center justify-center p-1 cursor-pointer hover:scale-110 transition-transform">
                  <img
                    src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&top=shortHairSides&accessories=prescription02"
                    alt="Player 1"
                    className="w-full h-full rounded-full bg-black"
                  />
                </div>

                <h3 className="text-2xl font-bold font-mono text-white mb-2">PLAYER 1</h3>
                <p className="text-[#00d4ff] font-mono text-sm tracking-widest uppercase mb-8">Ready to Connect</p>

                <div className="flex justify-center gap-6">
                  <a href="https://github.com/deephouse23" target="_blank" rel="noopener noreferrer"
                    className="group flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-[#111] border border-[#333] flex items-center justify-center group-hover:border-[#fff] group-hover:bg-[#fff] group-hover:text-black transition-all duration-300">
                      <Github className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-gray-500 group-hover:text-[#fff]">GITHUB</span>
                  </a>

                  <Link href="/dashboard" className="group flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-[#111] border border-[#333] flex items-center justify-center group-hover:border-[#00d4ff] group-hover:bg-[#00d4ff] group-hover:text-black transition-all duration-300">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-gray-500 group-hover:text-[#00d4ff]">DASHBOARD</span>
                  </Link>

                  <Link href="/" className="group flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-[#111] border border-[#333] flex items-center justify-center group-hover:border-[#ff00ff] group-hover:bg-[#ff00ff] group-hover:text-black transition-all duration-300">
                      <CloudLightning className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-gray-500 group-hover:text-[#ff00ff]">WEATHER</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}