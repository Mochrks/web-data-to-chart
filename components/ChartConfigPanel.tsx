'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    FaChartBar,
    FaChartLine,
    FaChartPie,
    FaChartArea,
    FaBullseye,
    FaDotCircle,
    FaCheck,
    FaHashtag,
    FaFont,
    FaRegLightbulb,
    FaSpinner
} from 'react-icons/fa'
import { FiX } from 'react-icons/fi'

import { ColumnSchema, ChartConfig, ChartType, CHART_TYPES, COLOR_SCHEMES } from '@/lib/data-types'
import { validateChartConfig } from '@/lib/chart-utils'
import AppHeader from '@/components/AppHeader'

interface ChartConfigPanelProps {
    schema: ColumnSchema[]
    onConfigComplete: (config: ChartConfig) => void
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

// Chart type icons mapping
const ChartIcons: Partial<Record<ChartType, typeof FaChartLine>> = {
    line: FaChartLine,
    bar: FaChartBar,
    area: FaChartArea,
    pie: FaChartPie,
    radar: FaBullseye,
    scatter: FaDotCircle,
}

// Tabs definition
type Tab = 'type' | 'data' | 'options'

export default function ChartConfigPanel({
    schema,
    onConfigComplete,
    isOpen,
    onOpenChange,
}: ChartConfigPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('type')
    const [selectedType, setSelectedType] = useState<ChartType>('bar')
    const [xAxis, setXAxis] = useState<string>('')
    const [yAxes, setYAxes] = useState<string[]>([])
    const [showLegend, setShowLegend] = useState(true)
    const [enableZoom, setEnableZoom] = useState(false)
    const [colorScheme, setColorScheme] = useState<keyof typeof COLOR_SCHEMES>('default')
    const [isGenerating, setIsGenerating] = useState(false)

    // Get columns by type
    const numericColumns = useMemo(() =>
        schema.filter(col => col.type === 'number'),
        [schema]
    )

    // Auto-select defaults
    useEffect(() => {
        if (isOpen && schema.length > 0) {
            if (!xAxis && schema.length > 0) {
                setXAxis(schema[0].key)
            }
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const yAxisTypes = yAxes
            .map(y => schema.find(s => s.key === y)?.type)
            .filter((t): t is "number" | "string" | "date" | "boolean" | "unknown" => !!t)

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
            if (!selectedChartInfo?.supportsMultipleY && prev.length >= 1) {
                return [columnKey]
            }
            return [...prev, columnKey]
        })
    }, [selectedChartInfo])

    // Handle Complete
    const handleComplete = useCallback(async () => {
        if (!validation.valid) return

        setIsGenerating(true)
        // Simulate generation delay for UX
        await new Promise(resolve => setTimeout(resolve, 800))

        onConfigComplete({
            type: selectedType,
            xAxis,
            yAxes,
            showLegend,
            enableZoom,
            colorScheme,
        })
        setIsGenerating(false)
    }, [selectedType, xAxis, yAxes, showLegend, enableZoom, colorScheme, validation, onConfigComplete])

