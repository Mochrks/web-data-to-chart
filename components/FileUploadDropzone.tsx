'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCloud, FiUpload, FiAlertCircle, FiCheckCircle, FiLoader, FiFile } from 'react-icons/fi'
import { parseCSV } from '@/lib/csv-parser'
import { ColumnSchema } from '@/lib/data-types'
import { Progress } from '@/components/ui/progress'

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

      setTimeout(() => {
        onDataUpload(result.data, result.schema)
      }, 500)

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  })

  const resetUpload = () => {
    setUploadState({
      status: 'idle',
      progress: 0,
      message: '',
    })
  }

  return (
    <div className="w-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <div
          {...getRootProps()}
          className={`clay-card rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 
            ${isDragActive
              ? 'ring-4 ring-primary/30 scale-[1.02]'
              : 'hover:ring-2 hover:ring-primary/20'
            }
            ${uploadState.status === 'error' ? 'ring-2 ring-destructive/30' : ''}
            ${uploadState.status === 'success' ? 'ring-2 ring-green-500/30' : ''}
          `}
        >
          <input {...getInputProps()} />

          <AnimatePresence mode="wait">
            {uploadState.status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-center">
                  {isDragActive ? (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    >
                      <div className="relative">
                        <FiCloud className="h-20 w-20 text-primary" />
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="relative">
                      <div className="clay-inset p-6 rounded-full">
                        <FiUpload className="h-16 w-16 text-primary" />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-3 text-primary">
                    {isDragActive ? 'Drop your file here' : 'Drag & drop your data file'}
                  </h3>
                  <p className="text-muted-foreground">
                    Supports CSV and Excel files (.csv, .xlsx, .xls)
                  </p>
                  {!isDragActive && (
                    <p className="text-sm text-primary font-medium mt-4">
                      or click to browse files
                    </p>
                  )}
                </div>

                <div className="flex justify-center gap-3 mt-4">
                  {['.CSV', '.XLSX', '.XLS'].map((ext) => (
                    <span
                      key={ext}
                      className="clay-badge text-xs text-muted-foreground"
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {uploadState.status === 'parsing' && (
              <motion.div
                key="parsing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 py-4"
              >
                <div className="flex justify-center">
                  <div className="clay-inset p-6 rounded-full">
                    <FiLoader className="h-14 w-14 text-primary animate-spin" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">{uploadState.message}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {uploadState.fileName}
                  </p>

                  <div className="max-w-md mx-auto">
                    <Progress value={uploadState.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {Math.round(uploadState.progress)}% complete
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {uploadState.status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 py-4"
              >
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  >
                    <div className="clay-badge p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                      <FiCheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                  </motion.div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-400">
                    {uploadState.message}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <FiFile className="h-4 w-4" />
                    <span>{uploadState.fileName}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {uploadState.status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 py-4"
              >
                <div className="flex justify-center">
                  <div className="clay-badge p-4 rounded-full bg-red-100 dark:bg-red-900/30">
                    <FiAlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-red-700 dark:text-red-400">
                    Upload Failed
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {uploadState.message}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      resetUpload()
                    }}
                    className="clay-button text-sm hover:bg-primary/90 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          💡 Optimized for large datasets (10k-100k+ rows) with streaming processing
        </p>
      </motion.div>
    </div>
  )
}
