'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useData } from '@/components/DataContext'
import ChartView from '@/components/ChartView'
import { Button } from '@/components/ui/button'
import { BiBarChart } from 'react-icons/bi'
import { BsTable } from 'react-icons/bs'
import AppHeader from '@/components/AppHeader'

export default function ChartPage() {
    const { data, schema, chartConfig, setChartConfig } = useData()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!data || data.length === 0) {
            router.push('/')
            return
        }
        if (!chartConfig) {
            router.push('/studio')
        }
    }, [data, chartConfig, router])

    if (!data || !chartConfig) return null

    const handleGenerateNew = async () => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.push('/studio')
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#f3f4f8] p-4 md:p-8 flex flex-col items-center">
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
                    <p className="ml-4 text-white text-lg">Generating New Chart...</p>
                </div>
            )}

            {/* Replaced Header with AppHeader */}
            <AppHeader
                step={3}
                rightAction={
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/studio')}
                            className="clay-badge hover:bg-white/50 transition-colors border-none text-gray-600"
                        >
                            <BiBarChart className="h-4 w-4 mr-2" />
                            Configure
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard')}
                            className="clay-badge hover:bg-white/50 transition-colors border-none text-gray-600"
                        >
                            <BsTable className="h-4 w-4 mr-2" />
                            Data
                        </Button>
                    </div>
                }
            />

            <div className="w-full max-w-6xl space-y-8 animate-fade-in-up">
                {/* Chart View */}
                <ChartView
                    data={data}
                    config={chartConfig}
                    schema={schema}
                    onConfigChange={setChartConfig}
                />

                {/* Bottom Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center gap-4 mt-8"
                >
                    <Button
                        variant="default"
                        onClick={handleGenerateNew}
                        className="purple-gradient-bg text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all rounded-full px-8 py-6"
                    >
                        Generate New Chart
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}
