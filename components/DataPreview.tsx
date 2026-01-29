'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'

// React Icons
import { FiEdit2, FiCheck, FiFilter } from 'react-icons/fi'
import { RiDraggable } from 'react-icons/ri'

import { ColumnSchema, formatValue } from '@/lib/data-types'
import { downloadCSV } from '@/lib/csv-parser'
import AppHeader from '@/components/AppHeader'

interface DataPreviewProps {
  data: Record<string, unknown>[]
  schema: ColumnSchema[]
  onSchemaChange?: (schema: ColumnSchema[]) => void
  onContinue: () => void
}

type FilterType = {
  [key: string]: {
    type: 'text' | 'number'
    value: string | [number, number]
  }
}

// Stats helper
function calculateStats(data: Record<string, unknown>[], schema: ColumnSchema[]) {
  if (!data.length) return { missingValues: 0, healthScore: 0, missingDetected: false }

  let missingCount = 0
  const totalCells = data.length * schema.length

  data.forEach(row => {
    schema.forEach(col => {
      const val = row[col.key]
      if (val === null || val === undefined || val === '') {
        missingCount++
      }
    })
  })

  const healthScore = Math.max(0, Math.round(((totalCells - missingCount) / totalCells) * 100))

  return {
    missingValues: missingCount,
    healthScore,
    missingDetected: missingCount > 0
  }
}


// Sortable column header component adapted for the New Design
function SortableColumnHeader({
  column,
  onSort,
  sortConfig,
  onFilter,
  currentFilter,
  onRename,
}: {
  column: ColumnSchema
  onSort: () => void
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null
  onFilter: (value: string) => void
  currentFilter?: { type: 'text' | 'number'; value: string | [number, number] }
  onRename: (newLabel: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(column.label)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.key })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  const isSorted = sortConfig?.key === column.key

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSaveRename = () => {
    if (editValue.trim() && editValue !== column.label) {
      onRename(editValue.trim())
    }
    setIsEditing(false)
  }

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`py-4 px-4 whitespace-nowrap text-xs font-bold text-gray-700 uppercase tracking-wider relative group
        ${isDragging ? 'bg-purple-50' : ''}`}
    >
      <div className="flex items-center gap-2">
        {/* Drag Handle */}
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-purple-600 transition-colors"
        >
          <RiDraggable className="w-4 h-4" />
        </span>

        {/* Content */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename()
                  if (e.key === 'Escape') {
                    setEditValue(column.label)
                    setIsEditing(false)
                  }
                }}
                className="h-6 px-1 text-xs w-24 bg-white border-purple-200 text-gray-800"
              />
              <button onClick={handleSaveRename} className="text-green-600 hover:text-green-700">
                <FiCheck className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <span
                className="cursor-pointer hover:text-purple-600 transition-colors text-gray-700 font-bold"
                onClick={onSort}
              >
                # {column.label}
              </span>
              <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-purple-600 transition-opacity">
                <FiEdit2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        {/* Sort/Filter Icons */}
        <div className="flex items-center gap-1 ml-auto">
          <i
            className={`fa-solid fa-sort cursor-pointer transition-colors ${isSorted ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={onSort}
          ></i>

          <Popover>
            <PopoverTrigger asChild>
              <button className={`transition-colors ${currentFilter ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <FiFilter className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 shadow-xl border-purple-100 rounded-2xl">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-800">Filter {column.label}</h4>
                <Input
                  placeholder={`Search ${column.label}...`}
                  value={(typeof currentFilter?.value === 'string' ? currentFilter.value : '') || ''}
                  onChange={(e) => onFilter(e.target.value)}
                  className="bg-gray-50 border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </th>
  )
}

