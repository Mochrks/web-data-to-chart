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
        <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
            {isLoading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-transparent"></div>
                    <p className="mt-4 text-foreground text-xs font-bold uppercase tracking-[0.2em]">Processing Request</p>
                </div>
            )}

            {/* Replaced Header with AppHeader */}
            <AppHeader
                step={3}
                rightAction={
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/studio')}
                            className="bg-muted/20 border border-border/40 rounded-sm text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all h-auto py-1.5 px-4 shadow-none"
                        >
                            <BiBarChart className="h-4 w-4 mr-2" />
                            Refine Settings
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard')}
                            className="bg-muted/20 border border-border/40 rounded-sm text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all h-auto py-1.5 px-4 shadow-none"
                        >
                            <BsTable className="h-4 w-4 mr-2" />
                            Back to Data
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
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center gap-4 mt-12 pb-20"
                >
                    <Button
                        variant="default"
                        onClick={handleGenerateNew}
                        className="bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98] transition-all rounded-sm px-10 py-7 text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                        Create New Exploration
                    </Button>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium opacity-60">
                        Export options are available in the chart header
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
