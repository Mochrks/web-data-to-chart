'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
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
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import {
  FiChevronsLeft,
  FiChevronsRight,
  FiFilter,
  FiX,
  FiDownload,
  FiSettings,
  FiEdit2,
  FiCheck,
} from 'react-icons/fi'
import { BiSortAlt2 } from 'react-icons/bi'
import { RiDraggable, RiHashtag } from 'react-icons/ri'
import { IoTextOutline, IoCalendarOutline, IoToggleOutline } from 'react-icons/io5'
import { ColumnSchema, formatValue, DataType } from '@/lib/data-types'
import { downloadCSV } from '@/lib/csv-parser'

interface DataPreviewProps {
  data: Record<string, unknown>[]
  schema: ColumnSchema[]
  onSchemaChange?: (schema: ColumnSchema[]) => void
}

type FilterType = {
  [key: string]: {
    type: 'text' | 'number'
    value: string | [number, number]
  }
}

const TypeIcon: Record<DataType, React.ComponentType<{ className?: string }>> = {
  'number': RiHashtag,
  'string': IoTextOutline,
  'date': IoCalendarOutline,
  'boolean': IoToggleOutline,
  'unknown': IoTextOutline,
}

// Sortable column header component
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

  const TypeIconComponent = TypeIcon[column.type]
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
      className={`sticky top-0 bg-card px-4 py-3 text-left font-semibold border-b-2 border-border/50
        ${isDragging ? 'shadow-clay-lg' : ''}`}
    >
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <RiDraggable className="h-4 w-4" />
        </button>

        {/* Column name (editable) */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <TypeIconComponent className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />

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
                className="h-6 px-1 text-sm w-24"
              />
              <button
                onClick={handleSaveRename}
                className="text-primary hover:text-primary/80"
              >
                <FiCheck className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <span
              className="truncate cursor-pointer hover:text-primary transition-colors"
              onClick={onSort}
              title={column.label}
            >
              {column.label}
            </span>
          )}

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <FiEdit2 className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Sort and filter buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSort}
            className={`p-1 rounded hover:bg-muted transition-colors
              ${isSorted ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <BiSortAlt2 className="h-4 w-4" />
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`p-1 rounded hover:bg-muted transition-colors
                  ${currentFilter ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <FiFilter className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 clay-dropdown p-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Filter {column.label}</h4>
                <Input
                  placeholder={`Search ${column.label}...`}
                  value={(typeof currentFilter?.value === 'string' ? currentFilter.value : '') || ''}
                  onChange={(e) => onFilter(e.target.value)}
                  className="clay-input"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </th>
  )
}

export default function DataPreview({ data, schema, onSchemaChange }: DataPreviewProps) {
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

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  // parentRef is used for scroll container reference
  const _ = parentRef // Keep ref for potential future use

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

  const renderPaginationButtons = () => {
    const buttons = []
    const maxButtons = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxButtons - 1)

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className={currentPage === i ? 'clay-button' : ''}
        >
          {i}
        </Button>
      )
    }
    return buttons
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
          <div>
            <h2 className="text-2xl font-bold text-primary">Data Preview</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredAndSortedData.length.toLocaleString()} rows
              {filteredAndSortedData.length !== data.length &&
                ` (filtered from ${data.length.toLocaleString()})`
              }
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-48 clay-input"
            />

            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(parseInt(value))}
            >
              <SelectTrigger className="w-32 clay-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="clay-dropdown">
                {[10, 25, 50, 100].map(value => (
                  <SelectItem key={value} value={value.toString()}>
                    {value} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Column visibility popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="clay-badge hover:shadow-clay">
                  <FiSettings className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 clay-dropdown p-4" align="end">
                <div className="space-y-3">
                  <h4 className="font-semibold">Visible Columns</h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-2 pr-4">
                      {columns.map(column => {
                        const Icon = TypeIcon[column.type]
                        return (
                          <div
                            key={column.key}
                            className="flex items-center gap-3 py-1"
                          >
                            <Checkbox
                              id={column.key}
                              checked={column.visible}
                              onCheckedChange={() => handleColumnToggle(column.key)}
                            />
                            <Label
                              htmlFor={column.key}
                              className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                            >
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                              {column.label}
                            </Label>
                            <Badge
                              variant="outline"
                              className={`text-xs ${column.type === 'number' ? 'badge-number' :
                                column.type === 'date' ? 'badge-date' :
                                  column.type === 'boolean' ? 'badge-boolean' :
                                    'badge-string'
                                }`}
                            >
                              {column.type}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              onClick={resetFilters}
              className="clay-badge hover:shadow-clay"
              disabled={!searchTerm && Object.keys(filters).length === 0 && !sortConfig}
            >
              <FiX className="h-4 w-4 mr-2" />
              Reset
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              className="clay-badge hover:shadow-clay"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="clay-inset rounded-2xl overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div
              ref={parentRef}
              className="overflow-auto max-h-[500px]"
            >
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-card shadow-sm">
                  <tr>
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
                <tbody>
                  {paginatedData.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-muted/50 transition-colors border-b border-border/30"
                    >
                      {visibleColumns.map(column => (
                        <td
                          key={column.key}
                          className="px-4 py-3 text-sm"
                        >
                          {formatValue(row[column.key], column.format)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DndContext>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="clay-badge"
              >
                <FiChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                className="clay-badge"
              >
                Previous
              </Button>
              {renderPaginationButtons()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
                className="clay-badge"
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="clay-badge"
              >
                <FiChevronsRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Page</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value)
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page)
                  }
                }}
                className="w-16 h-8 text-center clay-input"
              />
              <span>of {totalPages}</span>
            </div>
          </div>
        )}


      </div>
    </motion.div>
  )
}
