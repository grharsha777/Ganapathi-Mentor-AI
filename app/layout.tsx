import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from "@vercel/analytics/next"
import GlobalChatbot from '@/components/chat/global-chatbot'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://ganapathi-mentor-ai.vercel.app'),
  title: 'Ganapathi Mentor AI',
  description: 'Your AI-powered learning companion for coding, concepts, and career growth',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

import { AuthProvider } from '@/hooks/useAuth'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <GlobalChatbot />
          </AuthProvider>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}