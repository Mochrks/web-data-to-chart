'use client'

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { ColumnSchema, ChartConfig } from '@/lib/data-types'

interface DataContextType {
    data: Record<string, unknown>[]
    setData: (data: Record<string, unknown>[]) => void
    schema: ColumnSchema[]
    setSchema: (schema: ColumnSchema[]) => void
    chartConfig: ChartConfig | null
    setChartConfig: (config: ChartConfig | null) => void
    resetData: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<Record<string, unknown>[]>([])
    const [schema, setSchema] = useState<ColumnSchema[]>([])
    const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null)

    const resetData = useCallback(() => {
        setData([])
        setSchema([])
        setChartConfig(null)
    }, [])

    const value = React.useMemo(() => ({
        data, setData, schema, setSchema, chartConfig, setChartConfig, resetData
    }), [data, schema, chartConfig, resetData])

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    )
}

export function useData() {
    const context = useContext(DataContext)
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider')
    }
    return context
}
