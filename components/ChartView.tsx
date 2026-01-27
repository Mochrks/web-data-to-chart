'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  Treemap,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Brush,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Download,
} from 'lucide-react'
import { ChartConfig, COLOR_SCHEMES, CHART_TYPES, ColumnSchema } from '@/lib/data-types'
import {
  getChartColors,
  exportChartAsPNG,
  exportChartAsSVG,
  aggregateData,
  calculateHistogramBins,
  formatLargeNumber,
} from '@/lib/chart-utils'

interface ChartViewProps {
  data: Record<string, unknown>[]
  config: ChartConfig
  schema: ColumnSchema[]
  onConfigChange?: (config: ChartConfig) => void
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="clay-dropdown p-3 rounded-xl shadow-clay-lg">
      <p className="font-medium text-sm mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ChartView({ data, config, schema }: ChartViewProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [showLegend, setShowLegend] = useState(config.showLegend)
  const [enableBrush, setEnableBrush] = useState(false)
  const [isFullscreen] = useState(false)

  const colors = useMemo(
    () => getChartColors(config.yAxes.length, config.colorScheme as keyof typeof COLOR_SCHEMES),
    [config.yAxes.length, config.colorScheme]
  )

  // Prepare chart data
  const chartData = useMemo(() => {
    // For histogram, we need special processing
    if (config.type === 'histogram') {
      const values = data
        .map(row => Number(row[config.yAxes[0]]))
        .filter(v => !isNaN(v))
      const { bins } = calculateHistogramBins(values, 15)
      return bins.map(bin => ({
        name: bin.label,
        value: bin.count,
      }))
    }

    // For treemap
    if (config.type === 'treemap') {
      const aggregated = aggregateData(data, config.xAxis, [config.yAxes[0]], 'sum')
      return aggregated.labels.map((label, i) => ({
        name: label,
        value: aggregated.datasets[0].values[i],
      }))
    }

    // Standard data transformation
    return data.slice(0, 500).map(row => {
      const item: Record<string, unknown> = {
        name: String(row[config.xAxis] ?? 'Unknown'),
      }
      config.yAxes.forEach(yKey => {
        item[yKey] = Number(row[yKey]) || 0
      })
      return item
    })
  }, [data, config])

  // Get column labels
  const getColumnLabel = useCallback((key: string) => {
    return schema.find(s => s.key === key)?.label || key
  }, [schema])

  // Chart type info
  const chartInfo = useMemo(
    () => CHART_TYPES.find(c => c.type === config.type),
    [config.type]
  )

  // Export handlers
  const handleExportPNG = useCallback(async () => {
    if (chartRef.current) {
      await exportChartAsPNG('chart-container', 'chart.png')
    }
  }, [])

