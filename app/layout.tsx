import { Metadata } from 'next'
import { ThemeProvider } from "@/theme/theme-provider"
import { Inter } from 'next/font/google'
import '@/app/globals.css'

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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto ">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

