
import React, { useState, useEffect, useRef } from 'react';
import { User, Friend, PrivateMessage } from '../types';
import { MessageSquare, Send, MoreVertical, Search, Loader2 } from 'lucide-react';
import { generateFriendReply } from '../services/geminiService';

interface MessagesProps {
  user: User;
  friends: Friend[];
  messages: PrivateMessage[];
  setMessages: React.Dispatch<React.SetStateAction<PrivateMessage[]>>;
}

const Messages: React.FC<MessagesProps> = ({ user, friends, messages, setMessages }) => {
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-select first friend if none selected
  useEffect(() => {
    if (!selectedFriendId && friends.length > 0) {
        setSelectedFriendId(friends[0].id);
    }
  }, [friends, selectedFriendId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedFriendId, typingMap]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedFriendId) return;

    const friend = friends.find(f => f.id === selectedFriendId);
    if (!friend) return;

    const newMessage: PrivateMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        receiverId: selectedFriendId,
        text: inputText,
        timestamp: Date.now(),
        isRead: true
    };

    setMessages(prev => [...prev, newMessage]);
    const sentText = inputText;
    setInputText('');

    // Set typing indicator
    setTypingMap(prev => ({ ...prev, [selectedFriendId]: true }));

    // Get Chat History for context
    const chatHistory = messages
        .filter(m => (m.senderId === 'me' && m.receiverId === selectedFriendId) || (m.senderId === selectedFriendId && m.receiverId === 'me'))
        .slice(-5)
        .map(m => `${m.senderId === 'me' ? 'Me' : friend.username}: ${m.text}`);

    // Call AI Service
    try {
        // Random delay for realism (1s to 3s)
        const delay = Math.random() * 2000 + 1000;
        await new Promise(r => setTimeout(r, delay));

        const replyText = await generateFriendReply(friend.username, sentText, chatHistory);

        const reply: PrivateMessage = {
            id: (Date.now() + 1).toString(),
            senderId: selectedFriendId,
            receiverId: 'me',
            text: replyText,
            timestamp: Date.now(),
            isRead: false
        };
        setMessages(prev => [...prev, reply]);
    } finally {
        setTypingMap(prev => ({ ...prev, [selectedFriendId]: false }));
    }
  };

  const currentFriend = friends.find(f => f.id === selectedFriendId);
  const currentChat = messages.filter(m => 
    (m.senderId === 'me' && m.receiverId === selectedFriendId) ||
    (m.senderId === selectedFriendId && m.receiverId === 'me')
  ).sort((a,b) => a.timestamp - b.timestamp);

  const isTyping = selectedFriendId ? typingMap[selectedFriendId] : false;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-[#111827] overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
            <div className="relative">
                <input type="text" placeholder="Search chats" className="w-full bg-gray-800 rounded px-3 py-2 pl-9 text-sm text-white focus:outline-none" />
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            {friends.map(friend => {
                const lastMsg = messages
                    .filter(m => m.senderId === friend.id || m.receiverId === friend.id)
                    .sort((a,b) => b.timestamp - a.timestamp)[0];
                const isFriendTyping = typingMap[friend.id];
                
                return (
                    <button 
                        key={friend.id}
                        onClick={() => setSelectedFriendId(friend.id)}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800 transition-colors border-b border-gray-800/50 ${selectedFriendId === friend.id ? 'bg-gray-800' : ''}`}
                    >
                        <div className="relative">
                            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600">
                                {friend.avatarUrl ? <img src={friend.avatarUrl} className="w-full h-full rounded-full" /> : "👤"}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${friend.status === 'Online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white truncate">{friend.username}</span>
                                <span className="text-xs text-gray-500">{lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                            </div>
                            <p className="text-xs text-gray-400 truncate h-4">
                                {isFriendTyping ? <span className="text-blue-400 italic">typing...</span> : 
                                (lastMsg ? (lastMsg.senderId === 'me' ? `You: ${lastMsg.text}` : lastMsg.text) : 'Start a conversation')}
                            </p>
                        </div>
                    </button>
                )
            })}
        </div>
      </div>

      {/* Chat Area */}
      {selectedFriendId ? (
          <div className="flex-1 flex flex-col bg-[#111827]">
             {/* Header */}
             <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">👤</div>
                    <div>
                        <h3 className="font-bold text-white">{currentFriend?.username}</h3>
                        <span className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> {currentFriend?.status}
                        </span>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-white"><MoreVertical className="w-5 h-5" /></button>
             </div>

             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentChat.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.senderId === 'me' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 text-gray-400 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
             </div>

             {/* Input */}
             <form onSubmit={handleSend} className="p-4 border-t border-gray-800 bg-gray-900">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={`Message ${currentFriend?.username}...`}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    />
                    <button type="submit" disabled={!inputText.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full flex items-center justify-center transition-colors">
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </div>
             </form>
          </div>
      ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a friend to start chatting</p>
          </div>
      )}
    </div>
  );
};

export default Messages;
