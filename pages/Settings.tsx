
import React, { useState } from 'react';
import { User, Friend } from '../types';
import { Save, Lock, User as UserIcon, Shield, Activity, RefreshCw } from 'lucide-react';

interface SettingsProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  friends: Friend[];
}

const Settings: React.FC<SettingsProps> = ({ user, setUser, friends }) => {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('I love playing BloxClone!');
  const [status, setStatus] = useState<'Online' | 'Offline' | 'Busy'>(user.status || 'Online');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(prev => ({ 
        ...prev, 
        username: username,
        status: status
    }));
    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSwitchAccount = (friendName: string) => {
     if (window.confirm(`Switch account to ${friendName}? This is for local testing.`)) {
         setUser(prev => ({
             ...prev,
             username: friendName,
             // Reset avatar colors for fun
             avatarColors: {
                 skin: '#'+Math.floor(Math.random()*16777215).toString(16),
                 shirt: '#'+Math.floor(Math.random()*16777215).toString(16),
                 pants: '#'+Math.floor(Math.random()*16777215).toString(16),
             }
         }));
         setUsername(friendName);
         setSuccessMsg(`Logged in as ${friendName}`);
     }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-white mb-8">Account Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Form */}
        <div className="flex-1 space-y-8">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Account Info
                </h2>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Display Name</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter your username"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Status</label>
                    <div className="relative">
                        <Activity className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                        >
                            <option value="Online">Online</option>
                            <option value="Busy">Busy (Do Not Disturb)</option>
                            <option value="Offline">Offline (Invisible)</option>
                        </select>
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Change Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="New Password (optional)"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">About Me</label>
                    <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                    />
                    </div>

                    <div className="pt-4 border-t border-gray-700 flex items-center justify-between">
                    {successMsg ? (
                        <span className="text-green-500 font-bold animate-pulse">{successMsg}</span>
                    ) : (
                        <span className="text-gray-500 text-sm">Last updated: Just now</span>
                    )}
                    
                    <button 
                        type="submit"
                        className="bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                    </div>
                </form>
            </div>

            {/* Account Switcher */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                 <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-yellow-500" />
                    Switch Accounts (Dev Mode)
                 </h2>
                 <p className="text-sm text-gray-400 mb-4">Quickly log in as one of your friends to test chat or gameplay.</p>
                 <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => handleSwitchAccount('Owner_Admin')} className="p-2 bg-red-900/50 border border-red-500/50 rounded hover:bg-red-800 text-left">
                         <div className="font-bold text-red-200">Owner_Admin</div>
                         <div className="text-xs text-gray-400">Main Account</div>
                     </button>
                     {friends.map(f => (
                         <button key={f.id} onClick={() => handleSwitchAccount(f.username)} className="p-2 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 text-left">
                             <div className="font-bold text-white truncate">{f.username}</div>
                             <div className="text-xs text-gray-400">Friend</div>
                         </button>
                     ))}
                 </div>
            </div>
        </div>

        {/* Security Info Side Panel */}
        <div className="w-full md:w-80 space-y-6">
           <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold text-white mb-2">2-Step Verification</h3>
              <p className="text-sm text-gray-400 mb-4">Protect your account by requiring a code when you log in.</p>
              <button className="w-full py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                Setup 2FA
              </button>
           </div>
           
           <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold text-white mb-2">Privacy</h3>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                 <span className="text-sm text-gray-400">Who can message me?</span>
                 <span className="text-sm text-white font-bold">Everyone</span>
              </div>
              <div className="flex items-center justify-between py-2">
                 <span className="text-sm text-gray-400">Who can join me?</span>
                 <span className="text-sm text-white font-bold">Friends</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
