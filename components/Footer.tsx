import { BiBarChart } from 'react-icons/bi'

export default function Footer() {
  return (
    <footer className="bg-card/50 border-t border-border/40 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-sm border border-primary/20">
              <BiBarChart className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              DTV Charts
            </span>
          </div>

          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>15 Types</span>
            <span className="hidden sm:inline opacity-30">/</span>
            <span>Import</span>
            <span className="hidden sm:inline opacity-30">/</span>
            <span>Export</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>©2025</span>
            <span className="opacity-50"> Crafted By</span>
            <a
              href="https://github.com/mochrks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              @MOCHRKS
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
