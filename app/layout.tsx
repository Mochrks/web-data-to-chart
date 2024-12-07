import { Metadata } from 'next'
import { ThemeProvider } from "@/components/theme-provider"
import { Poppins } from 'next/font/google'
import '@/app/globals.css'

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"], // Add this line
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
      <body className={poppins.className}>
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

