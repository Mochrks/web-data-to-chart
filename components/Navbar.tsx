'use client'

import Link from 'next/link'
import { Github, BarChart3, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 clay-card border-b border-border/50 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group hover-lift">
            <div className="clay-inset p-2 rounded-xl transition-all group-hover:shadow-clay">
              <BarChart3 className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">
                DataViz Pro
              </span>
              <span className="hidden sm:block text-xs text-muted-foreground">
                CSV to Chart
              </span>
            </div>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="clay-badge hover:shadow-clay transition-all"
            >
              <a
                href="https://github.com/Mochrks/web-data-to-chart"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub repository</span>
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden clay-badge p-2 rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden mt-4 pt-4 border-t border-border/50"
            >
              <div className="flex items-center justify-between gap-4">
                <ModeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="clay-badge"
                >
                  <a
                    href="https://github.com/Mochrks/web-data-to-chart"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </a>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
