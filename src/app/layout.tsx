import type { Metadata } from 'next'
import './globals.css'
import { Leaf } from 'lucide-react'

export const metadata: Metadata = {
  title: 'EcoTrack - Carbon Footprint Platform',
  description: 'Track, understand, and reduce your carbon emissions.',
}

import Providers from '@/components/Providers'
import AuthButton from '@/components/AuthButton'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="bg-mesh"></div>
          <div className="container">
            <header className="header-nav">
              <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Leaf size={28} color="var(--color-primary)" />
                EcoTrack
              </div>
              <nav>
                <AuthButton />
              </nav>
            </header>
            <main>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
