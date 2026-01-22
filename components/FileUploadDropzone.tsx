'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { motion } from 'framer-motion'
import { Cloud, File, Loader2, Upload } from 'lucide-react'

interface FileUploadDropzoneProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDataUpload: (data: any[]) => void
}

export default function FileUploadDropzone({ onDataUpload }: FileUploadDropzoneProps) {
  const [isLoading, setIsLoading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setIsLoading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const json = XLSX.utils.sheet_to_json(worksheet)
          onDataUpload(json)
        } catch (error) {
          console.error('Error parsing file:', error)
        } finally {
          setIsLoading(false)
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }, [onDataUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    multiple: false
  })

  return (
    <div className='w-full h-full flex items-center justify-center'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <div
          {...getRootProps()}
          className={`glass-card rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 border-2 border-dashed hover-lift ${isDragActive
              ? 'border-primary bg-primary/10 glow-md scale-105'
              : 'border-border hover:border-primary/50 hover:glow-sm'
            }`}
        >
          <input {...getInputProps()} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              {isLoading ? (
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              ) : isDragActive ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Cloud className="h-16 w-16 text-primary" />
                </motion.div>
              ) : (
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Upload className="h-16 w-16 text-primary animate-float" />
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                </motion.div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 gradient-text">
                {isLoading ? 'Processing your file...' : isDragActive ? 'Drop the file here' : 'Drag & drop your file here'}
              </h3>
              <p className="text-base text-muted-foreground">
                {isLoading
                  ? 'Please wait while we process your data'
                  : 'Supports Excel (.xlsx) and CSV (.csv) files'}
              </p>
              {!isLoading && !isDragActive && (
                <motion.p
                  className="text-sm text-primary font-semibold mt-4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  or click to browse
                </motion.p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
