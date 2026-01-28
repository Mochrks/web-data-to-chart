'use client'

import Link from 'next/link'
import { FiGithub, FiMenu, FiX } from 'react-icons/fi'
import { BiBarChart } from 'react-icons/bi'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 clay-card border-b border-border/50 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="clay-inset p-2 rounded-xl">
              <BiBarChart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold text-primary">
                DTV Charts
              </span>
              <span className="hidden sm:block text-xs text-muted-foreground">
                Data to Visualization
              </span>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-3">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="clay-badge hover:bg-muted/50"
            >
              <a
                href="https://github.com/Mochrks/web-data-to-chart"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiGithub className="h-5 w-5" />
                <span className="sr-only">GitHub repository</span>
              </a>
            </Button>
          </div>

          <button
            className="sm:hidden clay-badge p-2 rounded-xl hover:bg-muted/50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <FiX className="h-5 w-5" />
            ) : (
              <FiMenu className="h-5 w-5" />
            )}
          </button>
        </div>

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
                  className="clay-badge hover:bg-muted/50"
                >
                  <a
                    href="https://github.com/Mochrks/web-data-to-chart"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiGithub className="h-4 w-4 mr-2" />
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
