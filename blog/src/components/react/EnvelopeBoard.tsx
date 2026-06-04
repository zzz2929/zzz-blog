import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

interface EnvelopeBoardProps {
  messages?: string[];
  bottom?: string;
}

export default function EnvelopeBoard({
  messages = [
    '有什么想问的？',
    '有什么想说的？',
    '有什么想吐槽的？',
    '哪怕是有什么想吃的，都可以告诉我哦~',
  ],
  bottom = '自动书记人偶竭诚为您服务！',
}: EnvelopeBoardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`relative cursor-pointer transition-all duration-700 ${
          isOpen ? 'translate-y-[-20px]' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Envelope body */}
        <div className="relative w-72 h-44">
          {/* Back of envelope */}
          <div className="absolute inset-0 bg-card rounded-lg shadow-lg border border-border" />

          {/* Letter */}
          <div
            className={`absolute left-3 right-3 bg-card rounded-lg shadow-md border border-border p-4 transition-all duration-700 ${
              isOpen ? 'top-[-80px] opacity-100' : 'top-4 opacity-0'
            }`}
          >
            {messages.map((msg, i) => (
              <p key={i} className="text-sm text-muted mb-1">{msg}</p>
            ))}
          </div>

          {/* Front flap (triangle) */}
          <div
            className={`absolute inset-x-0 top-0 h-0 transition-all duration-500 ${
              isOpen ? 'opacity-0' : ''
            }`}
            style={{
              borderLeft: '144px solid transparent',
              borderRight: '144px solid transparent',
              borderTop: '88px solid var(--color-border)',
            }}
          />

          {/* Bottom flap */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-primary/10 rounded-b-lg" />
        </div>

        {/* Envelope icon */}
        <div className="mt-4 flex items-center justify-center gap-2 text-primary">
          <Mail size={20} />
          <span className="text-sm font-medium">{isOpen ? '关闭信封' : '打开信封'}</span>
        </div>
      </div>

      {isOpen && (
        <div className="mt-8 w-full max-w-md text-center">
          <p className="text-muted text-sm mb-6">{bottom}</p>
          <a
            href="https://waline.blog.904002.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            <Send size={16} />
            前往留言
          </a>
        </div>
      )}
    </div>
  );
}
