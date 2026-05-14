import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Search, ShoppingBag, Heart, MessageSquare, LayoutDashboard, LogOut, Menu, X, User, ShoppingCart } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  user: any;
  isAdmin: boolean;
}

export default function Navbar({ user, isAdmin }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-orange border-b-4 border-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-brand-orange font-black text-2xl">SC</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black tracking-tighter leading-none text-2xl uppercase">SURYA'S CHOICE</span>
              <span className="text-white/70 font-bold tracking-widest leading-none text-[10px] uppercase">Premium Snacks</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8 relative"
          >
            <input
              type="text"
              placeholder="Find your flavor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-orange-100 border-none rounded-full py-2.5 pl-12 pr-4 text-sm font-bold text-orange-900 placeholder-orange-400 focus:ring-4 focus:ring-white/50 transition-all"
            />
            <Search className="absolute left-4 top-3 h-4 w-4 text-brand-orange" />
          </form>

          {/* Icons - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart" className="relative p-2 text-white hover:opacity-70 transition-opacity">
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link to="/wishlist" className="flex items-center space-x-1 text-white font-bold text-sm uppercase tracking-widest hover:opacity-70 transition-opacity">
              <span>Wishlist</span>
            </Link>
            <Link to="/feedback" className="flex items-center space-x-1 text-white font-bold text-sm uppercase tracking-widest hover:opacity-70 transition-opacity">
              <span>Reviews</span>
            </Link>
            {isAdmin && (
              <div className="flex items-center space-x-4">
                <Link to="/orders" className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-neo-sm border-2 border-white">
                  <ShoppingBag size={14} />
                  <span>ALL ORDERS</span>
                </Link>
                <Link to="/dashboard" className="p-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors border-2 border-white/50">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              </div>
            )}
            {user ? (
              <button 
                onClick={handleLogout}
                className="bg-white text-brand-orange px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-colors shadow-sm"
              >
                Logout
              </button>
            ) : (
              <Link 
                to="/login"
                className="bg-slate-900 text-white px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-neo-orange"
              >
                User Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button className="p-2 text-gray-500">
                <Search className="h-5 w-5" onClick={() => setIsMenuOpen(!isMenuOpen)} />
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-orange-100 px-4 py-6 space-y-4"
          >
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </form>
            <div className="grid grid-cols-2 gap-4">
              <Link onClick={() => setIsMenuOpen(false)} to="/cart" className="col-span-2 flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white shadow-neo-sm border-2 border-white">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-black uppercase tracking-widest text-xs">My Shopping Cart</span>
                </div>
                {itemCount > 0 && (
                  <span className="bg-brand-orange text-white text-[10px] font-black px-3 py-1 rounded-full border border-white">
                    {itemCount} ITEMS
                  </span>
                )}
              </Link>
              <Link onClick={() => setIsMenuOpen(false)} to="/wishlist" className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl text-gray-700">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="font-bold">Wishlist</span>
              </Link>
              <Link onClick={() => setIsMenuOpen(false)} to="/feedback" className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl text-gray-700">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <span className="font-bold">Feedback</span>
              </Link>
              {isAdmin && (
                <>
                  <Link onClick={() => setIsMenuOpen(false)} to="/orders" className="col-span-2 flex items-center space-x-2 p-3 bg-red-50 rounded-xl text-red-700">
                    <ShoppingBag className="h-5 w-5" />
                    <span className="font-bold uppercase italic">ALL ORDERS</span>
                  </Link>
                  <Link onClick={() => setIsMenuOpen(false)} to="/dashboard" className="col-span-2 flex items-center space-x-2 p-3 bg-orange-50 rounded-xl text-orange-700">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-bold">Owner Dashboard</span>
                  </Link>
                </>
              )}
            </div>
            {user ? (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            ) : (
              <Link 
                onClick={() => setIsMenuOpen(false)}
                to="/login"
                className="w-full flex items-center justify-center space-x-2 bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg"
              >
                <User className="h-5 w-5" />
                <span>Login / Register</span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
