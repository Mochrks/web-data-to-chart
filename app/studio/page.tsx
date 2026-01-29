'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/components/DataContext'
import ChartConfigPanel from '@/components/ChartConfigPanel'
import { ChartConfig } from '@/lib/data-types'

export default function StudioPage() {
    const { data, schema, setChartConfig } = useData()
    const router = useRouter()

    useEffect(() => {
        if (!data || data.length === 0) {
            router.push('/')
        }
    }, [data, router])

    const handleConfigComplete = (config: ChartConfig) => {
        setChartConfig(config)
        router.push('/chart')
    }

    if (!data || data.length === 0) {
        return null
    }

    return (
        <ChartConfigPanel
            schema={schema}
            onConfigComplete={handleConfigComplete}
            isOpen={true}
            onOpenChange={(open) => {
                if (!open) router.push('/dashboard')
            }}
        />
    )
}
