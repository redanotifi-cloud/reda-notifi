
import React, { useState } from 'react';
import { Friend, User } from '../types';
import { User as UserIcon, Users, MessageSquare, UserMinus, Search, Gamepad2, Key, Gavel, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FriendsProps {
  user: User;
  friends: Friend[];
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
  onForceLogin: (username: string) => void;
  onBanUser: (username: string, reason: string) => void;
  onUnbanUser: (username: string) => void;
  allUsers: Record<string, User>;
}

const Friends: React.FC<FriendsProps> = ({ user, friends, setFriends, onForceLogin, onBanUser, onUnbanUser, allUsers }) => {
  const [search, setSearch] = useState('');

  const handleDelete = (id: string) => {
    if (window.confirm("Remove this friend?")) {
        setFriends(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleBanClick = (username: string) => {
      const reason = window.prompt("Enter ban reason (e.g., Violence, Swearing):", "Violation of Terms of Service");
      if (reason) {
          onBanUser(username, reason);
          alert(`User ${username} has been BANNED.`);
      }
  };

  const handleUnbanClick = (username: string) => {
      if (window.confirm(`Unban ${username}?`)) {
          onUnbanUser(username);
          alert(`User ${username} has been UNBANNED.`);
      }
  };

  const handleAddRandom = () => {
    const names = ["Robloxian", "CoolDude", "MegaGamer", "PizzaLover", "ObbyMaster"];
    const randomName = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 1000);
    const newFriend: Friend = {
        id: Date.now().toString(),
        username: randomName,
        status: 'Online',
        avatarUrl: ''
    };
    setFriends(prev => [...prev, newFriend]);
    setSearch('');
  };

  const filteredFriends = friends.filter(f => f.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <UserIcon className="w-8 h-8" /> Friends ({friends.length})
        </h1>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <input 
                    type="text" 
                    placeholder="Search friends..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            </div>
            <button 
                onClick={handleAddRandom}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap"
            >
                Add Friend
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFriends.map((friend) => {
            const friendData = allUsers[friend.username];
            const isBanned = friendData?.isBanned;

            return (
                <div key={friend.id} className={`bg-gray-800 rounded-xl p-4 border flex items-center gap-4 transition-colors ${isBanned ? 'border-red-600 bg-red-900/10' : 'border-gray-700 hover:bg-gray-750'}`}>
                    <div className="relative">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl overflow-hidden border-2 border-gray-600">
                            {friend.avatarUrl ? <img src={friend.avatarUrl} className="w-full h-full object-cover" /> : "🙂"}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-gray-800 ${
                            isBanned ? 'bg-red-600' :
                            friend.status === 'Online' ? 'bg-green-500' : 
                            friend.status === 'In-Game' ? 'bg-blue-500' : 'bg-gray-500'
                        }`} title={isBanned ? 'Banned' : friend.status}></div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <h3 className="font-bold text-lg text-white truncate">
                            {friend.username}
                            {isBanned && <span className="ml-2 text-xs bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">BANNED</span>}
                        </h3>
                        <div className="text-xs text-gray-400 font-medium truncate">
                            {isBanned ? (
                                <span className="text-red-400 font-bold">Reason: {friendData?.banReason || 'Violation'}</span>
                            ) : (
                                friend.status === 'In-Game' ? (
                                    <span className="text-blue-400 flex items-center gap-1">
                                        <Gamepad2 className="w-3 h-3" /> Playing {friend.gameName}
                                    </span>
                                ) : friend.status
                            )}
                        </div>
                    </div>

                    <div className="flex gap-1">
                        {/* ADMIN CONTROLS */}
                        {user.username === 'Owner_Admin' && (
                             <>
                                <button 
                                    onClick={() => onForceLogin(friend.username)}
                                    className="p-1.5 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 rounded-lg border border-yellow-600/50"
                                    title="Force Login"
                                >
                                    <Key className="w-4 h-4" />
                                </button>
                                {isBanned ? (
                                    <button 
                                        onClick={() => handleUnbanClick(friend.username)}
                                        className="p-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-500 rounded-lg border border-green-600/50"
                                        title="Unban User"
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleBanClick(friend.username)}
                                        className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-500 rounded-lg border border-red-600/50"
                                        title="Ban User"
                                    >
                                        <Gavel className="w-4 h-4" />
                                    </button>
                                )}
                             </>
                        )}

                        <Link to="/messages" className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white" title="Message">
                            <MessageSquare className="w-4 h-4" />
                        </Link>
                        <button 
                            onClick={() => handleDelete(friend.id)}
                            className="p-1.5 bg-gray-700 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-gray-400" 
                            title="Unfriend"
                        >
                            <UserMinus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )
        })}

        {filteredFriends.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No friends found matching "{search}"</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
