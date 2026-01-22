import { Metadata } from 'next'
import DataUploadAndVisualization from '@/components/DataUploadAndVisualization'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Modern Data Visualization App',
  description: 'Upload your data and visualize it with interactive charts',
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen gradient-bg">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12 mt-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 gradient-text animate-gradient">
            Modern Data Visualization
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your data into beautiful, interactive charts with just a drag and drop
          </p>
        </div>
        <DataUploadAndVisualization />
      </main>
      <Footer />
    </div>
  )
}
