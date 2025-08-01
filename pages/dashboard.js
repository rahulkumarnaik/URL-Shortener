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

    try {
      // Generate a more reliable short code
      const shortCode = Math.random().toString(36).substring(2, 8).toLowerCase();
      
      // Ensure URL has proper protocol
      let processedUrl = newLink.trim();
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
      }
      
      await addDoc(collection(db, 'links'), {
        originalUrl: processedUrl,
        shortCode,
        clicks: 0,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      
      setNewLink('');
      setError('');
    } catch (dbError) {
      console.error('Database error:', dbError);
      setError('Failed to create short link. Please try again.');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg fill%3D%22none%22 fill-rule%3D%22evenodd%22%3E%3Cg fill%3D%22%23ffffff%22 fill-opacity%3D%220.02%22%3E%3Ccircle cx%3D%227%22 cy%3D%227%22 r%3D%227%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
      </div>
      
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-gray-800/80 backdrop-blur-lg border-b border-gray-700/50 shadow-2xl animate-slideInDown">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">LinkShortener</h1>
                  <p className="text-sm text-gray-400">Manage your links</p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* URL Shortener Form */}
          <div className="mb-8 animate-fadeInUp">
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Shorten Your URL</h2>
                <p className="text-gray-400">Transform long URLs into short, shareable links</p>
              </div>
              
              <form onSubmit={handleShorten} className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
                <div className="flex-1">
                  <input 
                    type="url" 
                    value={newLink} 
                    onChange={(e) => setNewLink(e.target.value)} 
                    placeholder="Enter a long URL to shorten" 
                    required 
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Shorten URL
                </button>
              </form>
              
              {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-slideInLeft">
                  <p className="text-sm text-red-400 text-center">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Links Table */}
          <div className="animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 bg-gray-700/50 border-b border-gray-600/50">
                <h3 className="text-lg font-semibold text-white">Your Shortened Links</h3>
                <p className="text-sm text-gray-400 mt-1">{links.length} link{links.length !== 1 ? 's' : ''} created</p>
              </div>
              
              {links.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">No links yet</h4>
                  <p className="text-gray-400">Create your first shortened URL above</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-700/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Original URL</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Short URL</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Clicks</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {links.map((link, index) => (
                        <tr key={link.id} className="hover:bg-gray-700/20 transition-colors" style={{animationDelay: `${index * 0.1}s`}}>
                          <td className="px-6 py-4">
                            {editingLink === link.id ? (
                              <input 
                                type="text" 
                                value={editingText} 
                                onChange={(e) => setEditingText(e.target.value)} 
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                              />
                            ) : (
                              <div>
                                <a 
                                  href={link.originalUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium block truncate max-w-xs sm:max-w-sm lg:max-w-md"
                                  title={link.originalUrl}
                                >
                                  {link.originalUrl}
                                </a>
                                <p className="text-xs text-gray-500 mt-1">
                                  Created {link.createdAt ? new Date(link.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                                </p>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <a 
                                href={`/${link.shortCode}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
                              >
                                {typeof window !== 'undefined' && `${window.location.host}/${link.shortCode}`}
                              </a>
                              <button 
                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${link.shortCode}`)}
                                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700/50"
                                title="Copy to clipboard"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-white font-medium">{link.clicks || 0}</span>
                              <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {editingLink === link.id ? (
                                <button 
                                  onClick={() => handleUpdate(link.id)} 
                                  className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Save
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleEdit(link)} 
                                  className="px-3 py-1 bg-yellow-600 text-white text-xs font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                                >
                                  Edit
                                </button>
                              )}
                              <button 
                                onClick={() => handleDelete(link.id)} 
                                className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
