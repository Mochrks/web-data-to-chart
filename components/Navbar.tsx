import Link from 'next/link'
import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

export default function Navbar() {
  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-semibold text-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Data Apps
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <Button variant="ghost" size="icon" asChild>
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

