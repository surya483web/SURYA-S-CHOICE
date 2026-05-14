import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { ShoppingBag, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qOrders = query(collection(db, 'orders'));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      if (!snap.metadata.hasPendingWrites) {
        snap.docChanges().forEach((change) => {
          if (change.type === 'added' && !loading) {
            toast('New Order Received!', {
              icon: '🔔',
              style: {
                borderRadius: '20px',
                background: '#333',
                color: '#fff',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '10px',
                letterSpacing: '0.1em'
              },
            });
          }
        });
      }
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id })) as any[];
      setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubOrders();
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      toast.success(`Order ${status}!`);
    } catch (e) {
      toast.error('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-6xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">ALL CUSTOMER ORDERS</h1>
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mt-4 italic">Surya's Master Order List</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key="orders-list"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {orders.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-200">
              <ShoppingBag className="mx-auto text-slate-200 mb-6" size={64} />
              <p className="text-slate-400 font-black text-2xl uppercase tracking-tighter">No orders found.</p>
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
                        <h3 className="font-black text-2xl text-slate-900 leading-none uppercase tracking-tighter italic">Order #{order.orderNumber || order.id.slice(-4).toUpperCase()}</h3>
                        <span className={cn(
                          "text-[9px] font-black uppercase px-3 py-1 rounded-full border-2 border-slate-900",
                          order.status === 'completed' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        )}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">{order.userName}</p>
                      <p className="text-[9px] text-slate-300 mt-1 uppercase italic tracking-widest">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
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
      </AnimatePresence>
    </div>
  );
}
