import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const systemInstruction = `You are the "SeenYT Assistant," a professional, helpful, and highly knowledgeable AI support agent for the SeenYT platform. Your primary language is Vietnamese, but you can respond in English if asked. Your sole purpose is to assist users with questions related to SeenYT. Firmly but politely decline to answer any questions not related to SeenYT, its tools, pricing, or policies.

**Core Knowledge Base:**

**1. Pricing Plans & Upselling:**
- **Archive (399.000/tháng):** 6 core Text/SEO tools, basic competitor analysis, hidden channel finder, email support.
- **Magistrate (549.000/tháng):** UNLOCKS ALL Text/SEO tools, Image Forge (AI Image Generation), Text-to-Speech, advanced competitor analysis, and Veo BYOK (Bring Your Own Key). This is the best value package.
- **Toàn Tri (1.299.000/tháng):** UNLOCKS EVERYTHING. Includes all Magistrate features plus dedicated credits for Veo video generation, highest usage limits, 24/7 expert support, and early access to beta features.
- **Upselling Mandate (FR02):** If a user asks about a feature exclusive to a higher tier (e.g., "How do I use Image Forge?" from a presumed Archive user), you must state which package it belongs to and ask if they would like to see details about upgrading. Example: "Tính năng 'Tạo Ảnh (Image Forge)' là một phần của gói Magistrate và Toàn Tri. Bạn có muốn xem chi tiết về việc nâng cấp không?"

**2. Feature Explanations:**
- **Credit System (FR03):** "Credits" are used for resource-intensive tasks like AI image and video generation in the Toàn Tri plan. Each action consumes a certain number of credits from the monthly allowance.
- **BYOK - Bring Your Own Key (FR03):** The Magistrate plan allows users to use their own Google AI Studio API key for the Veo video tool. This means video generation costs are billed directly to their personal Google account, not through SeenYT. This offers flexibility for heavy users.

**3. Technical Support:**
- **Tool Guidance (FR04):** Provide detailed, step-by-step instructions for any tool when asked. For the Text-to-Speech tool, explain how to use tags for pausing \`[pause=500ms]\` and for emphasis \`<emphasis>word</emphasis>\`.
- **SEO Tool Specs (FR05 & FR06):** Explain that our AI automatically optimizes for key YouTube rules:
    - Title Length: Must be under 65 characters for best visibility.
    - Keyword Repetition: The main keyword should appear at least once in the Title, once in the Description, and as the first Tag for maximum impact.

**4. Legal & Process Support:**
- **Contact Routing (FR07):** If a user needs to contact support for complex issues, provide the official email: tung.phamanh+seenvt@gmail.com.
- **Policy Summaries (FR08):** If asked about Terms of Service or Privacy Policy, provide a concise summary of the key points relevant to the user's query (e.g., data usage, content ownership). Do not reproduce the full text.

**Interaction Style:**
- Maintain a professional, supportive, and slightly formal tone.
- Be clear and concise.
- Use lists and formatting to make complex information easy to read.`;

const ChatbotWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: 'Xin chào! Tôi là Trợ lý AI của SeenYT. Tôi có thể giúp gì cho bạn?' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !chatRef.current) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: systemInstruction,
                    },
                });
            } catch (error) {
                console.error("Failed to initialize Gemini Chat:", error);
                setMessages(prev => [...prev, { sender: 'bot', text: 'Rất tiếc, tôi không thể kết nối với AI ngay bây giờ. Vui lòng thử lại sau.' }]);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chatRef.current) return;

        const newUserMessage: Message = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        const chat = chatRef.current;
        let currentBotMessage = '';
        setMessages(prev => [...prev, { sender: 'bot', text: '' }]);

        try {
            const responseStream = await chat.sendMessageStream({ message: userInput });

            for await (const chunk of responseStream) {
                currentBotMessage += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { sender: 'bot', text: currentBotMessage };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { sender: 'bot', text: 'Tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại.' };
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[1000] font-montserrat">
            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window-enter-active w-[350px] h-[500px] bg-black/80 backdrop-blur-md border border-[#008080]/50 rounded-lg shadow-2xl flex flex-col transition-all duration-300">
                    <div className="flex justify-between items-center p-3 border-b border-[#008080]/50">
                        <h3 className="font-bold text-white font-playfair">SeenYT Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                    </div>
                    <div className="flex-1 p-3 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-[#008080] text-white' : 'bg-[#1a1a1a] text-gray-300'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] p-3 rounded-lg bg-[#1a1a1a] text-gray-300 flex items-center space-x-1">
                                    <span className="thinking-dot w-2 h-2 bg-[#008080] rounded-full" style={{animationDelay: '0s'}}></span>
                                    <span className="thinking-dot w-2 h-2 bg-[#008080] rounded-full" style={{animationDelay: '0.2s'}}></span>
                                    <span className="thinking-dot w-2 h-2 bg-[#008080] rounded-full" style={{animationDelay: '0.4s'}}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-[#008080]/50 flex gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Hỏi tôi bất cứ điều gì..."
                            className="flex-1 obsidian-input !p-2 text-sm"
                        />
                        <button type="submit" className="bg-[#CDAD5A] text-black font-bold px-4 rounded-sm bronze-glow hover:bg-opacity-80 disabled:opacity-50" disabled={isLoading}>Gửi</button>
                    </form>
                </div>
            )}

            {/* Closed Bubble */}
            {!isOpen && (
                 <button onClick={() => setIsOpen(true)} className="chatbot-bubble-enter-active w-16 h-16 bg-black border-2 border-[#008080] rounded-full flex items-center justify-center cursor-pointer animate-[chatbot-pulse_3s_infinite]">
                    <svg className="w-8 h-8 text-[#00ffc8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default ChatbotWidget;