import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Heart, Star, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';

import toast from 'react-hot-toast';

export default function ProductCard({ product, index }: { product: any; index: number; [key: string]: any }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (auth.currentUser) {
      const checkWishlist = async () => {
        const wishlistRef = doc(db, 'wishlists', auth.currentUser!.uid);
        const snap = await getDoc(wishlistRef);
        if (snap.exists() && snap.data().productIds?.includes(product.id)) {
          setIsWishlisted(true);
        }
      };
      checkWishlist();
    }
  }, [product.id]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return toast.error('Please login to wishlist items!');
    
    try {
      const wishlistRef = doc(db, 'wishlists', auth.currentUser.uid);
      const snap = await getDoc(wishlistRef);
      
      if (!snap.exists()) {
        await setDoc(wishlistRef, { userId: auth.currentUser.uid, productIds: [product.id] });
      } else {
        await updateDoc(wishlistRef, {
          productIds: isWishlisted ? arrayRemove(product.id) : arrayUnion(product.id)
        });
      }
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'wishlists');
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-[2.5rem] overflow-hidden border-2 border-slate-900 shadow-neo transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#0e172a]"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-slate-900">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4">
            <button 
                onClick={toggleWishlist}
                className={cn(
                    "p-3 rounded-full border-2 border-slate-900 shadow-sm transition-all",
                    isWishlisted ? "bg-red-500 text-white" : "bg-white text-gray-400 hover:text-red-500"
                )}
            >
                <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
            </button>
        </div>
        <div className="absolute bottom-4 left-4 bg-white border-2 border-slate-900 text-slate-900 px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1 shadow-sm">
          <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
          <span>{product.rating}</span>
        </div>
      </div>

      <div className="p-8 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tighter leading-none">{product.name}</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 inline-block">
                {product.category}
            </span>
          </div>
          <div className="text-3xl font-black text-brand-orange leading-none italic">
            ₹{product.price}
          </div>
        </div>

        <p className="text-slate-500 text-xs font-bold leading-relaxed line-clamp-2 italic">
          "{product.description}"
        </p>

        <div className="flex items-center justify-between pt-4">
            <div className="flex items-center bg-slate-100 rounded-full p-1 border-2 border-slate-900 shadow-sm">
                <button 
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-1.5 hover:bg-white rounded-full transition-colors disabled:opacity-30"
                >
                    <Minus size={14} className="text-slate-900" />
                </button>
                <span className="w-8 text-center text-sm font-black text-slate-900 uppercase tracking-tighter">{quantity}</span>
                <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-1.5 hover:bg-white rounded-full transition-colors"
                >
                    <Plus size={14} className="text-slate-900" />
                </button>
            </div>

            <button 
                onClick={handleAddToCart}
                disabled={!product.available}
                className={cn(
                    "flex-1 ml-4 py-3 rounded-full font-black text-[10px] tracking-widest transition-all border-2 border-slate-900 shadow-sm active:translate-y-1 active:shadow-none",
                    product.available 
                        ? "bg-slate-900 text-white hover:bg-slate-800" 
                        : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border-gray-200"
                )}
            >
                {product.available ? 'add to cart' : 'out of stock'}
            </button>
        </div>
      </div>
    </motion.div>
  );
}
