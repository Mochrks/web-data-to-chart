'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FileUploadDropzone from './FileUploadDropzone'
import DataPreview from './DataPreview'
import ChartConfigPanel from './ChartConfigPanel'
import ChartView from './ChartView'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BiBarChart } from 'react-icons/bi'
import { FiArrowLeft } from 'react-icons/fi'
import { BsTable } from 'react-icons/bs'
import { ColumnSchema, ChartConfig } from '@/lib/data-types'

type ViewState = 'upload' | 'preview' | 'chart'

export default function DataUploadAndVisualization() {
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [schema, setSchema] = useState<ColumnSchema[]>([])
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null)
  const [viewState, setViewState] = useState<ViewState>('upload')
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [showDatasetAlert, setShowDatasetAlert] = useState(false)

  const handleDataUpload = useCallback((
    uploadedData: Record<string, unknown>[],
    uploadedSchema: ColumnSchema[]
  ) => {
    setData(uploadedData)
    setSchema(uploadedSchema)
    setChartConfig(null)
    setViewState('preview')
    setShowDatasetAlert(true)
  }, [])

  useEffect(() => {
    if (showDatasetAlert) {
      const timer = setTimeout(() => {
        setShowDatasetAlert(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showDatasetAlert])

  const handleSchemaChange = useCallback((newSchema: ColumnSchema[]) => {
    setSchema(newSchema)
  }, [])

  const handleChartConfig = useCallback((config: ChartConfig) => {
    setChartConfig(config)
    setViewState('chart')
  }, [])

  const handleReset = useCallback(() => {
    setData([])
    setSchema([])
    setChartConfig(null)
    setViewState('upload')
    setShowDatasetAlert(false)
  }, [])

  const handleBackToPreview = useCallback(() => {
    setViewState('preview')
  }, [])

  return (
    <div className="space-y-6">
      {viewState !== 'upload' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <Badge
              variant={viewState === 'preview' || viewState === 'chart' ? 'default' : 'outline'}
              className={viewState === 'preview' || viewState === 'chart' ? 'clay-button' : 'clay-badge'}
            >
              1. Upload
            </Badge>
            <div className="w-8 h-0.5 bg-border" />
            <Badge
              variant={viewState === 'preview' || viewState === 'chart' ? 'default' : 'outline'}
              className={viewState === 'preview' ? 'clay-button' : viewState === 'chart' ? 'bg-primary/20' : 'clay-badge'}
            >
              2. Preview
            </Badge>
            <div className="w-8 h-0.5 bg-border" />
            <Badge
              variant={viewState === 'chart' ? 'default' : 'outline'}
              className={viewState === 'chart' ? 'clay-button' : 'clay-badge'}
            >
              3. Chart
            </Badge>
          </div>

          <div className="flex-1" />

          {viewState === 'chart' && (
            <Button
              variant="outline"
              onClick={handleBackToPreview}
              className="clay-badge hover:bg-muted/50 transition-colors"
            >
              <BsTable className="h-4 w-4 mr-2" />
              Back to Data
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleReset}
            className="clay-badge hover:bg-muted/50 transition-colors"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            New Upload
          </Button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {viewState === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <FileUploadDropzone onDataUpload={handleDataUpload} />
          </motion.div>
        )}

        {viewState === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <DataPreview
              data={data}
              schema={schema}
              onSchemaChange={handleSchemaChange}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <Button
                onClick={() => setIsConfigOpen(true)}
                className="clay-button text-lg px-8 py-6 h-auto hover:bg-primary/90 transition-colors"
              >
                <BiBarChart className="h-5 w-5 mr-2" />
                Convert to Chart
              </Button>
            </motion.div>

            <ChartConfigPanel
              schema={schema}
              onConfigComplete={handleChartConfig}
              isOpen={isConfigOpen}
              onOpenChange={setIsConfigOpen}
            />
          </motion.div>
        )}

        {viewState === 'chart' && chartConfig && (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <ChartView
              data={data}
              config={chartConfig}
              schema={schema}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-4"
            >
              <Button
                variant="outline"
                onClick={() => setIsConfigOpen(true)}
                className="clay-badge hover:bg-muted/50 transition-colors"
              >
                <BiBarChart className="h-4 w-4 mr-2" />
                Change Chart Type
              </Button>
              <Button
                variant="outline"
                onClick={handleBackToPreview}
                className="clay-badge hover:bg-muted/50 transition-colors"
              >
                <BsTable className="h-4 w-4 mr-2" />
                View Data Table
              </Button>
            </motion.div>

            <ChartConfigPanel
              schema={schema}
              onConfigComplete={handleChartConfig}
              isOpen={isConfigOpen}
              onOpenChange={setIsConfigOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDatasetAlert && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed bottom-6 left-6 clay-card p-4 rounded-2xl shadow-clay-lg max-w-xs"
          >
            <div className="flex items-center gap-3">
              <div className="clay-inset p-2 rounded-xl">
                <BiBarChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Dataset Loaded</p>
                <p className="text-xs text-muted-foreground">
                  {data.length.toLocaleString()} rows × {schema.length} columns
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
