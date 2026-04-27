'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import FileUploadDropzone from '@/components/FileUploadDropzone'
import { useData } from '@/components/DataContext'
import { ColumnSchema } from '@/lib/data-types'

export default function DataUploadAndVisualization() {
  const router = useRouter()
  const { setData, setSchema } = useData()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDataUpload = useCallback(async (
    uploadedData: Record<string, unknown>[],
    uploadedSchema: ColumnSchema[]
  ) => {
    setIsProcessing(true)
    // Small artificial delay to let the UI breathe and the user see the progress
    setTimeout(() => {
        setData(uploadedData)
        setSchema(uploadedSchema)
        router.push('/dashboard')
    }, 800)
  }, [setData, setSchema, router])

  return (
    <div className="w-full flex flex-col min-h-screen relative">
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-transparent"></div>
          <p className="mt-4 text-foreground text-[10px] font-bold uppercase tracking-[0.2em]">Preparing Dashboard</p>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col flex-grow"
      >
        <FileUploadDropzone onDataUpload={handleDataUpload} />
      </motion.div>
    </div>
  )
}
