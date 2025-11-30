
import React, { useState } from 'react';
import { User } from '../types';
import { Play, ShieldAlert, UserPlus, LogIn, AlertCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (username: string, password?: string) => { success: boolean; user?: User; error?: string };
  onSignup: (username: string, password?: string) => { success: boolean; user?: User; error?: string };
}

const Auth: React.FC<AuthProps> = ({ onLogin, onSignup }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 600));

    if (!username.trim()) {
        setError("Username is required.");
        setLoading(false);
        return;
    }

    if (username.length < 3) {
        setError("Username must be at least 3 characters.");
        setLoading(false);
        return;
    }

    let result;
    if (mode === 'login') {
        result = onLogin(username, password);
    } else {
        result = onSignup(username, password);
    }

    if (!result.success) {
        setError(result.error || "Authentication failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/20 to-[#111827] pointer-events-none"></div>

      {/* Main Card */}
      <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10">
        
        {/* Header */}
        <div className="bg-gray-800/50 p-6 text-center border-b border-gray-700">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center rotate-12 shadow-lg">
              <div className="w-8 h-8 border-4 border-white rounded-sm"></div>
           </div>
           <h1 className="text-3xl font-extrabold text-white tracking-tight">Blox<span className="text-blue-500">Clone</span></h1>
           <p className="text-gray-400 text-sm mt-2">The ultimate social gaming platform.</p>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-gray-900/50 gap-2">
            <button 
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${mode === 'signup' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:bg-gray-800'}`}
            >
                Sign Up
            </button>
            <button 
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${mode === 'login' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:bg-gray-800'}`}
            >
                Log In
            </button>
        </div>

        {/* Form */}
        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Username"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Password {mode === 'signup' && <span className="text-gray-500 font-normal normal-case">(Optional)</span>}
                    </label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Password"
                    />
                    {username === 'Owner_Admin' && (
                        <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Developer account requires password.
                        </p>
                    )}
                </div>

                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <span className="text-sm text-red-200">{error}</span>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_0_rgb(29,78,216)] active:shadow-none active:translate-y-[4px]"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        mode === 'signup' ? <><UserPlus className="w-5 h-5" /> Sign Up</> : <><LogIn className="w-5 h-5" /> Log In</>
                    )}
                </button>
            </form>
            
            <p className="text-center text-xs text-gray-500 mt-6">
                By clicking {mode === 'signup' ? 'Sign Up' : 'Log In'}, you agree to our Terms of Use and Privacy Policy.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
