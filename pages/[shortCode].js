import { collection, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';

// This function runs on the server for every request to this page.
export async function getServerSideProps(context) {
  const { shortCode } = context.params;
  
  console.log('🔍 Starting redirect process for shortCode:', shortCode);
  console.log('🗄 Querying database collection: links');
  try {
    console.log('🌐 Firestore collection path:', 'links');
    console.log('🔑 Query shortCode:', shortCode.toLowerCase());
  } catch (error) {
    console.error('⚠️ Error forming query:', error);
  }
  
  if (!shortCode) {
    console.log('❌ No shortCode provided');
    return { notFound: true };
  }
  
  try {
    console.log('🔍 Initializing Firestore connection...');
    const linksCollection = collection(db, 'links');
    console.log('📚 Collection reference created');
    
    // Try both original case and lowercase
    const shortCodeLower = shortCode.toLowerCase();
    console.log('🔍 Searching for shortCode (original):', shortCode);
    console.log('🔍 Searching for shortCode (lowercase):', shortCodeLower);
    
    const q = query(linksCollection, where('shortCode', '==', shortCodeLower));
    console.log('🔍 Query created, executing...');
    
    const querySnapshot = await getDocs(q);
    console.log('📊 Query completed, found documents:', querySnapshot.size);
    
    if (querySnapshot.size > 0) {
      console.log('✅ Document(s) found:');
      querySnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`Document ${index + 1}:`, {
          id: doc.id,
          shortCode: data.shortCode,
          originalUrl: data.originalUrl,
          userId: data.userId,
          clicks: data.clicks
        });
      });
    } else {
      console.log('❌ No documents found with shortCode:', shortCodeLower);
      // Try to query all documents to see if there are any in the collection
      try {
        const allDocsQuery = query(linksCollection);
        const allDocs = await getDocs(allDocsQuery);
        console.log('📊 Total documents in collection:', allDocs.size);
        if (allDocs.size > 0) {
          console.log('🔍 Sample shortCodes in collection:');
          allDocs.docs.slice(0, 5).forEach((doc, index) => {
            const data = doc.data();
            console.log(`Sample ${index + 1}: shortCode = '${data.shortCode}'`);
          });
        }
      } catch (allDocsError) {
        console.error('❌ Error querying all documents:', allDocsError);
      }
    }

    if (querySnapshot.empty) {
      console.log('❌ No link found for shortCode:', shortCode);
      return { 
        props: { 
          shortCode, 
          error: 'Link not found' 
        }
      };
    }

    const linkDoc = querySnapshot.docs[0];
    const linkData = linkDoc.data();
    const linkId = linkDoc.id;
    
    console.log('✅ Found link:', {
      id: linkId,
      originalUrl: linkData.originalUrl,
      shortCode: linkData.shortCode,
      clicks: linkData.clicks
    });

    // Increment the click count in Firestore.
    try {
      const linkRef = doc(db, 'links', linkId);
      await updateDoc(linkRef, {
        clicks: increment(1),
      });
      console.log('📈 Click count incremented for:', shortCode);
    } catch (updateError) {
      console.error('❌ Failed to update click count:', updateError);
      // Don't fail the redirect if click counting fails
    }

    // Ensure the URL has a proper protocol
    let destination = linkData.originalUrl;
    if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
      destination = 'https://' + destination;
    }
    
    console.log('🔀 Redirecting to:', destination);

    // Redirect the user to the original URL.
    return {
      redirect: {
        destination: destination,
        permanent: false, // Use a temporary redirect.
      },
    };
  } catch (error) {
    console.error('❌ Error in getServerSideProps:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return { 
      props: { 
        shortCode, 
        error: 'Database connection error' 
      }
    };
  }
}

// This component handles cases where redirect fails or shows loading state
export default function ShortCodePage({ shortCode, error }) {
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Link Not Found</h1>
            <p className="text-gray-400 mb-6">The shortened URL you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link href="/">
              <span className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
                Go Home
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}


