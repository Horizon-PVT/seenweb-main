'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
        hover:bg-white/10 active:scale-95
        border border-transparent hover:border-white/10"
      title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
      aria-label="Toggle theme"
    >
      {/* Background glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon with smooth transition */}
      <div className="relative">
        {theme === 'dark' ? (
          <Moon
            size={18}
            className="text-yellow-400 transition-all duration-300 hover:scale-110"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.6))',
            }}
          />
        ) : (
          <Sun
            size={18}
            className="text-amber-500 transition-all duration-300 hover:scale-110"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))',
            }}
          />
        )}
      </div>
    </button>
  );
}
