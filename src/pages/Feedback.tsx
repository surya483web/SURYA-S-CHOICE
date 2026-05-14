import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Star, Send, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Feedback({ user }: { user: any }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setFeedbacks(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to leave feedback.');
    if (!comment.trim()) return toast.error('Please enter a comment.');

    setLoading(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        userName: user.displayName || user.email.split('@')[0],
        comment,
        rating,
        createdAt: new Date().toISOString()
      });
      setComment('');
      setRating(5);
      toast.success('Thank you for your feedback!');
    } catch (err) {
      toast.error('Failed to send feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
      {/* Form Section */}
      <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r-4 border-slate-900 pb-16 lg:pb-0 lg:pr-16">
        <div className="space-y-12 sticky top-28">
          <div>
             <h1 className="text-6xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">FEEDBACK</h1>
             <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mt-4 italic">We value your taste!</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border-4 border-slate-900 shadow-neo space-y-8">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest italic">Rate your experience</label>
              <div className="flex space-x-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      className={cn(
                        "h-10 w-10 transition-colors",
                        s <= rating ? "text-orange-500 fill-orange-500 stroke-slate-900 stroke-2" : "text-slate-100"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest italic">Your Message</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the Samosa and Tea?"
                rows={4}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-2xl px-6 py-5 text-sm focus:bg-white transition-all outline-none font-black uppercase tracking-tighter resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !user}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-neo hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center space-x-3 disabled:opacity-50 border-2 border-slate-900"
            >
              <Send size={20} />
              <span>{loading ? 'SENDING...' : 'POST REVIEW'}</span>
            </button>
            
            {!user && (
                <p className="text-[9px] text-center text-slate-300 font-black uppercase tracking-[0.2em]">Login to share thoughts</p>
            )}
          </form>
        </div>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2 space-y-12">
        <div className="flex justify-between items-end border-b-4 border-slate-900 pb-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center space-x-4 uppercase italic">
                <MessageCircle className="text-brand-orange" size={32} />
                <span>CUSTOMER REVIEWS</span>
            </h2>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {feedbacks.length} SHARED STORIES
            </div>
        </div>

        <div className="grid gap-8">
          <AnimatePresence>
            {feedbacks.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-neo"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white border-2 border-slate-900">
                      <User size={24} />
                    </div>
                    <div>
                      <div className="font-black text-xl text-slate-900 leading-none capitalize tracking-tighter uppercase">{f.userName}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-full border-2 border-slate-900 shadow-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={cn(i < f.rating ? "text-orange-500 fill-orange-500" : "text-slate-200")} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 font-bold italic text-sm leading-relaxed border-l-4 border-brand-orange pl-6 py-2 uppercase tracking-tight">
                  "{f.comment}"
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          {feedbacks.length === 0 && (
              <p className="text-center py-32 text-slate-300 font-black uppercase text-xl tracking-tighter italic">No reviews yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
