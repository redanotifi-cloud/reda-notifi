
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import GameDetail from './pages/GameDetail';
import Avatar from './pages/Avatar';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Friends from './pages/Friends';
import Messages from './pages/Messages';
import Studio from './pages/Studio';
import Auth from './pages/Auth';
import ChatWidget from './components/ChatWidget';
import { Game, User, Friend, PrivateMessage, ShopItem } from './types';
import { ShieldAlert, Lock } from 'lucide-react';

// The "God" User
const OWNER_USER: User = {
  username: "Owner_Admin",
  avatarUrl: "",
  robux: 999999999,
  status: 'Online',
  inventory: ['crown_gold', 'valkyrie_helm', 'dominus_dark', 'wings_angel'], 
  equippedItems: ['crown_gold', 'wings_angel'],
  avatarColors: {
    skin: '#eab308',
    shirt: '#3b82f6',
    pants: '#16a34a'
  },
  isBanned: false
};

const INITIAL_FRIENDS: Friend[] = [
  { id: 'f1', username: 'NoobMaster69', status: 'Online', avatarUrl: '' },
  { id: 'f2', username: 'Builderman', status: 'In-Game', gameName: 'Tower of Hell', avatarUrl: '' },
  { id: 'f3', username: 'CoolCat_99', status: 'Offline', avatarUrl: '' },
  { id: 'f4', username: 'GamerGirl_X', status: 'Online', avatarUrl: '' },
];

const DEFAULT_MESSAGES: PrivateMessage[] = [
  { id: 'm1', senderId: 'f2', receiverId: 'me', text: 'Hey! Join me in Tower of Hell?', timestamp: Date.now() - 3600000, isRead: true },
  { id: 'm2', senderId: 'me', receiverId: 'f2', text: 'Maybe later, coding right now.', timestamp: Date.now() - 3500000, isRead: true },
];

