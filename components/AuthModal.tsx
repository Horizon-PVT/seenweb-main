// File: components/AuthModal.tsx (ĐÃ LOẠI BỎ NÚT GOOGLE)
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
// Loại bỏ import NextAuth gây lỗi biên dịch
// import { signIn } from 'next-auth/react'; 

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = 'login' | 'register';

// Hàm tạm thời handleGoogleSignIn đã bị xóa


const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { login, setSuccessMessage } = useAuth();
    const [mode, setMode] = useState<AuthMode>('register');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' }>({ text: '', type: 'info' });
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: '', type: 'info' });
        setIsLoading(true);

        const apiEndpoint = mode === 'register' ? '/api/register' : '/api/login';
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json();

            if (response.ok && result.success) {
                // GỌI HÀM LOGIN TỪ CONTEXT
                login(result.token, result.plan, email);
                onClose(); 

            } else {
                setMessage({ 
                    text: result.error || 'Có lỗi xảy ra trong quá trình xử lý.', 
                    type: 'error' 
                });
            }
        } catch (err) {
            setMessage({ text: 'Lỗi mạng hoặc máy chủ không phản hồi.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex justify-center transition-opacity duration-300 pt-24">
            <div className="bg-black/90 border border-[#008080]/50 rounded-lg p-6 w-full max-w-lg min-w-[320px] shadow-2xl max-h-[90vh] overflow-y-auto h-fit">
                <div className="flex justify-between items-center border-b border-[#008080]/30 pb-3 mb-4">
                    <h2 className="text-2xl font-playfair text-[#CDAD5A]">
                       {mode === 'register' ? 'ĐĂNG KÝ' : 'ĐĂNG NHẬP'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl transition-colors">&times;</button>
                </div>

                {/* NÚT GOOGLE ĐÃ BỊ LOẠI BỎ HOÀN TOÀN Ở ĐÂY */}

                {message.text && (
                    <div className={`p-3 mb-4 rounded-sm text-sm font-semibold ${message.type === 'success' ?
                    'bg-green-800/50 text-green-300 border border-green-700' : 'bg-red-800/50 text-red-300 border border-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-700/50 pt-4">
                   <input 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full obsidian-input focus:border-[#CDAD5A]"
                        required
                    />
                    
                   <input 
                        type="password" 
                        placeholder="Mật khẩu (tối thiểu 6 ký tự)" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full obsidian-input focus:border-[#CDAD5A]"
                        required
                    />
                    
                   <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#008080] text-white font-bold py-3 px-5 border-2 border-[#008080] rounded-sm transition-all 
                        duration-300 hover:bg-transparent hover:text-[#008080] active:scale-95 emerald-glow disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'ĐANG XỬ LÝ...' : (mode === 'register' ? 'ĐĂNG KÝ' : 'ĐĂNG NHẬP')}
                    </button>
                </form>

                <div className="mt-6 text-center text-gray-400 text-sm">
                    {mode === 'register' ?
                    (
                        <p>Đã có tài khoản? <button onClick={() => { setMode('login'); setMessage({ text: '', type: 'info' }); }} className="text-[#CDAD5A] hover:text-white underline">Đăng nhập ngay</button></p>
                    ) : (
                        <p>Chưa có tài khoản? <button onClick={() => { setMode('register'); setMessage({ 
                        text: '', type: 'info' }); }} className="text-[#CDAD5A] hover:text-white underline">Đăng ký (Miễn phí)</button></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;