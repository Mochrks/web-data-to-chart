'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import FileUploadDropzone from '@/components/FileUploadDropzone'
import { useData } from '@/components/DataContext'
import { ColumnSchema } from '@/lib/data-types'

export default function DataUploadAndVisualization() {
  const router = useRouter()
  const { setData, setSchema } = useData()

  const handleDataUpload = useCallback((
    uploadedData: Record<string, unknown>[],
    uploadedSchema: ColumnSchema[]
  ) => {
    setData(uploadedData)
    setSchema(uploadedSchema)
    router.push('/dashboard')
  }, [setData, setSchema, router])

  return (
    <div className="w-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col"
      >
        <FileUploadDropzone onDataUpload={handleDataUpload} />
      </motion.div>
    </div>
  )
}
