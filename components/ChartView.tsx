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
  FaDownload,
} from 'react-icons/fa'
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
    <div className="bg-card/95 backdrop-blur-sm p-4 rounded-sm border border-border shadow-zen text-foreground">
      <p className="font-bold text-xs uppercase tracking-widest mb-3 border-b border-border/40 pb-2">{label}</p>
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6 text-[10px] font-medium">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground uppercase tracking-wider">{entry.name}:</span>
            </div>
            <span className="font-bold text-foreground">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
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
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border)/0.3)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fontWeight: 500 }}
              stroke="hsl(var(--muted-foreground)/0.4)"
              axisLine={{ stroke: 'hsl(var(--border)/0.5)' }}
            />
            <YAxis
              tick={{ fontSize: 10, fontWeight: 500 }}
              tickFormatter={formatLargeNumber}
              stroke="hsl(var(--muted-foreground)/0.4)"
              axisLine={{ stroke: 'hsl(var(--border)/0.5)' }}
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
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border)/0.3)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fontWeight: 500 }}
              stroke="hsl(var(--muted-foreground)/0.4)"
              axisLine={{ stroke: 'hsl(var(--border)/0.5)' }}
            />
            <YAxis
              tick={{ fontSize: 10, fontWeight: 500 }}
              tickFormatter={formatLargeNumber}
              stroke="hsl(var(--muted-foreground)/0.4)"
              axisLine={{ stroke: 'hsl(var(--border)/0.5)' }}
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
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        )

      case 'stackedBar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border)/0.3)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 500 }} stroke="hsl(var(--muted-foreground)/0.4)" axisLine={{ stroke: 'hsl(var(--border)/0.5)' }} />
            <YAxis tick={{ fontSize: 10, fontWeight: 500 }} tickFormatter={formatLargeNumber} stroke="hsl(var(--muted-foreground)/0.4)" axisLine={{ stroke: 'hsl(var(--border)/0.5)' }} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {config.yAxes.map((yKey, index) => (
              <Bar
                key={yKey}
                dataKey={yKey}
                name={getColumnLabel(yKey)}
                fill={colors[index]}
                stackId="stack"
                radius={index === config.yAxes.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border)/0.3)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 500 }} stroke="hsl(var(--muted-foreground)/0.4)" axisLine={{ stroke: 'hsl(var(--border)/0.5)' }} />
            <YAxis tick={{ fontSize: 10, fontWeight: 500 }} tickFormatter={formatLargeNumber} stroke="hsl(var(--muted-foreground)/0.4)" axisLine={{ stroke: 'hsl(var(--border)/0.5)' }} />
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
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border)/0.3)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 500 }} stroke="hsl(var(--muted-foreground)/0.4)" axisLine={{ stroke: 'hsl(var(--border)/0.5)' }} />
            <YAxis tick={{ fontSize: 10, fontWeight: 500 }} tickFormatter={formatLargeNumber} stroke="hsl(var(--muted-foreground)/0.4)" axisLine={{ stroke: 'hsl(var(--border)/0.5)' }} />
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
            <PolarGrid stroke="hsl(var(--border)/0.4)" />
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
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border)/0.3)" />
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
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border)/0.3)" />
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
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border)/0.3)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} height={60} stroke="hsl(var(--muted-foreground)/0.4)" axisLine={{ stroke: 'hsl(var(--border)/0.5)' }} />
            <YAxis tick={{ fontSize: 10 }} name="Frequency" stroke="hsl(var(--muted-foreground)/0.4)" axisLine={{ stroke: 'hsl(var(--border)/0.5)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Frequency" fill={colors[0]} radius={[2, 2, 0, 0]} />
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
                  rx={2}
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
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border)/0.3)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 500 }} stroke="hsl(var(--muted-foreground)/0.4)" axisLine={{ stroke: 'hsl(var(--border)/0.5)' }} />
            <YAxis tick={{ fontSize: 10, fontWeight: 500 }} tickFormatter={formatLargeNumber} stroke="hsl(var(--muted-foreground)/0.4)" axisLine={{ stroke: 'hsl(var(--border)/0.5)' }} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {config.yAxes.map((yKey, index) => (
              index % 2 === 0 ? (
                <Bar
                  key={yKey}
                  dataKey={yKey}
                  name={getColumnLabel(yKey)}
                  fill={colors[index]}
                  radius={[2, 2, 0, 0]}
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
      <div className="bg-card border border-border/40 rounded-sm p-6 shadow-zen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{chartInfo?.icon}</span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground uppercase tracking-[0.1em]">{chartInfo?.label}</h2>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                {chartData.length.toLocaleString()} Data Points
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-3 bg-muted/20 border border-border/40 px-3 py-1.5 rounded-sm">
              <Label htmlFor="legend-toggle" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Legend</Label>
              <Switch
                id="legend-toggle"
                checked={showLegend}
                onCheckedChange={setShowLegend}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {['line', 'bar', 'area'].includes(config.type) && (
              <div className="flex items-center gap-3 bg-muted/20 border border-border/40 px-3 py-1.5 rounded-sm">
                <Label htmlFor="brush-toggle" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Brush</Label>
                <Switch
                  id="brush-toggle"
                  checked={enableBrush}
                  onCheckedChange={setEnableBrush}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-muted/20 border border-border/40 rounded-sm text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all h-auto py-1.5 px-4 shadow-none">
                  <FaDownload className="h-3 w-3 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border border-border shadow-zen rounded-sm">
                <DropdownMenuItem onClick={handleExportPNG} className="text-xs uppercase tracking-widest font-bold focus:bg-primary/10 cursor-pointer">
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportSVG} className="text-xs uppercase tracking-widest font-bold focus:bg-primary/10 cursor-pointer">
                  Export as SVG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Axis labels */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Badge variant="outline" className="text-[9px] font-mono tracking-tighter rounded-sm bg-muted/10 border-border/60 uppercase">
            DIMENSION: {getColumnLabel(config.xAxis)}
          </Badge>
          {config.yAxes.map((yKey, index) => (
            <Badge
              key={yKey}
              variant="outline"
              className="text-[9px] font-mono tracking-tighter rounded-sm bg-muted/10 uppercase"
              style={{ borderColor: colors[index], color: colors[index] }}
            >
              MEASURE {config.yAxes.length > 1 ? index + 1 : ''}: {getColumnLabel(yKey)}
            </Badge>
          ))}
        </div>

        {/* Chart container */}
        <div
          id="chart-container"
          ref={chartRef}
          className="bg-card/50 border border-border/40 rounded-sm p-4 shadow-inner-light overflow-hidden"
          style={{ minHeight: isFullscreen ? '80vh' : '500px' }}
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
