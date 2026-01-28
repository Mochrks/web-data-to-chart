'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
    ChartBar,
    LineChart,
    PieChart,
    AreaChart,
    Target,
    Circle,
    Sparkles,
    AlertCircle,
    Check,
    X,
    Hash,
    Type,
    ChevronUp,
} from 'lucide-react'
import { ColumnSchema, ChartConfig, ChartType, DataType, CHART_TYPES, COLOR_SCHEMES } from '@/lib/data-types'
import { validateChartConfig } from '@/lib/chart-utils'

interface ChartConfigPanelProps {
    schema: ColumnSchema[]
    onConfigComplete: (config: ChartConfig) => void
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

// Chart type icons mapping
const ChartIcons: Partial<Record<ChartType, typeof LineChart>> = {
    line: LineChart,
    bar: ChartBar,
    area: AreaChart,
    pie: PieChart,
    radar: Target,
    scatter: Circle,
}

export default function ChartConfigPanel({
    schema,
    onConfigComplete,
    isOpen,
    onOpenChange,
}: ChartConfigPanelProps) {
    const [selectedType, setSelectedType] = useState<ChartType>('bar')
    const [xAxis, setXAxis] = useState<string>('')
    const [yAxes, setYAxes] = useState<string[]>([])
    const [showLegend, setShowLegend] = useState(true)
    const [enableZoom, setEnableZoom] = useState(false)
    const [colorScheme, setColorScheme] = useState<keyof typeof COLOR_SCHEMES>('default')

    // Get columns by type
    const numericColumns = useMemo(() =>
        schema.filter(col => col.type === 'number'),
        [schema]
    )

    // Auto-select defaults when panel opens
    useEffect(() => {
        if (isOpen && schema.length > 0) {
            // Auto-select first column as X-axis if not already selected
            if (!xAxis && schema.length > 0) {
                setXAxis(schema[0].key)
            }
            // Auto-select first numeric column as Y-axis if not already selected
            if (yAxes.length === 0 && numericColumns.length > 0) {
                setYAxes([numericColumns[0].key])
            }
        }
    }, [isOpen, schema, numericColumns, xAxis, yAxes.length])

    // Get chart type info
    const selectedChartInfo = useMemo(() =>
        CHART_TYPES.find(c => c.type === selectedType),
        [selectedType]
    )

    // Validate configuration
    const validation = useMemo(() => {
        if (!xAxis || yAxes.length === 0) {
            return { valid: false, errors: ['Please select X-axis and at least one Y-axis column'] }
        }

        const xAxisSchema = schema.find(s => s.key === xAxis)
        const yAxisTypes = yAxes
            .map(y => schema.find(s => s.key === y)?.type)
            .filter((t): t is DataType => !!t)

        return validateChartConfig(
            selectedType,
            xAxisSchema?.type || 'string',
            yAxisTypes
        )
    }, [selectedType, xAxis, yAxes, schema])

    // Handle Y-axis selection
    const handleYAxisToggle = useCallback((columnKey: string) => {
        setYAxes(prev => {
            if (prev.includes(columnKey)) {
                return prev.filter(y => y !== columnKey)
            }
            // Check if chart type supports multiple Y
            if (!selectedChartInfo?.supportsMultipleY && prev.length >= 1) {
                return [columnKey]
            }
            return [...prev, columnKey]
        })
    }, [selectedChartInfo])

    // Handle configuration completion
    const handleComplete = useCallback(() => {
        if (!validation.valid) return

        onConfigComplete({
            type: selectedType,
            xAxis,
            yAxes,
            showLegend,
            enableZoom,
            colorScheme,
        })
    }, [selectedType, xAxis, yAxes, showLegend, enableZoom, colorScheme, validation, onConfigComplete])

    // Reset configuration
    const handleReset = useCallback(() => {
        setSelectedType('bar')
        setXAxis('')
        setYAxes([])
        setShowLegend(true)
        setEnableZoom(false)
        setColorScheme('default')
    }, [])

    // Don't render if not open
    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <div className="clay-card rounded-3xl p-6 mt-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                                <Sparkles className="h-6 w-6" />
                                Chart Configuration
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Configure your chart by selecting the chart type and mapping your data columns
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="rounded-full hover:bg-muted"
                        >
                            <ChevronUp className="h-5 w-5" />
                        </Button>
                    </div>

                    <Tabs defaultValue="type">
                        <TabsList className="clay-inset p-1 h-auto mb-6">
                            <TabsTrigger value="type" className="data-[state=active]:clay-badge">
                                1. Chart Type
                            </TabsTrigger>
                            <TabsTrigger value="data" className="data-[state=active]:clay-badge">
                                2. Data Mapping
                            </TabsTrigger>
                            <TabsTrigger value="options" className="data-[state=active]:clay-badge">
                                3. Options
                            </TabsTrigger>
                        </TabsList>

                        {/* Chart Type Selection */}
                        <TabsContent value="type">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {CHART_TYPES.map((chart) => {
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    const _Icon = ChartIcons[chart.type] || ChartBar
                                    const isSelected = selectedType === chart.type

                                    return (
                                        <button
                                            key={chart.type}
                                            onClick={() => setSelectedType(chart.type)}
                                            className={`p-4 rounded-xl text-center transition-opacity hover:opacity-80
                                                ${isSelected
                                                    ? 'clay-button'
                                                    : 'clay-card'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-2xl">{chart.icon}</span>
                                                <span className="text-sm font-medium">
                                                    {chart.label}
                                                </span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Selected chart info */}
                            {selectedChartInfo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 p-4 clay-inset rounded-xl"
                                >
                                    <p className="text-sm text-muted-foreground">
                                        <strong>{selectedChartInfo.label}:</strong> {selectedChartInfo.description}
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        {selectedChartInfo.requiresNumericY && (
                                            <Badge variant="outline" className="text-xs">
                                                Requires numeric Y-axis
                                            </Badge>
                                        )}
                                        {selectedChartInfo.supportsMultipleY && (
                                            <Badge variant="outline" className="text-xs">
                                                Multiple Y-axes supported
                                            </Badge>
                                        )}
                                        {selectedChartInfo.requiresNumericX && (
                                            <Badge variant="outline" className="text-xs">
                                                Requires numeric X-axis
                                            </Badge>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </TabsContent>

                        {/* Data Mapping */}
                        <TabsContent value="data">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* X-Axis Selection */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">X-Axis (Category/Labels)</Label>
                                    <Select value={xAxis} onValueChange={setXAxis}>
                                        <SelectTrigger className="clay-input">
                                            <SelectValue placeholder="Select X-axis column" />
                                        </SelectTrigger>
                                        <SelectContent className="clay-dropdown">
                                            {schema.map(col => (
                                                <SelectItem key={col.key} value={col.key}>
                                                    <div className="flex items-center gap-2">
                                                        {col.type === 'number' ? (
                                                            <Hash className="h-4 w-4 text-blue-500" />
                                                        ) : (
                                                            <Type className="h-4 w-4 text-green-500" />
                                                        )}
                                                        {col.label}
                                                        <Badge variant="outline" className="text-xs ml-auto">
                                                            {col.type}
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Y-Axis Selection */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">
                                        Y-Axis (Values)
                                        {selectedChartInfo?.supportsMultipleY && (
                                            <span className="font-normal text-muted-foreground ml-2">
                                                — Select one or more
                                            </span>
                                        )}
                                    </Label>

                                    <ScrollArea className="h-40 clay-inset rounded-xl p-4">
                                        <div className="space-y-2">
                                            {numericColumns.length > 0 ? (
                                                numericColumns.map(col => (
                                                    <div
                                                        key={col.key}
                                                        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                                                    >
                                                        <Checkbox
                                                            id={`y-${col.key}`}
                                                            checked={yAxes.includes(col.key)}
                                                            onCheckedChange={() => handleYAxisToggle(col.key)}
                                                        />
                                                        <Label
                                                            htmlFor={`y-${col.key}`}
                                                            className="flex items-center gap-2 cursor-pointer flex-1"
                                                        >
                                                            <Hash className="h-4 w-4 text-blue-500" />
                                                            {col.label}
                                                        </Label>
                                                        {yAxes.includes(col.key) && (
                                                            <Badge className="bg-primary/20 text-primary">
                                                                Selected
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                                    <p>No numeric columns found in your data</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>

                                    {yAxes.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {yAxes.map(y => {
                                                const col = schema.find(s => s.key === y)
                                                return (
                                                    <Badge
                                                        key={y}
                                                        variant="secondary"
                                                        className="py-1 px-3 clay-badge"
                                                    >
                                                        {col?.label || y}
                                                        <button
                                                            onClick={() => handleYAxisToggle(y)}
                                                            className="ml-2 hover:text-destructive"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Validation errors */}
                            <AnimatePresence>
                                {!validation.valid && validation.errors.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
                                    >
                                        {validation.errors.map((error, idx) => (
                                            <p key={idx} className="text-sm text-destructive flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                {error}
                                            </p>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </TabsContent>

                        {/* Options */}
                        <TabsContent value="options">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Color Scheme */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Color Scheme</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(Object.keys(COLOR_SCHEMES) as (keyof typeof COLOR_SCHEMES)[]).map(scheme => (
                                            <button
                                                key={scheme}
                                                onClick={() => setColorScheme(scheme)}
                                                className={`p-3 rounded-xl transition-all ${colorScheme === scheme
                                                    ? 'clay-button'
                                                    : 'clay-card hover:shadow-clay'
                                                    }`}
                                            >
                                                <div className="flex gap-1 mb-2">
                                                    {COLOR_SCHEMES[scheme].slice(0, 4).map((color, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-4 h-4 rounded-full"
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-medium capitalize">{scheme}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Toggle options */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 clay-inset rounded-xl">
                                        <div>
                                            <Label htmlFor="legend" className="font-medium">Show Legend</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Display chart legend with dataset labels
                                            </p>
                                        </div>
                                        <Switch
                                            id="legend"
                                            checked={showLegend}
                                            onCheckedChange={setShowLegend}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 clay-inset rounded-xl">
                                        <div>
                                            <Label htmlFor="zoom" className="font-medium">Enable Zoom & Pan</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Allow zooming and panning on the chart
                                            </p>
                                        </div>
                                        <Switch
                                            id="zoom"
                                            checked={enableZoom}
                                            onCheckedChange={setEnableZoom}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-border/50 mt-6">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="clay-badge"
                        >
                            Reset
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="clay-badge"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleComplete}
                                disabled={!validation.valid}
                                className="clay-button"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Create Chart
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