export default function DataPreview({ data, schema, onSchemaChange, onContinue }: DataPreviewProps) {
  const [columns, setColumns] = useState<ColumnSchema[]>(schema)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [filters, setFilters] = useState<FilterType>({})
  const parentRef = useRef<HTMLDivElement>(null)

  // Update columns when schema changes
  useEffect(() => {
    setColumns(schema)
  }, [schema])

  // DnD sensors with fixed activation constraint
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Stats
  const stats = useMemo(() => calculateStats(data, schema), [data, schema])

  // Visible columns only
  const visibleColumns = useMemo(() =>
    columns.filter(col => col.visible).sort((a, b) => a.order - b.order),
    [columns]
  )

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let processedData = [...data]

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      processedData = processedData.filter(item =>
        visibleColumns.some(col => {
          const value = item[col.key]
          return value !== null && value !== undefined &&
            String(value).toLowerCase().includes(lowerSearch)
        })
      )
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, filter]) => {
      processedData = processedData.filter(item => {
        const value = item[key]
        if (value === null || value === undefined) return false

        if (filter.type === 'text') {
          return String(value).toLowerCase().includes((filter.value as string).toLowerCase())
        } else if (filter.type === 'number') {
          const [min, max] = filter.value as [number, number]
          const numValue = Number(value)
          return !isNaN(numValue) && numValue >= min && numValue <= max
        }
        return true
      })
    })

    // Apply sorting
    if (sortConfig) {
      processedData.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]

        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
        }

        const aStr = String(aVal)
        const bStr = String(bVal)
        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
      })
    }

    return processedData
  }, [data, searchTerm, sortConfig, filters, visibleColumns])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedData.slice(start, start + itemsPerPage)
  }, [filteredAndSortedData, currentPage, itemsPerPage])

  // Handlers
  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return null
    })
  }, [])

  const handleFilter = useCallback((key: string, value: string) => {
    setFilters(prev => {
      if (!value) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: removed, ...rest } = prev
        return rest
      }
      return { ...prev, [key]: { type: 'text', value } }
    })
    setCurrentPage(1)
  }, [])

  const handleColumnToggle = useCallback((key: string) => {
    setColumns(prev => {
      const updated = prev.map(col =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
      onSchemaChange?.(updated)
      return updated
    })
  }, [onSchemaChange])

  const handleColumnRename = useCallback((key: string, newLabel: string) => {
    setColumns(prev => {
      const updated = prev.map(col =>
        col.key === key ? { ...col, label: newLabel } : col
      )
      onSchemaChange?.(updated)
      return updated
    })
  }, [onSchemaChange])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setColumns(prev => {
      const oldIndex = prev.findIndex(col => col.key === active.id)
      const newIndex = prev.findIndex(col => col.key === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex).map((col, idx) => ({
        ...col,
        order: idx,
      }))
      onSchemaChange?.(reordered)
      return reordered
    })
  }, [onSchemaChange])

  const handleExport = useCallback(() => {
    const visibleKeys = visibleColumns.map(col => col.key)
    downloadCSV(filteredAndSortedData, 'export.csv', visibleKeys)
  }, [filteredAndSortedData, visibleColumns])

  const resetFilters = useCallback(() => {
    setFilters({})
    setSearchTerm('')
    setSortConfig(null)
    setCurrentPage(1)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 md:p-8 overflow-x-hidden bg-[#f3f4f8] text-[#1f2937] font-sans w-full pb-32">
      {/* BEGIN: Header Section - Replaced with AppHeader */}
      <AppHeader
        step={2}
        stats={{
          rows: data.length,
          missingValues: stats.missingValues,
          missingDetected: stats.missingDetected,
          cols: schema.length,
          healthScore: stats.healthScore
        }}
      />
      {/* END: Header Section */}

      {/* BEGIN: Main Content Area */}
      <main className="w-full max-w-6xl glass-panel rounded-[3rem] p-6 md:p-8 mb-10 relative bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_20px_25px_-5px_rgba(0,0,0,0.05),inset_0_0_20px_rgba(255,255,255,0.5)]">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-grow max-w-md">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border-none rounded-full bg-gray-100/50 text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-purple-300 transition-shadow shadow-inner outline-none"
                placeholder="Search..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(parseInt(value))}
            >
              <SelectTrigger className="bg-gray-100/50 px-4 py-2 rounded-full text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-200/50 transition border-none shadow-none h-auto w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map(value => (
                  <SelectItem key={value} value={value.toString()}>
                    {value} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Column Toggle Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="bg-gray-100/50 px-4 py-2 rounded-full text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-200/50 transition">
                  Columns <i className="fa-solid fa-chevron-down text-xs"></i>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4 rounded-xl shadow-xl" align="end">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Visible Columns</h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-2 pr-4">
                      {columns.map(column => (
                        <div key={column.key} className="flex items-center gap-3 py-1">
                          <Checkbox
                            id={column.key}
                            checked={column.visible}
                            onCheckedChange={() => handleColumnToggle(column.key)}
                            className="border-gray-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                          />
                          <Label htmlFor={column.key} className="text-sm cursor-pointer flex-1 font-medium text-gray-600">
                            {column.label}
                          </Label>
                          <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-400 border-gray-200">
                            {column.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>

            <button
              onClick={resetFilters}
              className="bg-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
            >
              Reset
            </button>
            <button
              onClick={handleExport}
              className="bg-transparent px-4 py-2 text-sm font-medium text-purple-500 hover:text-purple-700 transition flex items-center gap-2"
            >
              <i className="fa-solid fa-file-export"></i>
              Export
            </button>
          </div>
        </div>

        {/* Data Table Container */}
        <div
          className="w-full overflow-x-auto custom-scroll pb-4 rounded-3xl bg-white/50"
          style={{ minHeight: "400px" }}
          ref={parentRef}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table
              className="w-full text-left border-collapse"
              style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}
            >
              {/* Table Head */}
              <thead>
                <tr className="thead-gradient border-b border-gray-200">
                  <SortableContext
                    items={visibleColumns.map(col => col.key)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {visibleColumns.map(column => (
                      <SortableColumnHeader
                        key={column.key}
                        column={column}
                        onSort={() => handleSort(column.key)}
                        sortConfig={sortConfig}
                        onFilter={(value) => handleFilter(column.key, value)}
                        currentFilter={filters[column.key]}
                        onRename={(newLabel) => handleColumnRename(column.key, newLabel)}
                      />
                    ))}
                  </SortableContext>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody className="text-sm text-gray-600 font-medium">
                {paginatedData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-purple-50/50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                  >
                    {visibleColumns.map(column => (
                      <td key={column.key} className="py-4 px-4 whitespace-nowrap border-b border-gray-100 text-gray-700">
                        {formatValue(row[column.key], column.format)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </DndContext>
        </div>
      </main>

      {/* Footer Control Bar - Fixed at bottom */}

      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center w-full pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl p-2 rounded-full border border-white/50 shadow-2xl flex flex-wrap items-center justify-between gap-4 pointer-events-auto max-w-5xl w-full mx-4">

          {/* Pagination */}
          <div className="px-4 py-2 rounded-full flex items-center gap-4 text-gray-600 text-sm">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="hover:text-purple-600 disabled:opacity-50 transition-colors"
            >
              <i className="fa-solid fa-chevron-left text-lg"></i>
            </button>
            <div className="flex items-center gap-1">
              <span className="bg-purple-100 rounded px-2 py-0.5 text-purple-700 font-bold">
                {currentPage}
              </span>
              <span className="text-xs font-medium text-gray-400">/ {totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="hover:text-purple-600 disabled:opacity-50 transition-colors"
            >
              <i className="fa-solid fa-chevron-right text-lg"></i>
            </button>

          </div>

          {/* Central Action Cluster */}
          <div className="flex items-center gap-6 px-4 border-l border-r border-gray-200">
            {/* Circular Progress */}
            <div className="flex items-center gap-3 hidden sm:flex">
              <div
                className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-inner"
                style={{
                  background: "conic-gradient(#8b5cf6 66%, #f3f4f6 0)",
                }}
              >
                <div className="w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center">
                  <span className="text-[10px] font-bold text-purple-600">2/3</span>
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-gray-800">Preview</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                  Step 2
                </span>
              </div>
            </div>
            {/* Convert Button (Using onContinue) */}
            <button
              onClick={onContinue}
              className="purple-gradient-bg text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              Convert to Chart <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {/* Right Side Settings */}
          <div className="flex gap-4 px-4 min-w-[100px] justify-end">
            <button className="flex flex-col items-center group text-gray-400 hover:text-purple-600 transition">
              <i className="fa-regular fa-floppy-disk text-xl mb-0.5"></i>
              <span className="text-[10px] font-medium">Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
