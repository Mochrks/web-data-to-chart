import { Metadata } from 'next'
import { ThemeProvider } from "@/theme/theme-provider"
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { DataProvider } from '@/components/DataContext'


const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Modern Data Visualization App',
  description: 'Upload your data and visualize it with interactive charts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DataProvider>
            <div className="flex flex-col min-h-screen relative">
              <main className="flex-grow">
                {children}
              </main>
            </div>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

