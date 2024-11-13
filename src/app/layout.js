import { Rubik } from 'next/font/google'
import './globals.css'

const rubik = Rubik({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'Travel Buddy',
  description: 'Connect with travel partners, share rides, and reduce your travel costs with ease',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={rubik.className}>{children}</body>
    </html>
  )
}