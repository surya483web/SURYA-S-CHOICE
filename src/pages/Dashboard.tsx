import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore';
import { ShoppingBag, Package, CheckCircle, Clock, AlertCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');

  useEffect(() => {
    // Real-time orders
    const qOrders = query(collection(db, 'orders'));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id })) as any[];
      setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });

    // Real-time products
    const qProducts = query(collection(db, 'products'));
    const unsubProducts = onSnapshot(qProducts, (snap) => {
      setProducts(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      toast.success(`Order ${status}!`);
    } catch (e) {
      toast.error('Failed to update status.');
    }
  };

  const toggleInventory = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'products', id), { available: !current });
      toast.success('Inventory updated!');
    } catch (e) {
      toast.error('Failed to update inventory.');
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-slate-900 pb-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">OWNER PANEL</h1>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mt-4 italic">Hello, Surya! Manage your empire here.</p>
        </div>
        <div className="bg-slate-100 p-2 rounded-[2rem] flex border-2 border-slate-900 shadow-sm">
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn("px-8 py-3 rounded-full text-xs font-black transition-all uppercase tracking-widest", activeTab === 'orders' ? "bg-slate-900 text-white shadow-neo" : "text-slate-400 hover:text-slate-600")}
          >
            Orders [{orders.length}]
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={cn("px-8 py-3 rounded-full text-xs font-black transition-all uppercase tracking-widest", activeTab === 'inventory' ? "bg-slate-900 text-white shadow-neo" : "text-slate-400 hover:text-slate-600")}
          >
            Inventory
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'orders' ? (
          <motion.div 
            key="orders"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {orders.length === 0 ? (
                <div className="py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-200">
                    <ShoppingBag className="mx-auto text-slate-200 mb-6" size={64} />
                    <p className="text-slate-400 font-black text-2xl uppercase tracking-tighter">No orders yet. Sit tight!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex items-start space-x-6">
                                <div className={cn(
                                    "w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 border-2 border-slate-900 shadow-sm",
                                    order.status === 'completed' ? "bg-green-500 text-white" : "bg-brand-orange text-white"
                                )}>
                                    {order.status === 'completed' ? <CheckCircle size={28} /> : <Clock size={28} />}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <h3 className="font-black text-2xl text-slate-900 leading-none uppercase tracking-tighter italic">Order #{order.id.slice(-4).toUpperCase()}</h3>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase px-3 py-1 rounded-full border-2 border-slate-900",
                                            order.status === 'completed' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                        )}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">{order.userName}</p>
                                    <div className="mt-5 space-y-2">
                                        {order.items.map((it: any, i: number) => (
                                            <div key={i} className="text-xs font-black flex items-center space-x-3 uppercase tracking-tighter">
                                                <span className="text-brand-orange">×{it.quantity}</span>
                                                <span className="text-slate-900">{it.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-6 min-w-[220px]">
                                <div className="text-4xl font-black text-slate-900 italic tracking-tighter">₹{order.total}</div>
                                {order.status !== 'completed' && (
                                    <div className="flex gap-3 w-full">
                                        <button 
                                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                            className="flex-1 bg-white text-red-500 border-2 border-slate-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors shadow-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={() => updateOrderStatus(order.id, 'completed')}
                                            className="flex-1 bg-slate-900 text-white py-3 border-2 border-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm"
                                        >
                                            Done
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="inventory"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {products.map(product => (
                <div key={product.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-neo space-y-6">
                    <div className="flex items-center space-x-6">
                        <img src={product.image} className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-900 shadow-sm" />
                        <div>
                            <h3 className="font-black text-xl text-slate-900 leading-none uppercase tracking-tighter italic">{product.name}</h3>
                            <p className="text-2xl font-black text-brand-orange mt-2 italic">₹{product.price}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t-2 border-slate-100">
                        <div className="flex items-center space-x-3">
                            <span className={cn(
                                "w-3 h-3 rounded-full border-2 border-slate-900 shadow-sm",
                                product.available ? "bg-green-500" : "bg-red-500"
                            )} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                {product.available ? 'In Stock' : 'Out Stock'}
                            </span>
                        </div>
                        <button 
                            onClick={() => toggleInventory(product.id, product.available)}
                            className={cn(
                                "p-3 rounded-xl transition-all border-2 border-slate-900 shadow-sm",
                                product.available ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                            )}
                        >
                            <RefreshCcw size={20} />
                        </button>
                    </div>
                </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
