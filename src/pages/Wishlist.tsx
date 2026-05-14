import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!auth.currentUser) return;
      try {
        const wishlistRef = doc(db, 'wishlists', auth.currentUser.uid);
        const snap = await getDoc(wishlistRef);
        
        if (snap.exists()) {
          const ids = snap.data().productIds || [];
          if (ids.length > 0) {
              const q = query(collection(db, 'products'), where('__name__', 'in', ids));
              const pSnap = await getDocs(q);
              setProducts(pSnap.docs.map(d => ({ ...d.data(), id: d.id })));
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'wishlist');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return <div className="py-20 text-center text-gray-400">Loading your favorites...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-center space-x-6 border-b-4 border-slate-900 pb-8">
         <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white border-4 border-slate-900 shadow-neo transform rotate-3">
            <Heart size={36} fill="currentColor" />
         </div>
         <div>
            <h1 className="text-6xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">MY WISHLIST</h1>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mt-4 italic">Saved for later cravings.</p>
         </div>
      </div>

      {products.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-200">
            <p className="text-slate-400 font-black text-2xl uppercase tracking-tighter mb-8 italic">Your wishlist is empty today</p>
            <Link to="/" className="inline-block bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-neo hover:translate-y-1 hover:shadow-none transition-all">
                Browse Menu
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
