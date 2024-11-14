import './globals.css'
import { Rubik } from 'next/font/google'
import { AuthProvider } from '../context/AuthContext'

const rubik = Rubik({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'Travel Buddy',
  description: 'Connect with travel partners, share rides, and reduce your travel costs with ease',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={rubik.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}