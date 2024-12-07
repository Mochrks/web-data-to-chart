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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 bg-gradient-to-br mt-10">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Modern Data Visualization</h1>
        <DataUploadAndVisualization />
      </main>
      <Footer />
    </div>
  )
}

