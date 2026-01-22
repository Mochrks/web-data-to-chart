import Link from 'next/link'
import { Github, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass-card border-b shadow-lg backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold flex items-center gap-2 group">
            <Link href="/" className="flex items-center gap-2 hover-lift">
              <Sparkles className="h-6 w-6 text-primary transition-all group-hover:rotate-12 group-hover:scale-110" />
              <span className="gradient-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400">
                Data To Chart
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <Button variant="ghost" size="icon" asChild className="hover-lift hover:glow-sm transition-all">
              <a href="https://github.com/Mochrks/web-data-to-chart" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub repository</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
