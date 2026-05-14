import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice, itemCount } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if (cart.length === 0) return;

    setIsOrdering(true);
    try {
      const orderRef = doc(collection(db, 'orders'));
      const orderNumber = Math.floor(1000 + Math.random() * 9000).toString();
      const orderData = {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || auth.currentUser.email,
        items: cart,
        total: totalPrice,
        status: 'pending',
        orderNumber,
        createdAt: new Date().toISOString()
      };

      await setDoc(orderRef, orderData);
      
      toast.success(`Success! Order #${orderNumber} placed.`, {
        duration: 5000,
        icon: '🚀'
      });
      
      clearCart();
      navigate('/');
    } catch (e) {
      console.error(e);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-32 h-32 bg-slate-100 rounded-[3rem] flex items-center justify-center mb-8 border-4 border-dashed border-slate-200">
          <ShoppingBag size={48} className="text-slate-300" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Your cart is empty</h2>
        <p className="text-slate-500 font-bold mt-4 uppercase tracking-[0.2em] text-[10px]">Time to add some flavor to your life!</p>
        <Link 
          to="/" 
          className="mt-10 bg-slate-900 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-neo hover:-translate-y-1 transition-all flex items-center space-x-3"
        >
          <span>Browse Menu</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">YOUR BAG</h1>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mt-4 italic">{itemCount} items ready for Surya</p>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-900 shadow-neo flex items-center space-x-6"
              >
                <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden border-2 border-slate-900 shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter truncate">{item.name}</h3>
                  <p className="text-brand-orange font-black italic">₹{item.price}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-slate-100 rounded-full p-1 border-2 border-slate-900 shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-white rounded-full transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-white rounded-full transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all border-2 border-transparent hover:border-slate-900 shadow-sm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-40 bg-slate-900 text-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[12px_12px_0px_0px_#FF6B00]">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-8">ORDER SUMMARY</h2>
          
          <div className="space-y-4 border-b-2 border-white/10 pb-8 mb-8">
            <div className="flex justify-between text-sm font-black uppercase tracking-widest text-white/50">
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-sm font-black uppercase tracking-widest text-white/50">
              <span>Packing</span>
              <span>FREE</span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-10">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Total Amount</span>
            <span className="text-5xl font-black italic tracking-tighter text-brand-orange">₹{totalPrice}</span>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={isOrdering}
            className="w-full bg-white text-slate-900 py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-neo-sm hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center space-x-3"
          >
            {isOrdering ? (
              <span className="animate-pulse">ORDERING...</span>
            ) : (
              <>
                <CreditCard size={18} />
                <span>PLACE ORDER NOW</span>
              </>
            )}
          </button>

          <p className="mt-8 text-[10px] text-center font-black text-white/30 uppercase tracking-widest leading-loose">
            By clicking place order you agree to <br /> wait patiently for Surya's magic.
          </p>
        </div>
      </div>
    </div>
  );
}
