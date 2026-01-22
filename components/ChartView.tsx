'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bar, Line, Pie, Doughnut, PolarArea, Radar } from 'react-chartjs-2'
import { Chart as ChartJS, registerables } from 'chart.js'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

ChartJS.register(...registerables)

const chartTypes = ['bar', 'line', 'pie', 'doughnut', 'polarArea', 'radar'] as const
type ChartType = typeof chartTypes[number]

interface ChartViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
}

// Modern vibrant color palette
const modernColors = [
  'rgba(139, 92, 246, 0.8)',   // Purple
  'rgba(236, 72, 153, 0.8)',   // Pink
  'rgba(59, 130, 246, 0.8)',   // Blue
  'rgba(251, 191, 36, 0.8)',   // Amber 
  'rgba(16, 185, 129, 0.8)',   // Emerald
  'rgba(249, 115, 22, 0.8)',   // Orange
]

const borderColors = [
  'rgba(139, 92, 246, 1)',
  'rgba(236, 72, 153, 1)',
  'rgba(59, 130, 246, 1)',
  'rgba(251, 191, 36, 1)',
  'rgba(16, 185, 129, 1)',
  'rgba(249, 115, 22, 1)',
]

export default function ChartView({ data }: ChartViewProps) {
  const [chartType, setChartType] = useState<ChartType>('bar')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    if (data.length > 0) {
      const labels = Object.keys(data[0])
      const datasets = labels.map((label, index) => ({
        label,
        data: data.map((item) => item[label]),
        backgroundColor: modernColors[index % modernColors.length],
        borderColor: borderColors[index % borderColors.length],
        borderWidth: 2,
      }))

      setChartData({
        labels: data.map((_, index) => `Item ${index + 1}`),
        datasets,
      })
    }
  }, [data])

  const renderChart = () => {
    if (!chartData) return null

    const commonProps = {
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              font: {
                family: 'Inter',
                size: 12,
              },
              padding: 15,
            },
          },
          title: {
            display: true,
            text: 'Data Visualization',
            font: {
              family: 'Inter',
              size: 18,
              weight: 'bold' as const,
            },
          },
        },
      },
    }

    switch (chartType) {
      case 'bar':
        return <Bar {...commonProps} />
      case 'line':
        return <Line {...commonProps} />
      case 'pie':
        return <Pie {...commonProps} />
      case 'doughnut':
        return <Doughnut {...commonProps} />
      case 'polarArea':
        return <PolarArea {...commonProps} />
      case 'radar':
        return <Radar {...commonProps} />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card className="glass-card border-2 hover-lift">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-2xl gradient-text">Data Visualization</CardTitle>
          <CardDescription className="text-base">Choose a chart type to visualize your data</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            <Select onValueChange={(value: ChartType) => setChartType(value)} defaultValue="bar">
              <SelectTrigger className="w-[200px] glass border-primary/30 hover:border-primary transition-all">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full h-[450px] p-4 rounded-xl glass">{renderChart()}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
