'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronFirst, ChevronLast, ChevronsUpDown, Filter, X, Download, Upload } from 'lucide-react'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'

interface DataPreviewProps {
  data: any[]
  onDataChange: (newData: any[]) => void
}

type FilterType = {
  [key: string]: {
    type: 'text' | 'number' | 'date'
    value: string | [number, number] | Date | null
  }
}

export default function DataPreview({ data, onDataChange }: DataPreviewProps) {
  const columns = useMemo(() => {
    if (data.length === 0) return []
    return Object.keys(data[0]).map(key => ({
      key,
      type: typeof data[0][key] === 'number' ? 'number' :
        data[0][key] instanceof Date ? 'date' : 'text'
    }))
  }, [data])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [filters, setFilters] = useState<FilterType>({})
  const [visibleColumns, setVisibleColumns] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setVisibleColumns(columns.map(col => col.key))
  }, [columns])

  const filteredAndSortedData = useMemo(() => {
    let processedData = [...data]

    // Apply search filter
    if (searchTerm) {
      processedData = processedData.filter(item =>
        Object.entries(item).some(([key, value]) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase()) &&
          visibleColumns.includes(key)
        )
      )
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, filter]) => {
      processedData = processedData.filter(item => {
        if (filter.type === 'text') {
          return item[key].toString().toLowerCase().includes((filter.value as string).toLowerCase())
        } else if (filter.type === 'number') {
          const [min, max] = filter.value as [number, number]
          return item[key] >= min && item[key] <= max
        } else if (filter.type === 'date') {
          const filterDate = filter.value as Date
          const itemDate = new Date(item[key])
          return itemDate.toDateString() === filterDate.toDateString()
        }
        return true
      })
    })

    // Apply sorting
    if (sortConfig) {
      processedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return processedData
  }, [data, searchTerm, sortConfig, filters, visibleColumns])

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (!prevConfig || prevConfig.key !== key) {
        return { key, direction: 'asc' }
      }
      if (prevConfig.direction === 'asc') {
        return { key, direction: 'desc' }
      }
      return null
    })
  }

  const handleFilter = useCallback((key: string, value: string | [number, number] | Date | null, type: 'text' | 'number' | 'date') => {
    setFilters(prev => ({
      ...prev,
      [key]: { type, value }
    }))
  }, [])

  const resetFilters = () => {
    setFilters({})
    setSearchTerm('')
    setSortConfig(null)
    setCurrentPage(1)
  }

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    )
  }

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredAndSortedData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')
    XLSX.writeFile(wb, 'exported_data.xlsx')
  }

  const importFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        onDataChange(json)
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const renderFilterPopover = (column: { key: string; type: string }) => {
    const currentFilter = filters[column.key]

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <Filter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <h4 className="font-medium leading-none">Filter {column.key}</h4>
            {column.type === 'text' && (
              <Input
                placeholder={`Filter ${column.key}...`}
                value={(currentFilter?.value as string) || ''}
                onChange={(e) => handleFilter(column.key, e.target.value, 'text')}
              />
            )}
            {column.type === 'number' && (
              <div className="grid gap-2">
                <Slider
                  min={Math.min(...data.map(item => item[column.key]))}
                  max={Math.max(...data.map(item => item[column.key]))}
                  step={1}
                  value={currentFilter?.value as [number, number] || [0, 100]}
                  onValueChange={(value) => handleFilter(column.key, value, 'number')}
                />
                <div className="flex justify-between text-sm">
                  <span>{(currentFilter?.value as [number, number])?.[0] || 0}</span>
                  <span>{(currentFilter?.value as [number, number])?.[1] || 100}</span>
                </div>
              </div>
            )}
            {column.type === 'date' && (
              <Calendar
                mode="single"
                selected={currentFilter?.value as Date || undefined}
                onSelect={(date) => handleFilter(column.key, date, 'date')}
                initialFocus
              />
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const maxButtons = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    let endPage = Math.min(totalPages, startPage + maxButtons - 1)

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          onClick={() => paginate(i)}
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
      <h2 className="text-2xl font-semibold">Data Preview</h2>
      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          type="text"
          placeholder="Search visible columns..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full sm:w-auto"
        />
        <Select onValueChange={(value: string) => setItemsPerPage(parseInt(value))}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map(value => (
              <SelectItem key={value} value={value.toString()}>{value} per page</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={resetFilters}
          variant="outline"
          className="w-full sm:w-auto"
          disabled={!searchTerm && Object.keys(filters).length === 0 && !sortConfig}
        >
          Reset Filters
          <X className="ml-2 h-4 w-4" />
        </Button>
        <Button onClick={exportToExcel} variant="outline" className="w-full sm:w-auto">
          Export
          <Download className="ml-2 h-4 w-4" />
        </Button>
        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full sm:w-auto">
          Import
          <Upload className="ml-2 h-4 w-4" />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={importFromExcel}
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">Customize Columns</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <h4 className="font-medium leading-none">Select visible columns</h4>
              {columns.map(column => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.key}
                    checked={visibleColumns.includes(column.key)}
                    onCheckedChange={() => handleColumnToggle(column.key)}
                  />
                  <label htmlFor={column.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {column.key}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="rounded-md border overflow-x-auto max-w-full">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.filter(column => visibleColumns.includes(column.key)).map((column) => (
                <TableHead key={column.key} className="whitespace-nowrap">
                  <div className="flex items-center">
                    <span
                      className="cursor-pointer"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.key}
                    </span>
                    <div className="flex ml-2">
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSort(column.key)}
                      >
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                      {renderFilterPopover(column)}
                    </div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item, index) => (
              <TableRow key={index}>
                {columns.filter(column => visibleColumns.includes(column.key)).map(column => (
                  <TableCell key={column.key}>
                    {column.type === 'date'
                      ? format(new Date(item[column.key]), 'PP')
                      : item[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto max-w-full">
          <Button
            variant="outline"
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
            className="px-2 sm:px-3"
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 sm:px-3"
          >
            Previous
          </Button>
          {renderPaginationButtons()}
          <Button
            variant="outline"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 sm:px-3"
          >
            Next
          </Button>
          <Button
            variant="outline"
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 sm:px-3"
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Go to page:</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value)
              if (page >= 1 && page <= totalPages) {
                paginate(page)
              }
            }}
            className="w-16"
          />
          <span className="text-sm">of {totalPages}</span>
        </div>
      </div>
    </motion.div>
  )
}

