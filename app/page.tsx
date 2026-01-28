import { Metadata } from 'next'
import DataUploadAndVisualization from '@/components/DataUploadAndVisualization'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BiBarChart } from 'react-icons/bi'
import { FiFile, FiDownload, FiZap } from 'react-icons/fi'
import { IoColorPaletteOutline } from 'react-icons/io5'

export const metadata: Metadata = {
  title: 'DTV Charts - Data to Visualization',
  description: 'Transform your CSV data into beautiful, interactive charts with 15+ chart types. Drag & drop, real-time preview, and export to PNG/SVG.',
  keywords: ['data visualization', 'charts', 'CSV', 'analytics', 'dashboard', 'graphs'],
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-12 mt-4 sm:mt-8">
          <div className="inline-flex items-center gap-2 clay-badge px-4 py-2 rounded-full mb-6">
            <BiBarChart className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">15 Chart Types • Modern Design</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight">
            DTV Charts
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your CSV data into beautiful, interactive charts.
            <br className="hidden sm:block" />
            Drag & drop, configure with ease, and export in seconds.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { icon: FiFile, text: 'CSV & Excel' },
              { icon: FiZap, text: '100K+ Rows' },
              { icon: BiBarChart, text: '15 Charts' },
              { icon: FiDownload, text: 'PNG/SVG Export' },
              { icon: IoColorPaletteOutline, text: 'Modern UI' },
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

        <DataUploadAndVisualization />
      </main>

      <Footer />
    </div>
  )
}
