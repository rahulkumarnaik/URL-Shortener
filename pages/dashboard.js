import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [editingLink, setEditingLink] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    } else {
      const q = query(collection(db, 'links'), where('userId', '==', currentUser.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const linksData = [];
        querySnapshot.forEach((doc) => {
          linksData.push({ ...doc.data(), id: doc.id });
        });
        setLinks(linksData);
      });
      return () => unsubscribe();
    }
  }, [currentUser, router]);

  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    if (newLink.trim() === '') return;
    try {
        new URL(newLink); // Validate URL
    } catch (_) {
        setError('Please enter a valid URL.');
        return;
    }

    const shortCode = Math.random().toString(36).substring(2, 8);
    await addDoc(collection(db, 'links'), {
      originalUrl: newLink,
      shortCode,
      clicks: 0,
      userId: currentUser.uid,
      createdAt: serverTimestamp(),
    });
    setNewLink('');
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'links', id));
  };

  const handleEdit = (link) => {
    setEditingLink(link.id);
    setEditingText(link.originalUrl);
  };

  const handleUpdate = async (id) => {
    if (editingText.trim() === '') return;
    await updateDoc(doc(db, 'links', id), { originalUrl: editingText });
    setEditingLink(null);
    setEditingText('');
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="flex items-center justify-between p-4 bg-white shadow-md">
        <h1 className="text-xl font-bold text-gray-800">My Links</h1>
        <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
          Logout
        </button>
      </nav>
      <main className="container p-4 mx-auto sm:p-6">
        <div className="p-6 mb-6 bg-white rounded-lg shadow">
          <form onSubmit={handleShorten} className="flex flex-col sm:flex-row">
            <input type="url" value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="Enter a long URL to shorten" required className="flex-grow p-2 mb-2 border border-gray-300 rounded-md sm:mb-0 sm:rounded-r-none" />
            <button type="submit" className="px-6 py-2 text-white bg-indigo-600 rounded-md sm:rounded-l-none hover:bg-indigo-700">
              Shorten
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Original URL</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Short URL</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Clicks</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id}>
                  <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                    {editingLink === link.id ? (
                      <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full p-1 border rounded" />
                    ) : (
                      <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate block max-w-xs">{link.originalUrl}</a>
                    )}
                  </td>
                  <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                    <a href={`/${link.shortCode}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      {typeof window !== 'undefined' && `${window.location.host}/${link.shortCode}`}
                    </a>
                  </td>
                  <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">{link.clicks}</td>
                  <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                    {editingLink === link.id ? (
                      <button onClick={() => handleUpdate(link.id)} className="px-2 py-1 mr-2 text-white bg-green-500 rounded text-xs">Save</button>
                    ) : (
                      <button onClick={() => handleEdit(link)} className="px-2 py-1 mr-2 text-white bg-yellow-500 rounded text-xs">Edit</button>
                    )}
                    <button onClick={() => handleDelete(link.id)} className="px-2 py-1 text-white bg-red-500 rounded text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
