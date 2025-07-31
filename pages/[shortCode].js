import { collection, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

// This function runs on the server for every request to this page.
export async function getServerSideProps(context) {
  const { shortCode } = context.params;
  const linksCollection = collection(db, 'links');
  const q = query(linksCollection, where('shortCode', '==', shortCode));
  
  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If no link is found, return a 404 page.
      return { notFound: true };
    }

    const linkDoc = querySnapshot.docs[0];
    const linkData = linkDoc.data();
    const linkId = linkDoc.id;

    // Increment the click count in Firestore.
    const linkRef = doc(db, 'links', linkId);
    await updateDoc(linkRef, {
      clicks: increment(1),
    });

    // Redirect the user to the original URL.
    return {
      redirect: {
        destination: linkData.originalUrl,
        permanent: false, // Use a temporary redirect.
      },
    };
  } catch (error) {
    console.error("Error fetching short link:", error);
    return { notFound: true };
  }
}

// This component is not rendered because the user is always redirected.
export default function ShortCodePage() {
  return null;
}


// =======================================================================
// FOLDER: pages
// FILE: index.js
// =======================================================================

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