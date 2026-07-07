import type { Metadata, Viewport } from 'next'
import { Inter, Space_Mono } from 'next/font/google'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@vercel/analytics/next'
import GlobalChatbot from '@/components/chat/global-chatbot'
import { AuthProvider } from '@/hooks/useAuth'
import CustomCursor from '@/components/landing/CustomCursor'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#050505',
}

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'https://ganapathi-mentor-ai.vercel.app'
  ),
  title: 'Ganapathi Mentor AI — AI Engineering Platform',
  description:
    'AWS-backed, multi-model AI mentoring platform for engineering teams. Code review, adaptive learning paths, DevOps automation.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

// Inter loads reliably without a build-time network connection.
// The CSS variable name --font-manrope is preserved so all existing
// components that reference var(--font-manrope) continue to work.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="snap-y snap-mandatory scroll-smooth" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} ${spaceMono.variable} font-sans antialiased bg-[#050505]`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange
        >
          <AuthProvider>
            <CustomCursor />
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
