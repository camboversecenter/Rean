
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Zap } from './Icons';
import { chatWithAI, AI_COSTS } from '../services/geminiService';
import { ChatMessage } from '../types';
import MarkdownText from './MarkdownText';
import toast from 'react-hot-toast';

const KruReanChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'សួស្តី! ខ្ញុំគឺ "សុភាទន្សាយ" (Sophea Tonsay)។ ខ្ញុំអាចជួយស្វែងរក សាលារៀន គ្រូបង្រៀន ឬបេសកកម្មសិក្សាសម្រាប់អ្នកបាន។ តើអ្នកចង់សិក្សាអ្វីថ្ងៃនេះ?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.filter(m => m.id !== 'welcome').map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Basic text chat
      const responseText = await chatWithAI(userMessage.text, history);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message.includes("Insufficient") ? "ពិន្ទុមិនគ្រប់គ្រាន់! (Not enough points)" : "បរាជ័យក្នុងការឆ្លើយតប។";
      
      const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'model',
          text: `🚫 ${errorMsg}`,
          timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] max-h-[calc(100dvh-120px)] md:max-h-[calc(100dvh-64px)] bg-gray-50">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        <div className="max-w-5xl mx-auto space-y-6">
            {messages.map((msg) => (
            <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
                <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-white ${
                        msg.role === 'user' ? 'bg-gray-200' : 'bg-gradient-to-br from-primary to-teal-600'
                    }`}>
                        {msg.role === 'user' ? <User className="h-5 w-5 text-gray-500" /> : <span className="text-sm">🐰</span>}
                    </div>

                    {/* Bubble */}
                    <div
                    className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative group transition-all ${
                        msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}
                    >
                    <MarkdownText content={msg.text} className={msg.role === 'user' ? 'text-white' : 'text-gray-800'} />
                    <span className={`text-[10px] absolute -bottom-5 ${msg.role === 'user' ? 'right-0' : 'left-0'} text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    </div>
                </div>
            </div>
            ))}
            
            {/* Loading State */}
            {isLoading && (
            <div className="flex justify-start animate-pulse">
                <div className="flex flex-row items-end gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-white">
                        <span className="text-sm">🐰</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                    <div className="flex space-x-1.5 items-center h-4">
                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    </div>
                </div>
            </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-10">
        <div className="max-w-5xl mx-auto relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="សួរសំណួរ... (1 Pt/Chat)"
              className="w-full pl-5 pr-16 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
              disabled={isLoading}
              autoFocus
            />
            {/* Currency hint inside input */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <span className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                    {AI_COSTS.CHAT} <Zap className="h-3 w-3 ml-0.5 text-yellow-500 fill-yellow-500" />
                </span>
            </div>
          </div>
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3.5 rounded-full shadow-lg transition-all transform active:scale-95 flex-shrink-0 ${
              input.trim() 
                ? 'bg-gradient-to-r from-primary to-teal-600 text-white hover:shadow-primary/30' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="h-5 w-5 ml-0.5" />
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-400 mt-2">
            AI អាចមានកំហុស។ សូមត្រួតពិនិត្យព័ត៌មានសំខាន់ៗ។
        </p>
      </div>
    </div>
  );
};

export default KruReanChat;
