import { BiBarChart } from 'react-icons/bi'

export default function Footer() {
  return (
    <footer className="clay-card border-t border-border/50 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="clay-inset p-2 rounded-xl">
              <BiBarChart className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">
              DTV Charts
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>15 Chart Types</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">CSV/Excel Import</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Export PNG/SVG</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© 2025</span>
            <span>by</span>
            <a
              href="https://github.com/mochrks"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-semibold text-primary hover:bg-muted/50 rounded-md transition-colors"
            >
              @mochrks

            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