const INITIAL_SHOP_ITEMS: ShopItem[] = [
    { id: 'crown_gold', name: "Golden King Crown", price: 50000, type: 'Hat', color: '#ffd700', icon: '👑', creator: 'Roblox' },
    { id: 'valkyrie_helm', name: "Violet Valkyrie", price: 15000, type: 'Hat', color: '#8b5cf6', icon: '⛑️', creator: 'Roblox' },
    { id: 'dominus_dark', name: "Dominus Empyreus", price: 100000, type: 'Hat', color: '#111827', icon: '😈', creator: 'Roblox' },
    { id: 'fedora_sparkle', name: "Sparkle Fedora", price: 5000, type: 'Hat', color: '#3b82f6', icon: '🎩', creator: 'Roblox' },
    { id: 'wings_angel', name: "Angel Wings", price: 8000, type: 'Accessory', color: '#ffffff', icon: '👼', creator: 'Roblox' },
    { id: 'sword_void', name: "Void Sword", price: 1200, type: 'Gear', color: '#9333ea', icon: '⚔️', creator: 'Roblox' },
    { id: 'glasses_deal', name: "Deal With It", price: 500, type: 'Face', color: '#000000', icon: '🕶️', creator: 'User123' },
    { id: 'face_happy', name: "Super Happy Face", price: 250, type: 'Face', color: '#facc15', icon: '😊', creator: 'User123' },
    { id: 'dev_badge', name: "Developer Badge", price: 0, type: 'Accessory', color: '#ef4444', icon: '🛡️', creator: 'Owner_Admin' },
];

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [games, setGames] = useState<Game[]>([]); 
  
  // Authentication State
  const [user, setUser] = useState<User | null>(null);

  // Persistence for all users (Simple mock database)
  const [allUsers, setAllUsers] = useState<Record<string, User>>(() => {
     const saved = localStorage.getItem('bloxclone_users_db');
     return saved ? JSON.parse(saved) : { [OWNER_USER.username]: OWNER_USER };
  });

  const [friends, setFriends] = useState<Friend[]>(() => {
      const saved = localStorage.getItem('bloxclone_friends');
      return saved ? JSON.parse(saved) : INITIAL_FRIENDS;
  });

  const [messages, setMessages] = useState<PrivateMessage[]>(() => {
      const saved = localStorage.getItem('bloxclone_messages');
      return saved ? JSON.parse(saved) : DEFAULT_MESSAGES;
  });

  const [shopItems, setShopItems] = useState<ShopItem[]>(() => {
      const saved = localStorage.getItem('bloxclone_shop_items');
      return saved ? JSON.parse(saved) : INITIAL_SHOP_ITEMS;
  });

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
      if (user) {
          localStorage.setItem('bloxclone_current_session', user.username);
          // Update the DB record for the current user in real-time
          setAllUsers(prev => ({ ...prev, [user.username]: user }));
      } else {
          localStorage.removeItem('bloxclone_current_session');
      }
  }, [user]);

  useEffect(() => {
      localStorage.setItem('bloxclone_users_db', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
      const savedSession = localStorage.getItem('bloxclone_current_session');
      if (savedSession && allUsers[savedSession]) {
          setUser(allUsers[savedSession]);
      }
  }, []);

  useEffect(() => { localStorage.setItem('bloxclone_friends', JSON.stringify(friends)); }, [friends]);
  useEffect(() => { localStorage.setItem('bloxclone_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('bloxclone_shop_items', JSON.stringify(shopItems)); }, [shopItems]);


  // --- AUTH HANDLERS ---
  const handleLogin = (username: string, password?: string) => {
      if (username === 'Owner_Admin') {
          if (password === 'admin123') {
              const ownerData = allUsers['Owner_Admin'] || OWNER_USER;
              setUser(ownerData);
              return { success: true, user: ownerData };
          } else {
              return { success: false, error: "Invalid password for Developer Account." };
          }
      }

      const existingUser = allUsers[username];
      if (existingUser) {
          if (existingUser.isBanned) {
              return { success: false, error: `Account Banned: ${existingUser.banReason}` };
          }
          setUser(existingUser);
          return { success: true, user: existingUser };
      } else {
          return { success: false, error: "User not found. Please Sign Up." };
      }
  };

  const handleSignup = (username: string, password?: string) => {
      if (username.toLowerCase() === 'owner_admin') {
          return { success: false, error: "Cannot create account with this restricted name." };
      }
      if (allUsers[username]) {
          return { success: false, error: "Username already taken." };
      }

      const newUser: User = {
          username: username,
          avatarUrl: "",
          robux: 0, 
          status: 'Online',
          inventory: [],
          equippedItems: [],
          avatarColors: {
              skin: '#eab308',
              shirt: '#9ca3af',
              pants: '#1f2937'
          },
          isBanned: false
      };

      setAllUsers(prev => ({ ...prev, [username]: newUser }));
      setUser(newUser);
      return { success: true, user: newUser };
  };

  const handleLogout = () => {
      setUser(null);
  };

  // --- ADMIN ACTIONS ---
  const handleForceLogin = (username: string) => {
    // Only for admin simulation in Friends list
    const targetUser = allUsers[username] || { 
        ...OWNER_USER, 
        username: username, 
        robux: 0,
        inventory: [],
        isBanned: false
    };
    setUser(targetUser);
  };

  const handleBanUser = (username: string, reason: string) => {
      setAllUsers(prev => {
          if (!prev[username]) return prev;
          return {
              ...prev,
              [username]: {
                  ...prev[username],
                  isBanned: true,
                  banReason: reason
              }
          };
      });
      // If banning the currently visible friend in a list, we just updated the DB
  };

  const handleUnbanUser = (username: string) => {
    setAllUsers(prev => {
        if (!prev[username]) return prev;
        return {
            ...prev,
            [username]: {
                ...prev[username],
                isBanned: false,
                banReason: undefined
            }
        };
    });
  };


  // --- GAME & SHOP LOGIC ---
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleBuyItem = (itemId: string, price: number) => {
    if (!user) return false;
    if (user.inventory.includes(itemId)) return false; 
    
    if (user.robux >= price) {
      setUser(prev => prev ? ({
        ...prev,
        robux: prev.robux - price,
        inventory: [...prev.inventory, itemId]
      }) : null);
      return true; 
    }
    return false; 
  };

  const handleCreateItem = (newItem: ShopItem) => {
      setShopItems(prev => [newItem, ...prev]);
  };

  const handleUpdateItemPrice = (itemId: string, newPrice: number) => {
      setShopItems(prev => prev.map(item => item.id === itemId ? { ...item, price: newPrice } : item));
  };

  const handleEquipItem = (itemId: string) => {
    setUser(prev => {
      if (!prev) return null;
      const isEquipped = prev.equippedItems.includes(itemId);
      let newEquipped;
      if (isEquipped) {
        newEquipped = prev.equippedItems.filter(id => id !== itemId);
      } else {
        newEquipped = [...prev.equippedItems, itemId];
      }
      return { ...prev, equippedItems: newEquipped };
    });
  };

  const handleUpdateColors = (type: 'skin' | 'shirt' | 'pants', color: string) => {
    setUser(prev => prev ? ({
      ...prev,
      avatarColors: {
        ...prev.avatarColors,
        [type]: color
      }
    }) : null);
  };

  const handleBuyRobux = (amount: number) => {
      if (!user) return;
      // Simulate Payment
      const confirmed = window.confirm(`Buy ${amount.toLocaleString()} Robux?`);
      if (confirmed) {
          setUser(prev => prev ? ({ ...prev, robux: prev.robux + amount }) : null);
          alert('Purchase successful!');
      }
  };

  // --- RENDER ---
  
  if (!user) {
      return <Auth onLogin={handleLogin} onSignup={handleSignup} />;
  }

  // BANNED SCREEN
  if (user.isBanned) {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center font-sans">
              <div className="bg-gray-900 border border-red-600 rounded-xl p-8 max-w-lg shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                  <ShieldAlert className="w-24 h-24 text-red-600 mx-auto mb-6" />
                  <h1 className="text-4xl font-extrabold text-white mb-4">Account Banned</h1>
                  <p className="text-gray-300 mb-6 text-lg">
                      Your account has been suspended for violating our Terms of Service.
                  </p>
                  
                  <div className="bg-red-900/20 border border-red-900 p-4 rounded-lg mb-8 text-left">
                      <p className="text-xs text-red-400 font-bold uppercase mb-1">Reason provided:</p>
                      <p className="text-white font-medium">"{user.banReason || 'Violence, Swearing, or Inappropriate Behavior'}"</p>
                  </div>
                  
                  <button 
                      onClick={handleLogout}
                      className="bg-white text-black hover:bg-gray-200 font-bold py-3 px-8 rounded-lg transition-colors"
                  >
                      Log Out
                  </button>
                  <p className="text-xs text-gray-500 mt-6">If you believe this is an error, contact support.</p>
              </div>
          </div>
      );
  }

  return (
    <Router>
      <Routes>
         {/* Studio Route is standalone (no navbar/sidebar) */}
         <Route path="/studio" element={<Studio />} />

         {/* Main App Routes with Layout */}
         <Route path="*" element={
            <div className="min-h-screen bg-[#111827] text-white font-sans flex flex-col">
                <Navbar user={user} onToggleSidebar={toggleSidebar} onBuyRobux={handleBuyRobux} />
                
                <div className="flex flex-1 relative">
                <Sidebar isOpen={isSidebarOpen} />
                
                <main className={`flex-1 transition-all duration-300 p-0 pb-20 lg:pb-0 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
                    <Routes>
                    <Route path="/" element={<Home games={games} setGames={setGames} />} />
                    <Route path="/games/:id" element={<GameDetail games={games} user={user} />} />
                    
                    <Route path="/avatar" element={
                        <Avatar 
                        user={user} 
                        onEquip={handleEquipItem} 
                        onUpdateColors={handleUpdateColors} 
                        />} 
                    />
                    
                    <Route path="/profile" element={
                        <Profile 
                            user={user} 
                            shopItems={shopItems}
                            onBuyItem={handleBuyItem} 
                            onCreateItem={handleCreateItem}
                            onUpdatePrice={handleUpdateItemPrice}
                        />} 
                    />
                    
                    <Route path="/settings" element={
                        <div className="relative">
                            <Settings user={user} setUser={setUser} friends={friends} />
                            <div className="max-w-4xl mx-auto px-6 pb-6">
                                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg w-full md:w-auto">
                                    Log Out
                                </button>
                            </div>
                        </div>
                    } />
                    
                    <Route path="/friends" element={
                        <Friends 
                        user={user}
                        friends={friends} 
                        setFriends={setFriends} 
                        onForceLogin={handleForceLogin}
                        onBanUser={handleBanUser}
                        onUnbanUser={handleUnbanUser}
                        allUsers={allUsers} // Pass DB to check ban status of friends
                        />} 
                    />
                    
                    <Route path="/messages" element={
                        <Messages 
                        user={user} 
                        friends={friends} 
                        messages={messages} 
                        setMessages={setMessages} 
                        />} 
                    />

                    <Route path="*" element={<Home games={games} setGames={setGames} />} />
                    </Routes>
                </main>
                </div>

                <ChatWidget currentUser={user} />
            </div>
         } />
      </Routes>
    </Router>
  );
};

export default App;
