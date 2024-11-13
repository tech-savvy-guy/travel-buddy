// src/app/hooks/useAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // useRouter for navigation control
import { auth } from '@/config/firebaseConfig'; // Adjust import based on your config file location
import { onAuthStateChanged } from 'firebase/auth';

export default function useAuth() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                setUser(authUser);
                router.push('/dashboard'); // Redirect to dashboard on successful login
            } else {
                setUser(null);
                router.push('/'); // Redirect to landing page if not authenticated
            }
        });

        // Cleanup the listener
        return () => unsubscribe();
    }, [router]);

    return { user };
}
