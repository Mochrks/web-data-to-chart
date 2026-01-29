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
                className="fixed inset-0 z-50 bg-[#f3f4f8] overflow-y-auto font-sans text-[#1F2937]"
            >
                <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-[1600px] mx-auto">
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
                            <section>
                                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2 mb-2">
                                    Configure Your Chart
                                </h1>
                                <p className="text-gray-500 font-medium">
                                    Customise data mapping and appearance options
                                </p>
                            </section>

                            {/* Tabs Navigation */}
                            <nav className="flex items-center gap-8 border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('type')}
                                    className={`pb-3 text-base font-medium transition-colors border-b-2 
                                        ${activeTab === 'type' ? 'text-purple-600 border-purple-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                                >
                                    1. Chart Type
                                </button>
                                <button
                                    onClick={() => setActiveTab('data')}
                                    className={`pb-3 text-base font-medium transition-colors border-b-2
                                         ${activeTab === 'data' ? 'text-purple-600 border-purple-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                                >
                                    2. Data Mapping
                                </button>
                                <button
                                    onClick={() => setActiveTab('options')}
                                    className={`pb-3 text-base font-medium transition-colors border-b-2
                                        ${activeTab === 'options' ? 'text-purple-600 border-purple-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                                >
                                    3. Options
                                </button>
                            </nav>

                            {/* TAB CONTENT AREA */}
                            <div className="bg-[#F7F5F2] rounded-xl shadow-neumorphic-inset p-6 min-h-[400px]">
                                {activeTab === 'type' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {CHART_TYPES.map((chart) => {
                                                const Icon = ChartIcons[chart.type] || FaChartBar
                                                const isSelected = selectedType === chart.type
                                                return (
                                                    <div
                                                        key={chart.type}
                                                        onClick={() => setSelectedType(chart.type)}
                                                        className={`group flex flex-col items-center justify-center p-4 bg-[#F7F5F2] rounded-xl cursor-pointer transition-all active:scale-95 h-32 w-full
                                                            ${isSelected ? 'shadow-card-selected border-2 border-purple-200' : 'shadow-neumorphic-sm hover:shadow-neumorphic-md'}`}
                                                        style={isSelected ? { boxShadow: "0 0 0 2px #8B5CF6, 0 0 20px rgba(139, 92, 246, 0.2)" } : {}}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full"></div>
                                                        )}
                                                        <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                                        <span className={`text-xs font-semibold ${isSelected ? 'text-purple-600' : 'text-gray-600'}`}>
                                                            {chart.label}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        {selectedChartInfo && (
                                            <div className="bg-[#ede9fe] p-4 rounded-xl border border-purple-100 mt-4 flex items-start gap-3">
                                                <FaRegLightbulb className="text-purple-500 mt-1" />
                                                <div>
                                                    <h4 className="font-bold text-purple-700 text-sm mb-1">{selectedChartInfo.label}</h4>
                                                    <p className="text-purple-600 text-xs">{selectedChartInfo.description}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        {selectedChartInfo.requiresNumericY && <Badge className="bg-white/50 text-purple-700 hover:bg-white/80">Numeric Y-Axis</Badge>}
                                                        {selectedChartInfo.supportsMultipleY && <Badge className="bg-white/50 text-purple-700 hover:bg-white/80">Multi Y-Axis</Badge>}
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
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                    X-Axis (Category)
                                                </label>
                                                <Select value={xAxis} onValueChange={setXAxis}>
                                                    <SelectTrigger className="w-full bg-[#F7F5F2] shadow-neumorphic-sm border-none p-6 h-auto rounded-xl">
                                                        <SelectValue placeholder="Select X-axis" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#F7F5F2] shadow-xl border-none">
                                                        {schema.map(col => (
                                                            <SelectItem key={col.key} value={col.key}>
                                                                <div className="flex items-center gap-2">
                                                                    {col.type === 'number' ? <FaHashtag className="text-blue-500" /> : <FaFont className="text-green-500" />}
                                                                    {col.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {/* Y Axis Selection */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                    Y-Axis (Values)
                                                    {selectedChartInfo?.supportsMultipleY && <span className="text-xs font-normal text-gray-400 ml-2">(Multiple Allowed)</span>}
                                                </label>
                                                <div className="w-full bg-[#F7F5F2] shadow-neumorphic-inset rounded-xl p-4 h-64 overflow-y-auto custom-scroll">
                                                    {numericColumns.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {numericColumns.map(col => {
                                                                const isChecked = yAxes.includes(col.key);
                                                                return (
                                                                    <div
                                                                        key={col.key}
                                                                        onClick={() => handleYAxisToggle(col.key)}
                                                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
                                                                            ${isChecked ? 'bg-purple-100 shadow-sm border border-purple-200' : 'hover:bg-gray-100/50'}`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-purple-600 border-purple-600' : 'border-gray-400'}`}>
                                                                                {isChecked && <FaCheck className="text-white text-[10px]" />}
                                                                            </div>
                                                                            <span className={`text-sm font-medium ${isChecked ? 'text-purple-900' : 'text-gray-600'}`}>
                                                                                {col.label}
                                                                            </span>
                                                                        </div>
                                                                        <Badge variant="outline" className="text-[10px] bg-white text-gray-400">Number</Badge>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                            <FaRegLightbulb className="w-6 h-6 mb-2" />
                                                            <p className="text-xs">No numeric columns available</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Validation Feedback */}
                                        {!validation.valid && validation.errors.length > 0 && (
                                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                                                <FiX className="w-4 h-4" />
                                                {validation.errors[0]}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'options' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">Color Scheme</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {(Object.keys(COLOR_SCHEMES) as (keyof typeof COLOR_SCHEMES)[]).map(scheme => (
                                                        <div
                                                            key={scheme}
                                                            onClick={() => setColorScheme(scheme)}
                                                            className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3
                                                                ${colorScheme === scheme ? 'bg-white shadow-neumorphic-sm border border-gray-100' : 'hover:bg-gray-100/50'}`}
                                                        >
                                                            <div className="flex -space-x-1">
                                                                {COLOR_SCHEMES[scheme].slice(0, 3).map((c, i) => (
                                                                    <div key={i} className="w-4 h-4 rounded-full ring-1 ring-white" style={{ backgroundColor: c }} />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm font-medium capitalize text-gray-600">{scheme}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                                    <div>
                                                        <span className="block font-medium text-gray-700">Show Legend</span>
                                                        <span className="text-xs text-gray-400">Display labels for datasets</span>
                                                    </div>
                                                    <Switch checked={showLegend} onCheckedChange={setShowLegend} />
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                                    <div>
                                                        <span className="block font-medium text-gray-700">Enable Zoom</span>
                                                        <span className="text-xs text-gray-400">Interact with the chart</span>
                                                    </div>
                                                    <Switch checked={enableZoom} onCheckedChange={setEnableZoom} />
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
                                        className="px-6 py-3 bg-[#F7F5F2] rounded-xl shadow-neumorphic-sm hover:shadow-neumorphic-md transition-shadow text-sm font-semibold text-gray-600 active:shadow-neumorphic-inset"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleComplete}
                                        disabled={!validation.valid || isGenerating}
                                        className="px-8 py-3 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white rounded-xl shadow-lg shadow-purple-200 font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <FaSpinner className="animate-spin" /> Generating...
                                            </>
                                        ) : (
                                            <>
                                                Create Chart <FaCheck />
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
