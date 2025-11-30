
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { ChatMessage, User } from '../types';
import { chatWithGemini } from '../services/geminiService';

interface ChatWidgetProps {
  currentUser: User;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'System', text: 'Welcome to BloxClone Chat!', timestamp: Date.now(), isSystem: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      user: currentUser.username,
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Get History for context
    const history = messages.slice(-5).map(m => `${m.user}: ${m.text}`);
    
    // Simulate network delay
    setTimeout(async () => {
        const replyText = await chatWithGemini(currentInput, history);
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            user: 'BloxBot',
            text: replyText,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-0 right-4 md:right-8 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-t-lg shadow-lg flex items-center justify-center transition-colors w-12 md:w-auto"
          title="Global Chat"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="w-80 h-96 bg-gray-900 border border-gray-700 rounded-t-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="h-10 bg-blue-600 flex items-center justify-between px-3 rounded-t-lg">
            <span className="font-bold text-white text-sm">Global Chat</span>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-900">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.user === currentUser.username ? 'items-end' : 'items-start'}`}>
                 <span className={`text-xs font-bold mb-0.5 ${msg.isSystem ? 'text-yellow-500' : 'text-gray-400'}`}>
                    {msg.user}
                 </span>
                 <div className={`px-3 py-1.5 rounded-lg text-sm max-w-[85%] break-words ${
                    msg.isSystem ? 'bg-transparent text-yellow-500 italic' : 
                    msg.user === currentUser.username ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'
                 }`}>
                    {msg.text}
                 </div>
              </div>
            ))}
            {isTyping && (
                <div className="text-xs text-gray-500 ml-2 animate-pulse">BloxBot is typing...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2 bg-gray-800 border-t border-gray-700 flex gap-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Say something..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="bg-gray-700 hover:bg-gray-600 p-1.5 rounded text-white">
               <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
