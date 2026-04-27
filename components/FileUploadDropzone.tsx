'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { parseCSV } from '@/lib/csv-parser'
import { ColumnSchema } from '@/lib/data-types'

interface FileUploadDropzoneProps {
  onDataUpload: (data: Record<string, unknown>[], schema: ColumnSchema[]) => void
}

interface UploadState {
  status: 'idle' | 'parsing' | 'success' | 'error'
  progress: number
  message: string
  fileName?: string
  rowCount?: number
}

export default function FileUploadDropzone({ onDataUpload }: FileUploadDropzoneProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    message: '',
  })

  // Add mounted state to prevent hydration errors with random blobs or animations if needed
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploadState({
      status: 'parsing',
      progress: 0,
      message: 'Reading file...',
      fileName: file.name,
    })

    try {
      const result = await parseCSV(file, {
        onProgress: (percent) => {
          setUploadState(prev => ({
            ...prev,
            progress: percent,
            message: percent < 50 ? 'Parsing CSV...' : 'Detecting data types...',
          }))
        },
      })

      setUploadState({
        status: 'success',
        progress: 100,
        message: `Successfully loaded ${result.totalRows.toLocaleString()} rows`,
        fileName: file.name,
        rowCount: result.totalRows,
      })

      // Wait a moment to show success state before transitioning
      setTimeout(() => {
        onDataUpload(result.data, result.schema)
      }, 1000)

    } catch (error) {
      console.error('Error parsing file:', error)
      setUploadState({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Failed to parse file',
        fileName: file.name,
      })
    }
  }, [onDataUpload])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    noClick: true // We will handle click manually on the label/div to avoid double events if nested
  })

  if (!mounted) return null

  return (
    <div className="flex-grow w-full flex flex-col font-sans text-foreground bg-background relative selection:bg-primary/10">

      <header className="w-full pt-8 z-50 flex justify-center sticky top-0">
        <nav
          aria-label="Main Navigation"
          className="bg-card/50 border border-border/40 backdrop-blur-md rounded-sm px-2 py-2 flex items-center justify-between w-[90%] max-w-4xl h-16 shadow-sm"
        >
          {/* Logo Area */}
          <Link className="flex items-center gap-2 pl-4 pr-6 group" href="#">
            <div className="p-1.5 border border-primary/20 rounded-sm bg-primary/5">
                <svg
                className="w-6 h-6 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"></path>
                </svg>
            </div>
            <span className="font-medium text-foreground tracking-tight group-hover:text-primary transition">
              DTV Charts
            </span>
          </Link>

          {/* CTA Button (Github) */}
          <div className="pl-4 pr-4">
            <Link
              className="rounded-sm hover:bg-muted/50 text-foreground text-xl p-2.5 w-10 h-10 flex items-center justify-center transition border border-border/60"
              href="https://github.com/Mochrks/web-data-to-chart"
              target="_blank"
            >
              <i className="fa-brands fa-github"></i>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 w-full max-w-7xl mx-auto mt-4 pb-4">
        <section
          className="text-center mb-12 relative z-10 w-full max-w-3xl mx-auto"
          data-purpose="hero-text"
        >
          <div className="inline-block mb-4 px-3 py-1 rounded-sm border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
            Minimalist Visualization
          </div>
          <h1 className="text-5xl md:text-6xl font-medium tracking-tighter mb-6 text-foreground">
            Data to Insight, <span className="text-primary italic">Simplicity</span>.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10 font-light tracking-wide">
            Transform your complex datasets into clear, elegant visualizations. 
            Designed for clarity, built for speed.
          </p>
          
          {/* Feature Tags (Pills) - Minimalist Style */}
          <div className="flex flex-wrap justify-center gap-4" data-purpose="feature-pills">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border/60 bg-card/30">
              <i className="fa-solid fa-file-csv text-muted-foreground text-xs"></i>
              <span className="text-[11px] font-medium text-foreground uppercase tracking-wider">CSV &amp; Excel</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border/60 bg-card/30">
              <i className="fa-solid fa-list-ol text-muted-foreground text-xs"></i>
              <span className="text-[11px] font-medium text-foreground uppercase tracking-wider">High Volume</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border/60 bg-card/30">
              <i className="fa-solid fa-chart-pie text-muted-foreground text-xs"></i>
              <span className="text-[11px] font-medium text-foreground uppercase tracking-wider">15 Styles</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border/60 bg-card/30">
              <i className="fa-solid fa-wand-magic-sparkles text-muted-foreground text-xs"></i>
              <span className="text-[11px] font-medium text-foreground uppercase tracking-wider">Zen UI</span>
            </div>
          </div>
        </section>

        <div className="w-full max-w-4xl relative pb-20">
          {/* CENTER COLUMN: Main Interaction Card (DROPZONE) */}
          <div className="relative z-20">
            <div className="bg-card border border-border/60 rounded-sm p-1 shadow-sm">
              <div className="border border-dashed border-border/80 rounded-sm bg-muted/10 p-6 md:p-12 flex flex-col gap-8 relative min-h-[350px] transition-all hover:bg-muted/20">

                <div
                  {...getRootProps()}
                  className="flex flex-col items-center justify-center py-10 md:py-16 text-center relative group cursor-pointer w-full h-full outline-none"
                  onClick={open}
                >
                  <input {...getInputProps()} />

                  {/* Content Switch based on Status */}
                  <AnimatePresence mode="wait">
                    {uploadState.status === 'idle' && (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center"
                      >
                        <div className="mb-8 p-6 rounded-full border border-primary/10 bg-primary/5 text-primary/60 transition duration-500 group-hover:scale-105 group-hover:text-primary">
                          <i className={`fa-solid fa-cloud-arrow-up text-6xl ${isDragActive ? 'animate-bounce' : ''}`}></i>
                        </div>

                        <h2 className="text-xl md:text-2xl font-medium text-foreground mb-3 tracking-tight">
                          {isDragActive ? "Drop files here" : "Begin your visualization"}
                        </h2>
                        <p className="text-muted-foreground text-sm mb-8 max-w-md font-light tracking-wide">
                          Drag and drop your data source, or <span className="text-primary font-medium border-b border-primary/30">browse files</span>.
                        </p>
                        
                        <div className="flex gap-4">
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-60">CSV</span>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-60">XLSX</span>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-60">JSON</span>
                        </div>
                      </motion.div>
                    )}

                    {uploadState.status === 'parsing' && (
                      <motion.div
                        key="parsing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center"
                      >
                        <div className="mb-8">
                          <FiLoader className="w-16 h-16 text-primary animate-spin" />
                        </div>
                        <h3 className="text-xl font-medium text-foreground mb-2 tracking-tight">{uploadState.message}</h3>
                        <div className="w-48 h-1 bg-border rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary transition-all duration-300" 
                                style={{ width: `${uploadState.progress}%` }}
                            ></div>
                        </div>
                        <p className="text-muted-foreground text-[11px] mt-2 uppercase tracking-widest font-bold">{Math.round(uploadState.progress)}%</p>
                      </motion.div>
                    )}

                    {uploadState.status === 'success' && (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="mb-8 text-primary">
                          <FiCheckCircle className="w-16 h-16" />
                        </div>
                        <h3 className="text-xl font-medium text-foreground mb-2 tracking-tight">Data Ready</h3>
                        <p className="text-muted-foreground text-sm font-light">{uploadState.message}</p>
                      </motion.div>
                    )}

                    {uploadState.status === 'error' && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="mb-8 text-destructive/80">
                          <FiAlertCircle className="w-16 h-16" />
                        </div>
                        <h3 className="text-xl font-medium text-foreground mb-2 tracking-tight">Requirement Unmet</h3>
                        <p className="text-destructive/70 text-sm mb-6 font-light max-w-xs">{uploadState.message}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadState({ status: 'idle', progress: 0, message: '' });
                          }}
                          className="px-8 py-2 border border-border/60 hover:bg-muted/50 rounded-sm text-foreground text-xs font-bold tracking-widest uppercase transition"
                        >
                          Retry
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-10 text-center z-50 relative mt-auto">
        <div className="w-20 h-[1px] bg-border mx-auto mb-6"></div>
        <p className="text-muted-foreground text-[10px] font-medium tracking-[0.3em] uppercase">
          &copy; 2025 <Link href="https://github.com/Mochrks" target="_blank" className="hover:text-primary transition">MOCHRKS</Link>
        </p>
      </footer>
    </div>
  )
}
