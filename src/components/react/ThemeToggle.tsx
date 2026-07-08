import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslations } from '@/i18n';
import type { Locale } from '@/i18n';

interface ThemeToggleProps {
  locale?: Locale;
}

export default function ThemeToggle({ locale = 'zh-CN' }: ThemeToggleProps) {
  const t = useTranslations(locale);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? t('theme.toggleLight') : t('theme.toggleDark')}
      className="relative h-9 w-16 rounded-full p-0.5 transition-all duration-500 ease-[cubic-bezier(0.68,-0.15,0.32,1.15)]"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
          : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
        boxShadow: isDark
          ? '0 0 15px rgba(242, 185, 75, 0.3), inset 0 1px 2px rgba(0,0,0,0.3)'
          : '0 0 15px rgba(66, 90, 239, 0.2), inset 0 1px 2px rgba(255,255,255,0.8)',
      }}
    >
      {/* Track background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5">
        <Sun
          size={12}
          className="transition-all duration-300"
          style={{
            color: isDark ? 'rgba(255,255,255,0.2)' : '#f59e0b',
            opacity: isDark ? 0.4 : 1,
            transform: isDark ? 'scale(0.8)' : 'scale(1)',
          }}
        />
        <Moon
          size={12}
          className="transition-all duration-300"
          style={{
            color: isDark ? '#f2b94b' : 'rgba(31,45,61,0.2)',
            opacity: isDark ? 1 : 0.4,
            transform: isDark ? 'scale(1)' : 'scale(0.8)',
          }}
        />
      </div>

      {/* Sliding knob */}
      <div
        className="relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.68,-0.15,0.32,1.15)]"
        style={{
          transform: isDark ? 'translateX(28px)' : 'translateX(0)',
          background: isDark
            ? 'linear-gradient(135deg, #1e1e28, #2a2a3e)'
            : 'linear-gradient(135deg, #ffffff, #f8fafc)',
          boxShadow: isDark
            ? '0 2px 10px rgba(242, 185, 75, 0.4), 0 0 20px rgba(242, 185, 75, 0.15)'
            : '0 2px 10px rgba(66, 90, 239, 0.3), 0 0 20px rgba(66, 90, 239, 0.1)',
        }}
      >
        {/* Stars on dark mode knob */}
        {isDark && (
          <>
            <div
              className="absolute rounded-full bg-yellow-200"
              style={{
                width: 2, height: 2, top: 6, left: 8,
                animation: 'pulse-glow 2s ease-in-out infinite',
                opacity: 0.8,
              }}
            />
            <div
              className="absolute rounded-full bg-yellow-100"
              style={{
                width: 1.5, height: 1.5, top: 10, right: 7,
                animation: 'pulse-glow 2s ease-in-out infinite 0.5s',
                opacity: 0.6,
              }}
            />
            <div
              className="absolute rounded-full bg-yellow-200"
              style={{
                width: 1, height: 1, top: 4, right: 10,
                animation: 'pulse-glow 2s ease-in-out infinite 1s',
                opacity: 0.5,
              }}
            />
          </>
        )}
      </div>
    </button>
  );
}