  const handleExportSVG = useCallback(() => {
    if (chartRef.current) {
      exportChartAsSVG('chart-container', 'chart.svg')
    }
  }, [])

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
    }

    switch (config.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={formatLargeNumber}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {enableBrush && <Brush dataKey="name" height={30} stroke="hsl(var(--primary))" />}
            {config.yAxes.map((yKey, index) => (
              <Line
                key={yKey}
                type="monotone"
                dataKey={yKey}
                name={getColumnLabel(yKey)}
                stroke={colors[index]}
                strokeWidth={2}
                dot={{ fill: colors[index], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={formatLargeNumber}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {enableBrush && <Brush dataKey="name" height={30} stroke="hsl(var(--primary))" />}
            {config.yAxes.map((yKey, index) => (
              <Bar
                key={yKey}
                dataKey={yKey}
                name={getColumnLabel(yKey)}
                fill={colors[index]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        )

      case 'stackedBar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatLargeNumber} stroke="hsl(var(--muted-foreground))" />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {config.yAxes.map((yKey, index) => (
              <Bar
                key={yKey}
                dataKey={yKey}
                name={getColumnLabel(yKey)}
                fill={colors[index]}
                stackId="stack"
                radius={index === config.yAxes.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatLargeNumber} stroke="hsl(var(--muted-foreground))" />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {enableBrush && <Brush dataKey="name" height={30} stroke="hsl(var(--primary))" />}
            {config.yAxes.map((yKey, index) => (
              <Area
                key={yKey}
                type="monotone"
                dataKey={yKey}
                name={getColumnLabel(yKey)}
                stroke={colors[index]}
                fill={colors[index]}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        )

      case 'stackedArea':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatLargeNumber} stroke="hsl(var(--muted-foreground))" />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {config.yAxes.map((yKey, index) => (
              <Area
                key={yKey}
                type="monotone"
                dataKey={yKey}
                name={getColumnLabel(yKey)}
                stroke={colors[index]}
                fill={colors[index]}
                stackId="stack"
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        )

      case 'pie':
      case 'donut':
        const pieData = chartData.slice(0, 20).map((item, index) => ({
          ...item,
          value: Number((item as Record<string, unknown>)[config.yAxes[0]]) || 0,
          fill: colors[index % colors.length],
        }))

        return (
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={config.type === 'donut' ? '50%' : 0}
              outerRadius="80%"
              paddingAngle={2}
              label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
          </PieChart>
        )

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.slice(0, 20)}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {config.yAxes.map((yKey, index) => (
              <Radar
                key={yKey}
                name={getColumnLabel(yKey)}
                dataKey={yKey}
                stroke={colors[index]}
                fill={colors[index]}
                fillOpacity={0.3}
              />
            ))}
          </RadarChart>
        )

      case 'scatter':
        const scatterData = data.slice(0, 500).map(row => ({
          x: Number(row[config.xAxis]) || 0,
          y: Number(row[config.yAxes[0]]) || 0,
        }))

        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              dataKey="x"
              name={getColumnLabel(config.xAxis)}
              tick={{ fontSize: 12 }}
              tickFormatter={formatLargeNumber}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={getColumnLabel(config.yAxes[0])}
              tick={{ fontSize: 12 }}
              tickFormatter={formatLargeNumber}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {showLegend && <Legend />}
            <Scatter
              name={`${getColumnLabel(config.xAxis)} vs ${getColumnLabel(config.yAxes[0])}`}
              data={scatterData}
              fill={colors[0]}
            />
          </ScatterChart>
        )

      case 'bubble':
        const bubbleData = data.slice(0, 200).map(row => ({
          x: Number(row[config.xAxis]) || 0,
          y: Number(row[config.yAxes[0]]) || 0,
          z: config.yAxes[1] ? Math.abs(Number(row[config.yAxes[1]]) || 10) : 100,
        }))

        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" dataKey="x" name={getColumnLabel(config.xAxis)} tickFormatter={formatLargeNumber} />
            <YAxis type="number" dataKey="y" name={getColumnLabel(config.yAxes[0])} tickFormatter={formatLargeNumber} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {showLegend && <Legend />}
            <Scatter name="Data Points" data={bubbleData} fill={colors[0]}>
              {bubbleData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Scatter>
          </ScatterChart>
        )

      case 'histogram':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} height={60} />
            <YAxis tick={{ fontSize: 12 }} name="Frequency" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Frequency" fill={colors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        )

      case 'treemap':
        const treemapColors = getChartColors(chartData.length, config.colorScheme as keyof typeof COLOR_SCHEMES)

        return (
          <Treemap
            data={chartData}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="hsl(var(--background))"
            content={({ x, y, width, height, name, value, index }) => (
              <g>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={treemapColors[index % treemapColors.length]}
                  rx={4}
                />
                {width > 50 && height > 30 && (
                  <>
                    <text
                      x={x + width / 2}
                      y={y + height / 2 - 8}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {String(name).slice(0, 15)}
                    </text>
                    <text
                      x={x + width / 2}
                      y={y + height / 2 + 10}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={11}
                    >
                      {formatLargeNumber(value as number)}
                    </text>
                  </>
                )}
              </g>
            )}
          />
        )

      case 'mixed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatLargeNumber} stroke="hsl(var(--muted-foreground))" />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {config.yAxes.map((yKey, index) => (
              index % 2 === 0 ? (
                <Bar
                  key={yKey}
                  dataKey={yKey}
                  name={getColumnLabel(yKey)}
                  fill={colors[index]}
                  radius={[4, 4, 0, 0]}
                />
              ) : (
                <Line
                  key={yKey}
                  type="monotone"
                  dataKey={yKey}
                  name={getColumnLabel(yKey)}
                  stroke={colors[index]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: colors[index] }}
                />
              )
            ))}
          </ComposedChart>
        )

      case 'candlestick':
      case 'heatmap':
        // Placeholder for complex charts - would need additional data structure
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">{chartInfo?.label}</p>
              <p className="text-sm">Requires specialized data format</p>
            </div>
          </div>
        )

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
      <div className="clay-card rounded-3xl p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{chartInfo?.icon}</span>
            <div>
              <h2 className="text-2xl font-bold gradient-text">{chartInfo?.label}</h2>
              <p className="text-sm text-muted-foreground">
                {chartData.length.toLocaleString()} data points
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 clay-badge px-3 py-1">
              <Label htmlFor="legend-toggle" className="text-sm">Legend</Label>
              <Switch
                id="legend-toggle"
                checked={showLegend}
                onCheckedChange={setShowLegend}
              />
            </div>

            {['line', 'bar', 'area'].includes(config.type) && (
              <div className="flex items-center gap-2 clay-badge px-3 py-1">
                <Label htmlFor="brush-toggle" className="text-sm">Brush</Label>
                <Switch
                  id="brush-toggle"
                  checked={enableBrush}
                  onCheckedChange={setEnableBrush}
                />
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="clay-badge">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="clay-dropdown">
                <DropdownMenuItem onClick={handleExportPNG}>
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportSVG}>
                  Export as SVG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Axis labels */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="text-xs">
            X: {getColumnLabel(config.xAxis)}
          </Badge>
          {config.yAxes.map((yKey, index) => (
            <Badge
              key={yKey}
              variant="outline"
              className="text-xs"
              style={{ borderColor: colors[index], color: colors[index] }}
            >
              Y{config.yAxes.length > 1 ? index + 1 : ''}: {getColumnLabel(yKey)}
            </Badge>
          ))}
        </div>

        {/* Chart container */}
        <div
          id="chart-container"
          ref={chartRef}
          className="clay-inset rounded-2xl p-4"
          style={{ height: isFullscreen ? '80vh' : '500px' }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Footer info */}
        <p className="text-xs text-center text-muted-foreground mt-4">
          {config.type === 'treemap' || config.type === 'pie' || config.type === 'donut'
            ? '💡 Showing top 20 categories'
            : data.length > 500
              ? '💡 Showing first 500 data points for performance'
              : ''
          }
        </p>
      </div>
    </motion.div>
  )
}
