import { Github, Heart, BarChart3, Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="clay-card border-t border-border/50 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="clay-inset p-2 rounded-xl">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium gradient-text">
              DataViz Pro
            </span>
          </div>

          {/* Features */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              15 Chart Types
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">CSV/Excel Import</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Export PNG/SVG</span>
          </div>

          {/* Copyright & Credits */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()}</span>
            <Heart className="h-3 w-3 text-pink-500 animate-pulse" />
            <span>by</span>
            <a
              href="https://github.com/mochrks"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-semibold gradient-text hover-lift transition-all"
            >
              @mochrks
              <Github className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
