import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wishlist from './pages/Wishlist';
import Feedback from './pages/Feedback';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data()?.role === 'admin' || user.email === 'surya.murali109@gmail.com');
        } else {
          // Default user role
          const isAdminEmail = user.email === 'surya.murali109@gmail.com';
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            role: isAdminEmail ? 'admin' : 'user'
          });
          setIsAdmin(isAdminEmail);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-brand-orange text-white font-black text-2xl uppercase tracking-tighter">Loading SURYA'S CHOICE...</div>;

  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
          <Navbar user={user} isAdmin={isAdmin} />
          <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Home isAdmin={isAdmin} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/wishlist" element={user ? <Wishlist /> : <Navigate to="/login" />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/feedback" element={<Feedback user={user} />} />
              <Route 
                path="/dashboard" 
                element={isAdmin ? <Dashboard /> : <Navigate to="/" />} 
              />
              <Route 
                path="/orders" 
                element={isAdmin ? <Orders /> : <Navigate to="/" />} 
              />
            </Routes>
          </main>
          {/* Placeholder for real-world toast notifications */}
          <Toaster position="bottom-center" />
        </div>
      </CartProvider>
    </Router>
  );
}
