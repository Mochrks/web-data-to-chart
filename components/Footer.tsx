import { Github, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="glass-card border-t shadow-lg backdrop-blur-lg mt-auto">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-muted-foreground flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
            <Heart className="h-4 w-4 text-pink-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Created by</span>
            <a
              href="https://github.com/mochrks"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-semibold gradient-text hover-lift transition-all"
            >
              @mochrks
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
