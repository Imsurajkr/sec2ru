import { Github, Twitter } from 'lucide-react'

export default function Footer({ onEnterDemo }) {
  return (
    <footer className="border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-white font-bold text-lg">sec2ru</p>
          <p className="text-gray-500 text-sm mt-1">Infrastructure intelligence. Zero config.</p>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <button onClick={onEnterDemo} className="hover:text-white transition-colors">Demo</button>
          <a href="https://github.com/imsurajkr/sec2ru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5"><Github className="w-4 h-4" />GitHub</a>
        </div>
        <p className="text-gray-600 text-xs">© 2026 sec2ru. Built with Go + eBPF + React.</p>
      </div>
    </footer>
  )
}
