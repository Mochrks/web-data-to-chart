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
    <div className="flex-grow w-full flex flex-col font-sans text-white bg-[#1a0b2e] relative">

      <header className="w-full pt-8  z-50 flex justify-center sticky top-0">
        <nav
          aria-label="Main Navigation"
          className="glass-panel rounded-full px-2 py-2 flex items-center justify-between w-[90%] max-w-4xl h-16 shadow-glass"
        >
          {/* Logo Area */}
          <Link className="flex items-center gap-2 pl-4 pr-6 group" href="#">
            <svg
              className="w-8 h-8 text-purple-300"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"></path>
            </svg>
            <span className="font-semibold text-white tracking-wide group-hover:text-purple-200 transition">
              DTV Charts
            </span>
          </Link>

          {/* CTA Button (Github) */}
          <div className="pl-4 pr-4">
            <Link
              className="rounded-full bg-white/5 hover:bg-white/10 text-white text-xl p-2.5 w-10 h-10 flex items-center justify-center backdrop-blur-md transition shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20"
              href="https://github.com"
              target="_blank"
            >
              <i className="fa-brands fa-github"></i>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 w-full max-w-7xl mx-auto mt-4 pb-4">
        <section
          className="text-center mb-6 relative z-10 w-full max-w-3xl mx-auto"
          data-purpose="hero-text"
        >
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-4 text-gradient-main">
            DTV Charts
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto mb-8 font-light">
            Transform your CSV data into beautiful, interactive charts.
            <br className="hidden md:block" />
            Drag &amp; drop, configure with ease, and export in seconds.
          </p>
          {/* Feature Tags (Pills) */}
          <div className="flex flex-wrap justify-center gap-3" data-purpose="feature-pills">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <i className="fa-solid fa-file-csv text-white/80 text-sm"></i>
              <span className="text-xs font-medium text-white">CSV &amp; Excel</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <i className="fa-solid fa-list-ol text-white/80 text-sm"></i>
              <span className="text-xs font-medium text-white">100K+ Rows</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <i className="fa-solid fa-chart-pie text-white/80 text-sm"></i>
              <span className="text-xs font-medium text-white">15 Charts</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <i className="fa-solid fa-download text-white/80 text-sm"></i>
              <span className="text-xs font-medium text-white">PNG/SVG Export</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <i className="fa-solid fa-wand-magic-sparkles text-white/80 text-sm"></i>
              <span className="text-xs font-medium text-white">Modern UI</span>
            </div>
          </div>
        </section>



        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative pb-20">

          {/* LEFT COLUMN: Floating Cards */}
          <div className="hidden lg:flex lg:col-span-2 flex-col gap-16 items-end justify-center h-full pt-10">
            {/* Bar Chart Card */}
            <div className="clay-card w-28 h-28 flex flex-col items-center justify-center gap-3 transform -rotate-3 hover:scale-105 transition duration-300">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl shadow-inner">
                <i className="fa-solid fa-chart-simple"></i>
              </div>
              <span className="text-black text-[10px] font-bold tracking-tight">Bar Chart</span>
            </div>
            {/* Pie Chart Card */}
            <div className="clay-card w-28 h-28 flex flex-col items-center justify-center gap-3 transform rotate-6 translate-x-4 hover:scale-105 transition duration-300">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 text-2xl shadow-inner">
                <i className="fa-solid fa-chart-pie"></i>
              </div>
              <span className="text-black text-[10px] font-bold tracking-tight">Pie Chart</span>
            </div>
          </div>

          {/* CENTER COLUMN: Main Interaction Card (DROPZONE) */}
          <div className="col-span-1 lg:col-span-8 relative z-20">
            <div className="glass-panel w-full rounded-[2.5rem] p-1 border border-white/30 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
              <div className="glass-panel w-full h-full rounded-[2.25rem] bg-gradient-to-br from-white/10 to-transparent p-6 md:p-10 flex flex-col gap-8 relative shadow-[inset_0_0_30px_rgba(255,255,255,0.15)] min-h-[400px]">

                <div
                  {...getRootProps()}
                  className="flex flex-col items-center justify-center py-10 md:py-16 text-center relative group cursor-pointer w-full h-full outline-none"
                  onClick={open} // Trigger file picker manually
                >
                  <input {...getInputProps()} />

                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl transition duration-500 ${isDragActive ? 'bg-purple-500/40 scale-110' : 'group-hover:bg-purple-500/30'}`}></div>

                  {/* Content Switch based on Status */}
                  <AnimatePresence mode="wait">
                    {uploadState.status === 'idle' && (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center"
                      >
                        <div className="relative mb-6 transform group-hover:-translate-y-2 transition duration-500">
                          <i className={`fa-solid fa-cloud-arrow-up text-[8rem] text-white Drop-shadow-2xl opacity-90 transition filter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] ${isDragActive ? 'scale-110 text-purple-200' : 'group-hover:opacity-100'}`}></i>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-purple-200 transition">
                          {isDragActive ? "Drop It Like It's Hot!" : "Drag & drop your data file"}
                        </h2>
                        <p className="text-white/60 text-sm md:text-base mb-6 max-w-md">
                          Supports CSV and Excel files (.csv, .xlsx, .xls) or click to browse files.
                        </p>
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
                        <div className="mb-6 relative">
                          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                          <FiLoader className="w-24 h-24 text-white animate-spin relative z-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{uploadState.message}</h3>
                        <p className="text-white/60 text-sm">{Math.round(uploadState.progress)}% processed</p>
                      </motion.div>
                    )}

                    {uploadState.status === 'success' && (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="mb-6 bg-green-500/20 p-6 rounded-full border border-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                          <FiCheckCircle className="w-20 h-20 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Upload Complete!</h3>
                        <p className="text-white/60 text-sm">{uploadState.message}</p>
                      </motion.div>
                    )}

                    {uploadState.status === 'error' && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="mb-6 bg-red-500/20 p-6 rounded-full border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                          <FiAlertCircle className="w-20 h-20 text-red-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Upload Failed</h3>
                        <p className="text-red-200 text-sm mb-4">{uploadState.message}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadState({ status: 'idle', progress: 0, message: '' });
                          }}
                          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-semibold transition"
                        >
                          Try Again
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* File Format Badges (Always Visible unless error/parsing maybe? Kept for consistency) */}
                  {uploadState.status === 'idle' && (
                    <div className="flex gap-2 mb-8">
                      <span className="px-3 py-1 rounded-md bg-white/10 border border-white/10 text-[10px] font-mono text-white/80 uppercase tracking-wider">.CSV</span>
                      <span className="px-3 py-1 rounded-md bg-white/10 border border-white/10 text-[10px] font-mono text-white/80 uppercase tracking-wider">.XLSX</span>
                      <span className="px-3 py-1 rounded-md bg-white/10 border border-white/10 text-[10px] font-mono text-white/80 uppercase tracking-wider">.XLS</span>
                    </div>
                  )}

                  {/* Bottom Note */}
                  {uploadState.status === 'idle' && (
                    <p className="text-[11px] text-white/40 font-light">
                      Optimized for large datasets (10k-100k+ rows) with streaming processing.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Floating Cards */}
          <div className="hidden lg:flex lg:col-span-2 flex-col gap-16 items-start justify-center h-full pt-10">
            {/* Line Chart Card */}
            <div className="clay-card w-28 h-28 flex flex-col items-center justify-center gap-3 transform rotate-3 hover:scale-105 transition duration-300">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-500 text-2xl shadow-inner">
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <span className="text-black text-[10px] font-bold tracking-tight">Line Chart</span>
            </div>
            {/* Area Chart Card */}
            <div className="clay-card w-28 h-28 flex flex-col items-center justify-center gap-3 transform -rotate-6 -translate-x-4 hover:scale-105 transition duration-300">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-2xl shadow-inner">
                <i className="fa-solid fa-chart-area"></i>
              </div>
              <span className="text-black text-[10px] font-bold tracking-tight">Area Chart</span>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center z-50 relative mt-auto">
        <p className="text-white/40 text-sm font-light">
          &copy; 2025 <Link href="https://github.com/Mochrks" target="_blank" className="hover:text-white transition">Mochrks</Link>. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
