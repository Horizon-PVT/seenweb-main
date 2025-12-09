// File: components/ChatbotWidget.tsx (CHỈ SỬA 3 DÒNG – HOÀN HẢO)
import React, { useState, useEffect, useRef } from 'react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}


const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMsg }) });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.text || 'Em đang bận, thử lại sau nhé!' }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Xin lỗi anh, kết nối lỗi. Em thử lại sau 10s nhé!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* CHAT WINDOW – ĐÃ FIX HOÀN HẢO */}
      {isOpen && (
        <div className="w-96 bg-black/95 border-2 border-[#008080] rounded-xl shadow-2xl flex flex-col" style={{ height: '580px' }}>   {/* ← Fix 1: chiều cao cố định */}

          {/* Header + nút X luôn hiện (z-index cao) */}
          <div className="relative flex justify-between items-center p-4 bg-gradient-to-r from-[#008080]/70 to-[#008080]/30 border-b border-[#008080]">
            <h3 className="text-white font-bold text-lg">SeenYT Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 w-9 h-9 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-2xl font-bold transition z-10"
            >
              ×
            </button>
          </div>

          {/* Tin nhắn – CÓ THANH CUỘN + KHÔNG BAO GIỜ CHE NÚT X */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#008080] scrollbar-track-black/50">
            {messages.length === 0 && <p className="text-gray-400 text-center italic">Chào anh! Em là SeenYT Assistant, sẵn sàng hỗ trợ ạ! 😊</p>}
            {messages.map((msg, i) => (
              <div key={i} className={msg.sender === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block max-w-xs px-4 py-3 rounded-2xl shadow-md ${msg.sender === 'user' ? 'bg-[#008080] text-white' : 'bg-gray-800 text-gray-100'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && <p className="text-center text-cyan-400 animate-pulse">SeenYT đang suy nghĩ ...</p>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-[#008080]/50 flex gap-2 bg-black/90">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Hỏi về SeenYT..."
              className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-l-lg border border-[#008080] focus:outline-none focus:border-cyan-400 transition"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading} className="bg-[#008080] hover:bg-cyan-500 text-white px-6 py-3 rounded-r-lg font-bold transition disabled:opacity-50">
              Gửi
            </button>
          </form>
        </div>
      )}

      {/* Bubble */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-black border-4 border-[#008080] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition animate-pulse">
          <svg className="w-9 h-9 text-[#00ffc8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;