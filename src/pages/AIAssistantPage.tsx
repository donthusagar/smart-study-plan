import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User as UserIcon,
  Loader2,
  BookOpen,
  Calendar,
  Flame,
  HelpCircle,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello ${user?.name || 'Sagar'}! I am your AI Study Advisor.

I continuously analyze your enrolled courses, pending topics, and exam countdowns. Ask me what to study today, how to recover from missed sessions, or how to break down complex engineering concepts!`,
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: query.trim(),
        history: messages.slice(-4).map(m => ({ role: m.sender, content: m.text }))
      });

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      showToast('AI Advisor encountered a network hiccup', 'error');
    } finally {
      setLoading(false);
    }
  };

  const presetCommands = [
    { title: 'What should I study today?', desc: 'Prioritizes hard subjects & nearest exams', prompt: 'What should I study today?' },
    { title: 'Create a revision plan', desc: 'Spaced repetition schedule for retention', prompt: 'Create a revision plan' },
    { title: 'I missed yesterday’s session', desc: 'Recovers missed hours without burnout', prompt: 'I missed yesterday’s session, how do I catch up?' },
    { title: '7-day exam plan', desc: 'Sprint timeline for upcoming tests', prompt: 'Create a 7-day exam plan' },
    { title: 'Explain this topic', desc: 'Intuitive university level breakdown', prompt: 'Explain the most important calculus topics for my exam' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Gemini-Powered Academic Engine</span>
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
          <span>AI Study Assistant</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Personalized curriculum guidance, adaptive problem-solving strategies, and customized revision schedules.
        </p>
      </div>

      {/* Preset Command Cards (Section 19) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {presetCommands.map(cmd => (
          <button
            key={cmd.title}
            onClick={() => handleSend(cmd.prompt)}
            disabled={loading}
            className="p-3 text-left bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-800 rounded-xl transition-all shadow-xs flex flex-col justify-between group"
          >
            <div className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {cmd.title}
            </div>
            <div className="text-[10px] text-neutral-500 mt-1 line-clamp-2">
              {cmd.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Chat Messages Panel */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[520px]">
        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-neutral-50/50 dark:bg-neutral-950/30">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-bl-none border border-neutral-200 dark:border-neutral-700/60'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[10px] mt-1.5 font-mono text-right ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-neutral-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl w-fit text-xs text-neutral-600 dark:text-neutral-400 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Advisor is thinking & synthesizing study advice...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about your syllabus, exam timeline, or study tips..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-neutral-900 dark:text-white placeholder-neutral-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
