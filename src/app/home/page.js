'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from '@/config/firebaseConfig';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { LoadingButton } from '@/components/loadingButton';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [alertState, setAlertState] = useState({ isOpen: false, title: '', description: '' });


  useEffect(() => {
    if (!document.querySelector('script[src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/tgs-player.js"]')) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/tgs-player.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email && user.email.endsWith('@vitstudent.ac.in')) {
          router.push('/dashboard');
        } else {
          signOut(auth);
          setAlertState({
            isOpen: true,
            title: "Invalid Email Domain",
            description: "Currently this application is only available for VIT students.",
          });
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ 'hd': 'vitstudent.ac.in' });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if ((user.email && user.email.endsWith('@vitstudent.ac.in')) || (user.email === 'dattasoham805@gmail.com')) {
        router.push('/dashboard');
      } else {
        await signOut(auth);
        setAlertState({
          isOpen: true,
          title: "Invalid Email Domain",
          description: "Currently this application is only available for VIT students.",
        });
      }
    } catch (error) {
      console.error("Error signing in with Google: ", error);

      if (error.code === 'auth/popup-closed-by-user') {
        setAlertState({
          isOpen: true,
          title: "Error with Sign-In",
          description: "The sign-in window was closed before completion.",
        });
      } else {
        setAlertState({
          isOpen: true,
          title: "Error with Sign-In",
          description: "Please try again in some time.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', padding: '1rem' }}>
      <Card className="w-full max-w-5xl p-8 shadow-none border-none">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2rem' }}>
          <tgs-player
            autoplay
            loop
            mode="normal"
            src="/stickers/sticker.tgs"
            style={{ width: '275px', height: '275px' }}
          ></tgs-player>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#002B4D', lineHeight: '1.2' }}>
            Hit the Road with<br />Travel Buddy!
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--muted-foreground)' }}>
            Connect with travel partners, share rides, and reduce your travel costs with ease.
          </p>

          {isLoading ? (
            <LoadingButton />
          ) : (
            <Button
              variant="default"
              size="lg"
              style={{ backgroundColor: '#1A0726', color: 'white', padding: '1.5rem 2rem', fontSize: '1.125rem', fontWeight: '400' }}
              onClick={handleGoogleSignIn}
            >
              Continue with Google
            </Button>
          )}
        </div>

        <Separator className="my-7" />

        <footer style={{ textAlign: 'center', fontSize: '15px', color: 'var(--muted-foreground)' }}>
          © 2024 Soham Datta. All rights reserved.
        </footer>
      </Card>

      <AlertDialog open={alertState.isOpen} onOpenChange={(isOpen) => setAlertState(prev => ({ ...prev, isOpen }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontSize: '25px' }}>{alertState.title}</AlertDialogTitle>
            <AlertDialogDescription style={{ fontSize: '15px' }}>
              {alertState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction style={{ fontWeight: '400' }}>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}