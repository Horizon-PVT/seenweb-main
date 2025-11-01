import React, { useMemo } from 'react'; // <-- THÊM DÒNG NÀY

const CodeRain: React.FC = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const columns = useMemo(() => Array.from({ length: 50 }).map(() => {
    const height = Math.random() * 50 + 20; // vh
    const duration = Math.random() * 10 + 10; // seconds
    const delay = Math.random() * -20; // seconds
    const left = Math.random() * 100; // %
    const codeString = Array.from({ length: 50 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');

    return { height, duration, delay, left, codeString };
  }), [chars]);

  return (
    <div className="absolute inset-0 overflow-hidden mask-gradient-bottom pointer-events-none">
      {columns.map((col, i) => (
        <p
          key={i}
          className="text-[#008080]/30 font-mono text-xs break-all"
          style={{
            position: 'absolute',
            top: 0,
            left: `${col.left}%`,
            height: `${col.height}vh`,
            writingMode: 'vertical-rl',
            animation: `code-rain ${col.duration}s linear ${col.delay}s infinite`,
          }}
        >
          {col.codeString}
        </p>
      ))}
    </div>
  );
};
export default CodeRain; // <-- THÊM DÒNG NÀY