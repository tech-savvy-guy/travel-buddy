'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/loadingButton'
import HomeLoadingScreen from '@/components/home-loading-screen'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from '@/config/firebaseConfig'

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [alertState, setAlertState] = useState({ isOpen: false, title: '', description: '' })

  useEffect(() => {
    const checkAuthentication = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
      setIsAuthChecking(false)
    }
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (user && !isAuthChecking) {
      router.replace('/dashboard')
    }
  }, [user, isAuthChecking, router])

  useEffect(() => {
    if (!document.querySelector('script[src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/tgs-player.js"]')) {
      const script = document.createElement('script')
      script.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/tgs-player.js"
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.addScope('profile')
      provider.addScope('email')
      provider.setCustomParameters({ 'hd': 'vitstudent.ac.in' })

      const result = await signInWithPopup(auth, provider)
      const user = result.user

      if ((user.email && user.email.endsWith('@vitstudent.ac.in')) || (user.email === 'dattasoham805@gmail.com')) {
        router.replace('/dashboard')
      } else {
        await auth.signOut()
        setAlertState({
          isOpen: true,
          title: "Invalid Email Domain",
          description: "Currently this application is only available for VIT students.",
        })
      }
    } catch (error) {
      console.error("Error signing in with Google: ", error)

      if (error.code === 'auth/popup-closed-by-user') {
        setAlertState({
          isOpen: true,
          title: "Error with Sign-In",
          description: "The sign-in window was closed before completion.",
        })
      } else {
        setAlertState({
          isOpen: true,
          title: "Error with Sign-In",
          description: "Please try again in some time.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthChecking) {
    return <HomeLoadingScreen />
  }

  if (user) {
    return null // Render nothing if user is authenticated, will be redirected in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <Card className="w-full max-w-5xl p-8 shadow-none border-none">
        <div className="flex flex-col items-center text-center gap-8">
          <tgs-player
            autoplay
            loop
            mode="normal"
            src="/stickers/sticker.tgs"
            style={{ width: '275px', height: '275px' }}
          ></tgs-player>

          <h1 className="text-4xl font-bold text-[#002B4D] leading-tight">
            Hit the Road with<br />Travel Buddy!
          </h1>

          <p className="text-lg text-muted-foreground">
            Connect with travel partners, share rides, and reduce your travel costs with ease.
          </p>

          {isLoading ? (
            <LoadingButton />
          ) : (
            <Button
              variant="default"
              size="lg"
              className="bg-[#1A0726] text-white px-8 py-6 text-lg font-normal"
              onClick={handleGoogleSignIn}
            >
              Continue with Google
            </Button>
          )}
        </div>

        <Separator className="my-7" />

        <footer className="text-center text-sm text-muted-foreground">
          © 2024 Soham Datta. All rights reserved.
        </footer>
      </Card>

      <AlertDialog open={alertState.isOpen} onOpenChange={(isOpen) => setAlertState(prev => ({ ...prev, isOpen }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">{alertState.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {alertState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="font-normal">Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}