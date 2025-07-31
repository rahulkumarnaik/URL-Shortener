import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect redirects the user based on their login status.
    if (currentUser) {
      router.push('/dashboard'); // If logged in, go to dashboard.
    } else {
      router.push('/login'); // If not logged in, go to login page.
    }
  }, [currentUser, router]);

  // Render a loading state while redirecting.
  return <div className="flex items-center justify-center h-screen">Loading...</div>;
}
