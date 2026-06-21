// @ts-nocheck
'use client';
import { Bot, User, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Chatbot({ selectedCity }: { selectedCity: string }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || !input.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, cityName: selectedCity })
      });

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = '';
      const aiMsgId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }]);

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2));
              aiMessage += text;
              setMessages(prev => 
                prev.map(msg => msg.id === aiMsgId ? { ...msg, content: aiMessage } : msg)
              );
            } catch (err) {}
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-panel" style={{ marginTop: '2rem', height: '500px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        <Bot size={24} color="var(--color-primary)" /> Eco-Assistant AI
      </h3>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
            Ask me for tips on reducing your carbon footprint or insights about your recent activities!
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', gap: '0.75rem', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            {m.role === 'assistant' && <div style={{ background: 'var(--color-surface-hover)', padding: '0.5rem', borderRadius: '50%', height: 'fit-content' }}><Bot size={18} color="var(--color-primary)" /></div>}
            <div style={{ 
              background: m.role === 'user' ? 'var(--color-primary)' : 'rgba(0,0,0,0.3)', 
              padding: '0.75rem 1rem', 
              borderRadius: '12px',
              borderTopRightRadius: m.role === 'user' ? 0 : '12px',
              borderTopLeftRadius: m.role === 'assistant' ? 0 : '12px',
              lineHeight: 1.5
            }}>
              {m.content}
            </div>
            {m.role === 'user' && <div style={{ background: 'var(--color-secondary)', padding: '0.5rem', borderRadius: '50%', height: 'fit-content' }}><User size={18} color="#fff" /></div>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <input 
          className="input-field" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask for eco-friendly tips..." 
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
