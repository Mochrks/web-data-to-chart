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
            <div className="purple-gradient-bg rounded-full py-4 px-8 flex items-center justify-between mb-8 text-white relative shadow-lg">
                <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                    <div className="bg-white/20 p-1.5 rounded-lg mr-3 backdrop-blur-sm">
                        <i className="fa-solid fa-chart-simple text-white text-lg"></i>
                    </div>
                    <h1 className="text-xl font-bold tracking-wide">{title}</h1>
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
                        <div className="floating-pill rounded-full py-2 px-5 flex items-center gap-3 bg-white shadow-sm">
                            <div className="bg-gray-100 p-2 rounded-full text-purple-500">
                                <i className="fa-solid fa-database"></i>
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="font-bold text-gray-800">{stats.rows.toLocaleString()}</span>
                                <span className="text-xs text-gray-500 font-medium">
                                    Rows Detected
                                </span>
                            </div>
                        </div>

                        {/* Stat 2: Missing Values */}
                        <div className="floating-pill rounded-full py-2 px-5 flex items-center gap-3 bg-white shadow-sm">
                            <div className={`${stats.missingDetected ? 'bg-orange-100 text-orange-500' : 'bg-purple-100 text-purple-500'} p-1 rounded-full h-6 w-6 flex items-center justify-center`}>
                                <i className={`fa-solid ${stats.missingDetected ? 'fa-triangle-exclamation' : 'fa-circle-check'} text-xs`}></i>
                            </div>
                            <span className="text-xs text-gray-700 font-medium w-20 leading-tight">
                                {stats.missingValues > 0 ? `${stats.missingValues} Missing` : 'No Missing Values'}
                            </span>
                        </div>
                    </>
                )}

                {/* Stepper (Always Visible) */}
                <div className="floating-pill rounded-full p-1.5 flex items-center gap-1 bg-white shadow-sm">
                    <Link href="/" className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${step === 1 ? 'bg-[#8b78ef] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                        1. Upload
                    </Link>
                    <Link href="/dashboard" className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${step === 2 ? 'bg-[#8b78ef] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                        2. Preview
                    </Link>
                    <div className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${step === 3 ? 'bg-[#8b78ef] text-white shadow-md' : 'text-gray-400'}`}>
                        3. Chart
                    </div>
                </div>

                {stats && (
                    <>
                        {/* Stat 3: Columns */}
                        <div className="floating-pill rounded-full py-2 px-5 flex items-center gap-3 bg-white shadow-sm">
                            <div className="bg-purple-50 p-2 rounded-lg text-purple-500">
                                <i className="fa-regular fa-file-lines"></i>
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="font-bold text-gray-800">{stats.cols}</span>
                                <span className="text-xs text-gray-500 font-medium">
                                    Columns
                                </span>
                            </div>
                        </div>

                        {/* Stat 4: Health Score */}
                        <div className="floating-pill rounded-full py-2 px-5 flex items-center gap-3 bg-white shadow-sm">
                            <div className="bg-purple-50 p-2 rounded-full text-purple-500">
                                <i className="fa-solid fa-heart"></i>
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="text-xs text-gray-500 font-medium">
                                    Health Score:
                                </span>
                                <span className="font-bold text-gray-800">{stats.healthScore}%</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
