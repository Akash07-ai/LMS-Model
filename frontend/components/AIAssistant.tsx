'use client';

import { useEffect, useRef, useState } from 'react';
import apiClient from '@/lib/apiClient';

interface Message {
  role: 'user' | 'ai';
  text: string;
  ts: number;
}

const SUGGESTIONS = [
  { label: '🗺️ DSA roadmap', query: 'DSA roadmap' },
  { label: '⚡ Explain async/await', query: 'Explain async/await' },
  { label: '🏗️ System design intro', query: 'System design roadmap' },
  { label: '📘 JavaScript basics', query: 'JavaScript roadmap' },
  { label: '🎯 What to learn next?', query: 'What should I learn next?' },
  { label: '💡 Coding tip', query: 'Give me a coding tip' },
];

const STORAGE_KEY = 'lms-ai-chat';

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

// Render markdown-ish text: bold, code blocks, inline code, line breaks
function MessageText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        // code block fence — just render as mono
        if (line.startsWith('```')) return null;

        // bold **text**
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          <p key={i} className={line === '' ? 'h-2' : ''}>
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**'))
                return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
              if (part.startsWith('`') && part.endsWith('`'))
                return <code key={j} className="bg-slate-700 text-sky-300 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
              return <span key={j}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist chat to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    setError('');
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: trimmed, ts: Date.now() }]);
    setLoading(true);

    try {
      const { data } = await apiClient.post('/ai', { query: trimmed });
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer, ts: Date.now() }]);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to reach AI. Check your connection.';
      setError(msg);
      setMessages((prev) => [...prev, {
        role: 'ai',
        text: `⚠️ ${msg}`,
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 flex flex-col" style={{ height: '600px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800 flex-shrink-0">
        <div>
          <p className="text-sm text-slate-400">AI Assistant</p>
          <h2 className="mt-1 text-xl font-semibold text-white flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Ask me anything
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-400">
            Live
          </span>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400 hover:bg-slate-700 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-2xl shadow-lg shadow-sky-500/20">
              🤖
            </div>
            <div>
              <p className="text-white font-semibold">Your AI Learning Mentor</p>
              <p className="text-slate-400 text-sm mt-1">Ask for roadmaps, explanations, tips, or anything coding!</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.ts}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white'
                : 'bg-gradient-to-br from-violet-500 to-purple-700 text-white'
            }`}>
              {msg.role === 'user' ? 'U' : '🤖'}
            </div>

            {/* Bubble */}
            <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-sky-600 text-white rounded-tr-sm'
                : 'bg-slate-800 text-slate-200 rounded-tl-sm'
            }`}>
              {msg.role === 'ai' ? (
                <MessageText text={msg.text} />
              ) : (
                <p className="text-sm">{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs">
              🤖
            </div>
            <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      {messages.length === 0 && (
        <div className="px-6 pb-3 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.query}
                onClick={() => sendMessage(s.query)}
                disabled={loading}
                className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:border-slate-500 transition disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6 pt-3 border-t border-slate-800 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything — roadmaps, explanations, tips..."
            disabled={loading}
            className="flex-1 rounded-2xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-slate-950 transition flex items-center gap-1.5"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
            Send
          </button>
        </form>

        {/* Quick action buttons */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => sendMessage('What should I learn next?')}
            disabled={loading}
            className="flex-1 rounded-xl bg-slate-800 border border-slate-700 py-2 text-xs text-slate-300 hover:bg-slate-700 transition disabled:opacity-50"
          >
            🎯 What to learn next?
          </button>
          <button
            onClick={() => setInput('Explain ')}
            disabled={loading}
            className="flex-1 rounded-xl bg-slate-800 border border-slate-700 py-2 text-xs text-slate-300 hover:bg-slate-700 transition disabled:opacity-50"
          >
            📖 Explain a topic
          </button>
        </div>
      </div>
    </section>
  );
}
