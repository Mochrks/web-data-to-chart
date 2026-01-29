'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/components/DataContext'
import DataPreview from '@/components/DataPreview'

export default function DashboardPage() {
    const { data, schema, setSchema } = useData()
    const router = useRouter()

    useEffect(() => {
        if (!data || data.length === 0) {
            router.push('/')
        }
    }, [data, router])

    if (!data || data.length === 0) {
        return null
    }

    return (
        <DataPreview
            data={data}
            schema={schema}
            onSchemaChange={setSchema}
            onContinue={() => router.push('/studio')}
        />
    )
}
