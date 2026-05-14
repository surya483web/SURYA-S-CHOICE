import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, getDocs, setDoc, doc } from 'firebase/firestore';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { Coffee, Utensils, Star, Clock, Zap, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const INITIAL_PRODUCTS = [
  { id: 'samosa-1', name: 'Crunchy Samosa', price: 20, category: 'Snacks', rating: 4.8, available: true, image: 'https://images.unsplash.com/photo-1601050690597-df056fb1cd2a?q=80&w=800', description: 'Hand-made crispy samosas with a savory potato filling and green chutney.' },
  { id: 'vada-1', name: 'Medú Vada', price: 25, category: 'Snacks', rating: 4.7, available: true, image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=800', description: 'Deep-fried lentil donuts, crispy on the outside and soft inside.' },
  { id: 'tea-1', name: 'Masala Chai', price: 15, category: 'Drinks', rating: 4.9, available: true, image: 'https://images.unsplash.com/photo-1544787210-2213d84ad96b?q=80&w=800', description: 'Authentic Indian tea brewed with cardamom, ginger, and secret spices.' },
  { id: 'coffee-1', name: 'Filter Coffee', price: 20, category: 'Drinks', rating: 4.7, available: true, image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=800', description: 'Strong South Indian style filter coffee served with frothy milk.' },
  { id: 'vada-pav-1', name: 'Vada Pav', price: 20, category: 'Snacks', rating: 4.9, available: true, image: 'https://images.unsplash.com/photo-1606491956689-2ea8c5119c85?q=80&w=800', description: 'The legendary Mumbai burger: spicy potato vada in a soft bun.' },
  { id: 'pakoda-1', name: 'Onion Pakoda', price: 30, category: 'Snacks', rating: 4.6, available: true, image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e0?q=80&w=800', description: 'Crispy onion fritters seasoned with carom seeds and green chilies.' },
  { id: 'bun-maska-1', name: 'Bun Maska', price: 40, category: 'Breakfast', rating: 4.8, available: true, image: 'https://images.unsplash.com/photo-1619531040517-5e6065ba1860?q=80&w=800', description: 'Super soft bun slathered with dollops of fresh Amul butter.' },
  { id: 'lemon-tea-1', name: 'Lemon Tea', price: 15, category: 'Drinks', rating: 4.5, available: true, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800', description: 'Refreshing black tea with a squeeze of fresh lemon and honey.' }
];

export default function Home({ isAdmin }: { isAdmin: boolean }) {
  const [products, setProducts] = useState<any[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q')?.toLowerCase() || '';

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        setProducts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      } else if (isAdmin) {
        // Seed if empty and admin
        for (const p of INITIAL_PRODUCTS) {
          await setDoc(doc(db, 'products', p.id), p);
        }
      }
    } catch (error) {
      console.error("Products fetch failed, using defaults:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [isAdmin]);

  const syncMenu = async () => {
    setSyncing(true);
    try {
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', p.id), p);
      }
      await fetchProducts();
      toast.success('Menu items and images synced successfully!');
    } catch (e) {
      toast.error('Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(queryParam) || 
    p.category.toLowerCase().includes(queryParam)
  );

  if (loading) return <div className="py-20 text-center text-gray-400">Loading Menu...</div>;

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] rounded-[3rem] overflow-hidden border-4 border-slate-900 shadow-neo">
        <img 
          src="https://images.unsplash.com/photo-1601050690597-df056fb1cd2a?q=80&w=1600" 
          className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]" 
          alt="Surya's Choice Hero"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex items-center p-8 sm:p-16">
          <div className="max-w-3xl space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block bg-brand-orange px-4 py-1.5 rounded-full text-white text-xs font-black tracking-[0.2em] uppercase border-2 border-white shadow-sm"
            >
              Freshly Prepared Daily
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="text-5xl sm:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase"
            >
              Taste the <br />
              <span className="text-brand-orange outline-text">Authentic</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-xl font-bold italic max-w-xl"
            >
              "Quality ingredients, cooked with love for Surya's favorite customers."
            </motion.p>
          </div>
        </div>
      </section>

      {/* Categories / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Clock, label: "5 Min Service", sub: "Quick & Hot", color: "bg-blue-500" },
          { icon: Star, label: "4.8 Rating", sub: "Loved by Locals", color: "bg-yellow-500" },
          { icon: Zap, label: "Daily Fresh", sub: "Zero Preservation", color: "bg-green-500" },
          { icon: Utensils, label: "Premium Quality", sub: "Organic Ingredients", color: "bg-purple-500" }
        ].map((item, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border-2 border-slate-900 shadow-neo flex items-center space-x-4 hover:-translate-y-1 transition-transform"
          >
             <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white border-2 border-slate-900 shadow-sm", item.color)}>
               <item.icon size={24} />
             </div>
             <div>
               <div className="text-sm font-black text-slate-900 leading-none uppercase tracking-tighter">{item.label}</div>
               <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.sub}</div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Menu Section */}
      <div className="space-y-10">
        <div className="flex justify-between items-end border-b-4 border-slate-900 pb-6">
          <div className="space-y-1">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">OUR MENU</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">Handpicked Selection</p>
          </div>
          <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center space-x-4">
            {isAdmin && (
              <button 
                onClick={syncMenu}
                disabled={syncing}
                className="mr-4 text-brand-orange hover:text-white transition-colors flex items-center space-x-2 border-r-2 border-slate-700 pr-4"
              >
                <RefreshCw size={14} className={cn(syncing && "animate-spin")} />
                <span>{syncing ? 'SYNCING...' : 'SYNC MENU'}</span>
              </button>
            )}
            <span>{filteredProducts.length} Items Found</span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-200">
            <p className="text-slate-400 font-black text-2xl uppercase tracking-tighter">No items match your search</p>
            <p className="text-slate-300 font-bold italic mt-2">Try "Samosa", "Tea", or "Coffee"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {filteredProducts.map((p, index) => (
              <ProductCard key={p.id} product={p} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
