
import React, { useState } from 'react';
import { Search, Bell, Menu, User as UserIcon, X, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onToggleSidebar: () => void;
  onBuyRobux: (amount: number) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onToggleSidebar, onBuyRobux }) => {
  const [showRobuxModal, setShowRobuxModal] = useState(false);

  return (
    <>
    <nav className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Toggle button: Hidden on mobile (default), visible on LG screens to toggle sidebar width */}
        <button onClick={onToggleSidebar} className="hidden lg:block p-1 hover:bg-gray-800 rounded">
          <Menu className="w-6 h-6 text-white" />
        </button>
        <Link to="/" className="text-2xl font-extrabold text-white tracking-tight hover:opacity-90">
          Blox<span className="text-blue-500">Clone</span>
        </Link>
        {/* Top Desktop Links */}
        <div className="hidden md:flex items-center gap-6 ml-8 text-sm font-medium text-gray-300">
          <Link to="/" className="hover:text-white transition-colors">Discover</Link>
          <Link to="/avatar" className="hover:text-white transition-colors">Avatar</Link>
          <Link to="/create" className="hover:text-white transition-colors">Create</Link>
          <button onClick={() => setShowRobuxModal(true)} className="hover:text-white transition-colors cursor-pointer text-green-400 font-bold">Robux</button>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-4 hidden sm:block">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-gray-800 border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Robux Button: Visible on Mobile now */}
        <button onClick={() => setShowRobuxModal(true)} className="flex items-center bg-gray-800 hover:bg-gray-700 transition-colors rounded-full px-2 sm:px-3 py-1 border border-gray-700 cursor-pointer">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm border-2 border-green-500 mr-1 sm:mr-2 rotate-45"></div>
          <span className="text-xs font-bold text-white">{user.robux.toLocaleString()}</span>
        </button>

        <button className="relative p-1 hover:bg-gray-800 rounded-full">
          <Bell className="w-6 h-6 text-white" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900"></span>
        </button>
        
        <Link to="/profile" className="relative w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-visible border border-gray-600">
           {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-5 h-5 text-gray-300" />}
           
           {/* Status Indicator */}
           <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
             user.status === 'Online' ? 'bg-green-500' : 
             user.status === 'Busy' ? 'bg-red-500' : 'bg-gray-500'
           }`} title={user.status}></div>
        </Link>
      </div>
    </nav>

    {/* Robux Modal */}
    {showRobuxModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-800 shrink-0">
                    <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        <div className="w-6 h-6 border-4 border-white rotate-45 rounded-[2px]"></div>
                        Buy Robux
                    </h2>
                    <button onClick={() => setShowRobuxModal(false)} className="hover:bg-gray-800 p-2 rounded-full">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
                
                <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto">
                    {[
                        { amount: 400, price: "$4.99" },
                        { amount: 800, price: "$9.99" },
                        { amount: 1700, price: "$19.99" },
                        { amount: 4500, price: "$49.99" },
                        { amount: 10000, price: "$99.99" },
                        { amount: 22500, price: "$199.99" },
                    ].map((opt) => (
                        <button 
                            key={opt.amount}
                            onClick={() => onBuyRobux(opt.amount)}
                            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-green-500 rounded-xl p-4 flex flex-col items-center gap-2 transition-all group active:scale-95"
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-green-500 rotate-45 rounded-[2px]"></div>
                            </div>
                            <span className="font-extrabold text-lg text-white">{opt.amount.toLocaleString()}</span>
                            <span className="text-sm text-green-400 font-bold">{opt.price}</span>
                        </button>
                    ))}
                </div>

                <div className="p-4 bg-gray-800/50 text-center text-xs text-gray-500 shrink-0 rounded-b-xl">
                    Secure payment simulation. No real money is charged.
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default Navbar;
