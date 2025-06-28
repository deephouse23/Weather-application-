export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-cyan-400 flex items-center justify-center p-4">
      <div className="text-center">
        <pre className="text-cyan-400 text-xs leading-none font-mono mb-4">
{`██╗  ██╗ ██████╗ ██╗  ██╗
██║  ██║██╔═████╗██║  ██║
███████║██║██╔██║███████║
╚════██║████╔╝██║╚════██║
     ██║╚██████╔╝     ██║
     ╚═╝ ╚═════╝      ╚═╝`}
        </pre>
        <div className="text-lg font-mono mb-4">PAGE NOT FOUND</div>
        <div className="text-cyan-600 text-sm font-mono mb-6">
          The requested terminal session could not be located.
        </div>
        <a 
          href="/" 
          className="bg-cyan-500 text-black font-mono text-sm px-6 py-3 
                   hover:bg-cyan-400 transition-all duration-200 
                   uppercase tracking-wider inline-block"
        >
          Return to Main Terminal
        </a>
      </div>
    </div>
  )
} 