    // Reset
    const handleReset = useCallback(() => {
        setSelectedType('bar')
        setXAxis('')
        setYAxes([])
        setShowLegend(true)
        setEnableZoom(false)
        setColorScheme('default')
        setActiveTab('type')
    }, [])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 bg-background overflow-y-auto font-sans text-foreground"
            >
                <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-[1400px] mx-auto">
                    {/* BEGIN: MainHeader - Replaced with AppHeader */}
                    <AppHeader
                        step={3}
                        title="DTV Charts Studio"
                        rightAction={
                            <button
                                onClick={() => onOpenChange(false)}
                                className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-red-500"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        }
                    />
                    {/* END: MainHeader */}

                    {/* BEGIN: MainLayout */}
                    <main className="flex-grow flex justify-center pb-10">
                        {/* Centered Configuration Area */}
                        <div className="w-full max-w-5xl flex flex-col gap-6">
                            {/* Title Section */}
                            <section className="mb-4">
                                <h1 className="text-2xl font-medium tracking-tight text-foreground mb-2">
                                    Chart Configuration
                                </h1>
                                <p className="text-muted-foreground text-sm font-light tracking-wide">
                                    Define the visual mapping and aesthetic parameters
                                </p>
                            </section>

                             {/* Tabs Navigation */}
                            <nav className="flex items-center gap-12 border-b border-border/40">
                                <button
                                    onClick={() => setActiveTab('type')}
                                    className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-2 
                                        ${activeTab === 'type' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
                                >
                                    01. Type
                                </button>
                                <button
                                    onClick={() => setActiveTab('data')}
                                    className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-2
                                         ${activeTab === 'data' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
                                >
                                    02. Mapping
                                </button>
                                <button
                                    onClick={() => setActiveTab('options')}
                                    className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-2
                                        ${activeTab === 'options' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
                                >
                                    03. Aesthetics
                                </button>
                            </nav>

                            {/* TAB CONTENT AREA */}
                            <div className="bg-card/50 border border-border/40 rounded-sm p-6 min-h-[400px] shadow-zen-subtle">
                                {activeTab === 'type' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                            {CHART_TYPES.map((chart) => {
                                                const Icon = ChartIcons[chart.type] || FaChartBar
                                                const isSelected = selectedType === chart.type
                                                return (
                                                    <div
                                                        key={chart.type}
                                                        onClick={() => setSelectedType(chart.type)}
                                                        className={`group flex flex-col items-center justify-center p-4 rounded-sm cursor-pointer transition-all active:scale-[0.98] h-32 w-full border
                                                            ${isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card border-border/40 hover:border-border shadow-zen-subtle'}`}
                                                    >
                                                        <Icon className={`w-6 h-6 mb-3 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground/60 group-hover:text-foreground'}`} />
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                                                            {chart.label}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                         {selectedChartInfo && (
                                            <div className="bg-primary/5 p-4 rounded-sm border border-primary/10 mt-8 flex items-start gap-4">
                                                <div className="p-2 rounded-sm bg-primary/10 text-primary">
                                                    <FaRegLightbulb className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">{selectedChartInfo.label}</h4>
                                                    <p className="text-foreground text-xs font-light leading-relaxed">{selectedChartInfo.description}</p>
                                                    <div className="flex gap-3 mt-3">
                                                        {selectedChartInfo.requiresNumericY && <Badge className="bg-background border-primary/20 text-primary text-[9px] uppercase tracking-tighter rounded-sm">Numeric Required</Badge>}
                                                        {selectedChartInfo.supportsMultipleY && <Badge className="bg-background border-primary/20 text-primary text-[9px] uppercase tracking-tighter rounded-sm">Multi-Series</Badge>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'data' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                            {/* X Axis */}
                                             <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                                    Primary Dimension (X)
                                                </label>
                                                <Select value={xAxis} onValueChange={setXAxis}>
                                                    <SelectTrigger className="w-full bg-card border border-border/40 p-6 h-auto rounded-sm hover:border-border/80 transition shadow-zen-subtle">
                                                        <SelectValue placeholder="Select X-axis" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-card border border-border/60 rounded-sm shadow-zen">
                                                        {schema.map(col => (
                                                            <SelectItem key={col.key} value={col.key} className="text-xs focus:bg-primary/10">
                                                                <div className="flex items-center gap-3">
                                                                    {col.type === 'number' ? <FaHashtag className="text-accent/60" /> : <FaFont className="text-primary/60" />}
                                                                    {col.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {/* Y Axis Selection */}
                                             <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                                    Measure Values (Y)
                                                    {selectedChartInfo?.supportsMultipleY && <span className="text-[10px] font-normal text-muted-foreground/50 ml-2 italic">(Multiple allowed)</span>}
                                                </label>
                                                <div className="w-full bg-card border border-border/40 rounded-sm p-4 h-64 overflow-y-auto custom-scroll shadow-zen-subtle">
                                                    {numericColumns.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {numericColumns.map(col => {
                                                                const isChecked = yAxes.includes(col.key);
                                                                return (
                                                                    <div
                                                                        key={col.key}
                                                                        onClick={() => handleYAxisToggle(col.key)}
                                                                        className={`flex items-center justify-between p-3 rounded-sm cursor-pointer transition-all border
                                                                            ${isChecked ? 'bg-primary/5 border-primary shadow-sm' : 'border-transparent hover:bg-muted/30'}`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${isChecked ? 'bg-primary border-primary' : 'border-border'}`}>
                                                                                {isChecked && <FaCheck className="text-white text-[8px]" />}
                                                                            </div>
                                                                            <span className={`text-xs font-medium ${isChecked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                                                {col.label}
                                                                            </span>
                                                                        </div>
                                                                        <Badge variant="outline" className="text-[9px] bg-muted/20 text-muted-foreground border-border/40 rounded-sm font-mono tracking-tighter">NUM</Badge>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40">
                                                            <FaRegLightbulb className="w-5 h-5 mb-3" />
                                                            <p className="text-[10px] uppercase tracking-widest">No measures found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Validation Feedback */}
                                        {!validation.valid && validation.errors.length > 0 && (
                                            <div className="bg-destructive/5 text-destructive p-4 rounded-sm text-xs font-medium border border-destructive/20 mt-6">
                                                {validation.errors[0]}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'options' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-6">
                                             <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Palette Selection</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {(Object.keys(COLOR_SCHEMES) as (keyof typeof COLOR_SCHEMES)[]).map(scheme => (
                                                        <div
                                                            key={scheme}
                                                            onClick={() => setColorScheme(scheme)}
                                                            className={`p-3 rounded-sm cursor-pointer transition-all flex items-center justify-between border
                                                                ${colorScheme === scheme ? 'bg-primary/5 border-primary' : 'bg-card border-border/40 hover:border-border shadow-zen-subtle'}`}
                                                        >
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">{scheme}</span>
                                                            <div className="flex -space-x-1.5">
                                                                {COLOR_SCHEMES[scheme].slice(0, 4).map((c, i) => (
                                                                    <div key={i} className="w-4 h-4 rounded-full border border-background shadow-sm" style={{ backgroundColor: c }} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                             <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-card border border-border/40 rounded-sm shadow-zen-subtle">
                                                    <div>
                                                        <span className="block text-xs font-bold uppercase tracking-widest text-foreground mb-1">Legend Display</span>
                                                        <span className="text-[10px] text-muted-foreground font-light tracking-wide">Toggle series identifiers</span>
                                                    </div>
                                                    <Switch checked={showLegend} onCheckedChange={setShowLegend} className="data-[state=checked]:bg-primary" />
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-card border border-border/40 rounded-sm shadow-zen-subtle">
                                                    <div>
                                                        <span className="block text-xs font-bold uppercase tracking-widest text-foreground mb-1">Enable Interaction</span>
                                                        <span className="text-[10px] text-muted-foreground font-light tracking-wide">Allow zooming and panning</span>
                                                    </div>
                                                    <Switch checked={enableZoom} onCheckedChange={setEnableZoom} className="data-[state=checked]:bg-primary" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Actions Footer */}
                            <div className="flex justify-end pt-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleReset}
                                        className="px-6 py-3 bg-card border border-border/60 rounded-sm shadow-sm hover:bg-muted/20 transition-all text-[10px] font-bold uppercase tracking-widest text-muted-foreground active:scale-95"
                                    >
                                        Reset Settings
                                    </button>
                                     <button
                                        onClick={handleComplete}
                                        disabled={!validation.valid || isGenerating}
                                        className="px-8 py-3 bg-primary text-primary-foreground rounded-sm shadow-sm font-bold text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <FaSpinner className="animate-spin text-[10px]" /> PROCESSING...
                                            </>
                                        ) : (
                                            <>
                                                GENERATE VISUAL <FaCheck className="text-[10px]" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>


                    </main>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
