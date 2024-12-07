'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FileUploadDropzone from './FileUploadDropzone'
import DataPreview from './DataPreview'
import ChartView from './ChartView'
import { Button } from '@/components/ui/button'

export default function DataUploadAndVisualization() {
  const [data, setData] = useState<any[]>([])
  const [showChart, setShowChart] = useState(false)

  const handleDataUpload = (uploadedData: any[]) => {
    setData(uploadedData)
    setShowChart(false)
  }

  return (
    <div className="space-y-8">
      <FileUploadDropzone onDataUpload={handleDataUpload} />
      <AnimatePresence>
        {data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <DataPreview data={data} />
            {!showChart && (
              <div className="mt-4 text-center">
                <Button onClick={() => setShowChart(true)}>
                  Convert to Chart
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showChart && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <ChartView data={data} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

