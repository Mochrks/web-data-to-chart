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
        backgroundColor: `hsl(${index * 360 / labels.length}, 70%, 50%)`,
        borderColor: `hsl(${index * 360 / labels.length}, 70%, 40%)`,
        borderWidth: 1,
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
          },
          title: {
            display: true,
            text: 'Data Visualization',
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
      <Card>
        <CardHeader>
          <CardTitle>Data Visualization</CardTitle>
          <CardDescription>Choose a chart type to visualize your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select onValueChange={(value: ChartType) => setChartType(value)}>
              <SelectTrigger className="w-[180px]">
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
          <div className="w-full h-[400px]">{renderChart()}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

