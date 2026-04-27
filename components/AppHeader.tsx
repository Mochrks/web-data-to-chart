'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface AppHeaderProps {
    step: 1 | 2 | 3
    title?: string
    stats?: {
        rows: number
        missingValues: number
        missingDetected: boolean
        cols: number
        healthScore: number
    }
    rightAction?: React.ReactNode
}

export default function AppHeader({ step, title = 'DTV Charts', stats, rightAction }: AppHeaderProps) {
    const router = useRouter()

    return (
        <div className="w-full max-w-6xl mb-8 animate-fade-in-down mx-auto" style={{ animationDuration: "0.5s" }}>
            {/* Top Title Bar */}
            <div className="bg-card border border-border/60 rounded-sm py-4 px-8 flex items-center justify-between mb-8 relative">
                <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                    <div className="border border-primary/20 p-1.5 rounded-sm mr-3 bg-primary/5">
                        <i className="fa-solid fa-chart-simple text-primary text-lg"></i>
                    </div>
                    <h1 className="text-xl font-medium tracking-tight text-foreground">{title}</h1>
                </div>
                {rightAction && (
                    <div className="flex items-center">
                        {rightAction}
                    </div>
                )}
            </div>

            {/* Stats Row & Stepper */}
            <div className="flex flex-wrap justify-between items-center gap-4 px-2">
                {stats && (
                    <>
                        {/* Stat 1: Rows */}
                        <div className="rounded-sm border border-border/50 py-2 px-5 flex items-center gap-3 bg-card/50">
                            <div className="bg-muted p-2 rounded-sm text-accent">
                                <i className="fa-solid fa-database"></i>
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="font-semibold text-foreground">{stats.rows.toLocaleString()}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                    Rows
                                </span>
                            </div>
                        </div>

                        {/* Stat 2: Missing Values */}
                        <div className="rounded-sm border border-border/50 py-2 px-5 flex items-center gap-3 bg-card/50">
                            <div className={`${stats.missingDetected ? 'text-destructive' : 'text-primary'} p-1 flex items-center justify-center`}>
                                <i className={`fa-solid ${stats.missingDetected ? 'fa-triangle-exclamation' : 'fa-circle-check'} text-xs`}></i>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium w-24 leading-tight">
                                {stats.missingValues > 0 ? `${stats.missingValues} Missing` : 'Clean Data'}
                            </span>
                        </div>
                    </>
                )}

                {/* Stepper (Always Visible) */}
                <div className="relative rounded-sm border border-border/60 p-1 flex items-center gap-1 bg-card overflow-hidden">
                    {/* Background Progress Bar (Subtle) */}
                    <div 
                        className="absolute bottom-0 left-0 h-[2px] bg-primary/20 transition-all duration-700 ease-in-out"
                        style={{ width: step === 1 ? '33.33%' : step === 2 ? '66.66%' : '100%' }}
                    />
                    
                    <Link href="/" className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all z-10 ${step === 1 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                        01. UPLOAD
                    </Link>
                    <div className="w-4 h-[1px] bg-border/40 mx-1 hidden sm:block" />
                    <Link href="/dashboard" className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all z-10 ${step === 2 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                        02. PREVIEW
                    </Link>
                    <div className="w-4 h-[1px] bg-border/40 mx-1 hidden sm:block" />
                    <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all z-10 ${step === 3 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                        03. CHART
                    </div>
                </div>

                {stats && (
                    <>
                        {/* Stat 3: Columns */}
                        <div className="rounded-sm border border-border/50 py-2 px-5 flex items-center gap-3 bg-card/50">
                            <div className="text-primary/70">
                                <i className="fa-regular fa-file-lines"></i>
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="font-semibold text-foreground">{stats.cols}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                    Fields
                                </span>
                            </div>
                        </div>

                        {/* Stat 4: Health Score */}
                        <div className="rounded-sm border border-border/50 py-2 px-5 flex items-center gap-3 bg-card/50">
                            <div className="text-destructive/70">
                                <i className="fa-solid fa-heart"></i>
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                    Quality
                                </span>
                                <span className="font-semibold text-foreground">{stats.healthScore}%</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
