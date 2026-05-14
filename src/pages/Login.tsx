import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Determine the real email for Firebase
      let targetEmail = identifier;
      
      if (identifier.toLowerCase() === 'surya') {
        targetEmail = 'surya.murali109@gmail.com';
      } else if (!identifier.includes('@')) {
        // Create an internal email for username-based login
        targetEmail = `${identifier.toLowerCase()}@user.suryaschoice.com`;
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, targetEmail, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, targetEmail, password);
        await updateProfile(res.user, { displayName: identifier });
        await setDoc(doc(db, 'users', res.user.uid), {
          email: targetEmail,
          username: identifier,
          role: 'user',
          createdAt: new Date().toISOString()
        });
      }
      navigate('/');
    } catch (err: any) {
      // Special case: if owner account doesn't exist yet, create it automatically on first attempt
      if (identifier.toLowerCase() === 'surya' && isLogin && err.code === 'auth/user-not-found') {
        try {
          const res = await createUserWithEmailAndPassword(auth, 'surya.murali109@gmail.com', 'SURYA@123');
          await setDoc(doc(db, 'users', res.user.uid), {
            email: 'surya.murali109@gmail.com',
            username: 'SURYA (Owner)',
            role: 'admin',
            createdAt: new Date().toISOString()
          });
          navigate('/');
          return;
        } catch (innerErr) {
          setError('Owner account setup failed. Contact system admin.');
        }
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Login failed: Email/Password login is not enabled in Firebase. Please enable it in the Firebase Console.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[3rem] p-10 border-4 border-slate-900 shadow-neo"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-brand-orange rounded-full mx-auto flex items-center justify-center border-4 border-slate-900 shadow-neo-orange transform -rotate-6 mb-6">
            <span className="text-white text-4xl font-black italic">S</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">
            {isLogin ? 'welcome back' : 'join the club'}
          </h2>
          <p className="text-slate-400 text-[10px] font-black mt-2 tracking-wide">
            {isLogin ? 'login to your account' : 'register for rewards'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black mb-8 border-2 border-slate-900 shadow-sm flex items-center space-x-3 tracking-wide">
            <ShieldCheck size={16} />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 ml-2 tracking-widest italic">
              {isLogin ? 'username / email' : 'choose username'}
            </label>
            <input
              type="text"
              placeholder={isLogin ? "enter username (e.g. SURYA)" : "pick a unique username"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-900 rounded-2xl px-6 py-4 text-sm focus:bg-white transition-all outline-none font-black tracking-tighter"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 ml-2 tracking-widest italic">password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-900 rounded-2xl px-6 py-4 text-sm focus:bg-white transition-all outline-none font-black tracking-tighter"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs tracking-widest shadow-neo hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center space-x-3 mt-6 border-2 border-slate-900"
          >
            {loading ? (
                <span className="animate-pulse tracking-widest">processing...</span>
            ) : (
                <>
                    {identifier.toUpperCase() === 'SURYA' ? <ShieldCheck size={20} /> : (isLogin ? <LogIn size={20} /> : <UserPlus size={20} />)}
                    <span>{isLogin ? (identifier.toUpperCase() === 'SURYA' ? 'owner access' : 'login now') : 'sign up'}</span>
                </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center text-[10px] font-black text-slate-400 tracking-widest">
          {isLogin ? "new to surya's?" : "already have an account?"}
          <button
            onClick={() => {
                setIsLogin(!isLogin);
                setIdentifier('');
                setPassword('');
            }}
            className="ml-2 text-brand-orange hover:underline decoration-2 underline-offset-4"
          >
            {isLogin ? 'create account' : 'login here'}
          </button>
        </div>

        <div className="mt-10 pt-8 border-t-2 border-slate-100 text-center">
            <p className="text-[9px] text-slate-300 font-black tracking-wide italic">
                owner? enter "SURYA" as username
            </p>
        </div>
      </motion.div>
    </div>
  );
}
