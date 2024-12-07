'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { motion } from 'framer-motion'
import { Cloud, File, Loader2 } from 'lucide-react'
// import { toast } from '@/components/ui/toast'

interface FileUploadDropzoneProps {
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
          // toast({
          //   title: "File uploaded successfully",
          //   description: "Your data is now ready for visualization.",
          // })
        } catch (error) {
          console.error('Error parsing file:', error)
          // toast({
          //   title: "Error uploading file",
          //   description: "There was a problem processing your file. Please try again.",
          //   variant: "destructive",
          // })
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
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-700'
        }`}
    >
      <input {...getInputProps()} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {isLoading ? (
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        ) : isDragActive ? (
          <Cloud className="h-10 w-10 text-primary mx-auto" />
        ) : (
          <File className="h-10 w-10 text-gray-400 dark:text-gray-600 mx-auto" />
        )}
        <h3 className="text-lg font-semibold">
          {isLoading ? 'Processing your file...' : isDragActive ? 'Drop the file here' : 'Drag & drop your file here'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isLoading
            ? 'Please wait while we process your data'
            : 'Supports Excel (.xlsx) and CSV (.csv) files'}
        </p>
      </motion.div>
    </div>
  )
}

