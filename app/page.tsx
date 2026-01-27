import { Metadata } from 'next'
import DataUploadAndVisualization from '@/components/DataUploadAndVisualization'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BarChart3, FileSpreadsheet, Sparkles, Download, Zap, Palette } from 'lucide-react'

export const metadata: Metadata = {
  title: 'DataViz Pro - Modern Data Visualization',
  description: 'Transform your CSV data into beautiful, interactive charts with 15+ chart types. Drag & drop, real-time preview, and export to PNG/SVG.',
  keywords: ['data visualization', 'charts', 'CSV', 'analytics', 'dashboard', 'graphs'],
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen gradient-bg">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 mt-4 sm:mt-8">
          <div className="inline-flex items-center gap-2 clay-badge px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">15 Chart Types • Claymorphism Design</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 gradient-text leading-tight">
            Modern Data
            <br className="sm:hidden" />
            Visualization
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your CSV data into beautiful, interactive charts.
            <br className="hidden sm:block" />
            Drag & drop, configure with ease, and export in seconds.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { icon: FileSpreadsheet, text: 'CSV & Excel' },
              { icon: Zap, text: '100K+ Rows' },
              { icon: BarChart3, text: '15 Charts' },
              { icon: Download, text: 'PNG/SVG Export' },
              { icon: Palette, text: 'Claymorphism UI' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 clay-card px-4 py-2 rounded-xl text-sm"
              >
                <feature.icon className="h-4 w-4 text-primary" />
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main App Component */}
        <DataUploadAndVisualization />
      </main>

      <Footer />
    </div>
  )
}
