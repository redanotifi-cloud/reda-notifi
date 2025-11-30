
import React from 'react';
import { Home, User, Users, Hammer, ShoppingBag, MessageSquare, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Hammer, label: 'Create', path: '/studio' }, // Redirect to Studio
    { icon: User, label: 'Avatar', path: '/avatar' },
    { icon: MessageSquare, label: 'Chat', path: '/messages' },
    { icon: Users, label: 'Friends', path: '/friends' },
    { icon: ShoppingBag, label: 'Shop', path: '/profile' }, // Redirect to shop
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Bottom Bar (Visible only on small screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-gray-900 border-t border-gray-800 z-50 flex justify-around items-center px-1 shadow-lg">
        {menuItems.slice(0, 5).map((item) => { // Show first 5 items on mobile to fit nicely
           const isActive = location.pathname === item.path;
           return (
             <Link 
               key={item.label} 
               to={item.path}
               className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}
             >
               <item.icon className={`w-6 h-6 ${isActive ? 'fill-current/20' : ''}`} />
               <span className="text-[10px] font-medium">{item.label}</span>
             </Link>
           );
        })}
        {/* Simple 'More' link for mobile if needed, or just link to settings */}
         <Link to="/settings" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location.pathname === '/settings' ? 'text-blue-500' : 'text-gray-400'}`}>
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-medium">Set..</span>
         </Link>
      </nav>

      {/* Desktop Sidebar (Hidden on mobile, Visible on lg screens) */}
      <aside className={`hidden lg:flex fixed lg:sticky top-14 left-0 h-[calc(100vh-3.5rem)] bg-gray-900 border-r border-gray-800 transition-all duration-300 overflow-hidden z-40 flex-col ${isOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex-1 py-4 flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.label} 
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition-colors ${isActive ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <item.icon className={`w-6 h-6 min-w-[24px] ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                <span className={`font-semibold whitespace-nowrap ${isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'} transition-opacity`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        
        <div className={`p-4 border-t border-gray-800 ${isOpen ? 'block' : 'hidden'}`}>
          <p className="text-xs text-gray-500 text-center">© 2025 BloxClone</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
