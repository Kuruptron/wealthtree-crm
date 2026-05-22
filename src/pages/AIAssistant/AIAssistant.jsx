import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/shared/Icons';
import { clients, interactions, knowledgeEntries, introspectionLogs } from '../../data/mockData';

const suggestions = [
  'What did we last discuss with Rajesh Kumar?',
  'What is our current view on small cap funds?',
  'Summarise our learnings from The Psychology of Money',
  'Which clients are due for a quarterly review?',
  'What was our thinking during the tariff shock in April?',
  'Which clients have SIPs above ₹50,000/month?',
];

function simulateResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('rajesh')) {
    const i = interactions.find(x => x.clientName.toLowerCase().includes('rajesh'));
    return i ? `Last interaction with Rajesh Kumar was on **${i.date}** — a ${i.type}.\n\n"${i.summary}"\n\nTagged: ${i.tags.map(t => '#' + t).join(', ')}` : 'No interactions logged for Rajesh Kumar yet.';
  }
  if (q.includes('small cap') || q.includes('smallcap')) {
    const log = introspectionLogs.find(l => l.body.toLowerCase().includes('small cap'));
    return log ? `From our **${log.date}** introspection log:\n\n"${log.body.substring(0, 300)}..."\n\nWe moved out of small cap early in FY25, leaving returns on the table.` : 'No specific small cap notes found.';
  }
  if (q.includes('psychology of money') || q.includes('morgan housel')) {
    const entry = knowledgeEntries.find(e => e.title.toLowerCase().includes('psychology'));
    if (entry) return `**${entry.title}** by ${entry.author}\n\nSummary: ${entry.summary}\n\nKey highlights:\n${entry.highlights.map(h => `• ${h}`).join('\n')}`;
  }
  if (q.includes('review') || q.includes('due')) {
    const overdue = clients.filter(c => c.lastContact < '2026-05-15');
    return overdue.length > 0 ? `${overdue.length} clients haven't been contacted since May 15:\n\n${overdue.map(c => `• **${c.name}** — last contact ${c.lastContact}`).join('\n')}\n\nConsider scheduling reviews.` : 'All clients have been contacted recently.';
  }
  if (q.includes('tariff')) {
    const log = introspectionLogs.find(l => l.tags.includes('tariffs'));
    return log ? `From our **${log.date}** introspection log titled "${log.title}":\n\n"${log.body}"\n\nMood at the time: ${log.mood}` : 'No tariff-related introspection logs found.';
  }
  if (q.includes('sip') && (q.includes('50') || q.includes('above') || q.includes('high'))) {
    const highSIP = clients.filter(c => c.sip >= 50000);
    return `${highSIP.length} clients have monthly SIPs of ₹50,000 or above:\n\n${highSIP.map(c => `• **${c.name}** — ₹${(c.sip / 1000).toFixed(0)}k/month`).join('\n')}`;
  }
  return `I searched across ${clients.length} clients, ${interactions.length} interactions, ${knowledgeEntries.length} knowledge entries, and ${introspectionLogs.length} introspection logs but couldn't find a specific match.\n\nOnce the AI backend is connected, I'll be able to give more nuanced answers.`;
}

export default function AIAssistant() {
  const theme = useTheme();
  const [messages, setMessages] = useState([{ role: 'assistant', content: `Hello! I'm your WealthTree AI assistant.\n\nI have access to your client interactions, knowledge base, introspection logs, and macro context. Ask me anything about your practice.\n\nWhat would you like to know?` }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (query) => {
    const q = query || input;
    if (!q.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
    setMessages(prev => [...prev, { role: 'assistant', content: simulateResponse(q) }]);
    setLoading(false);
  };

  const formatContent = (text) => text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return <div key={i} style={{ marginBottom: line === '' ? '8px' : '2px', lineHeight: '1.6' }}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</div>;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ width: '36px', height: '36px', background: theme.burgundy, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.Bot /></div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: theme.nero, margin: 0 }}>AI Assistant</h1>
            <p style={{ fontSize: '12px', color: theme.steel, margin: 0 }}>Grounded in your clients, knowledge base, and introspection logs</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: theme.steel }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.warning }} />
            Simulation mode — connect AI backend for live responses
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '75%', padding: '14px 18px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? theme.burgundy : theme.white, border: msg.role === 'user' ? 'none' : `1px solid ${theme.fog}`, color: msg.role === 'user' ? '#fff' : theme.nero, fontSize: '14px', lineHeight: '1.6' }}>
              {formatContent(msg.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex' }}>
            <div style={{ padding: '14px 18px', background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '16px 16px 16px 4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.steel, animation: `bounce 1s ${i * 0.15}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Try asking</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{ padding: '6px 12px', background: theme.smoke, border: `1px solid ${theme.fog}`, borderRadius: '20px', fontSize: '12px', color: theme.graphite, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = theme.burgundy; e.currentTarget.style.color = theme.burgundy; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.fog; e.currentTarget.style.color = theme.graphite; }}
            >{s}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '8px', padding: '8px 12px' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder="Ask anything about your clients or practice..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', background: 'transparent', color: theme.nero }} />
        <button onClick={() => send()} disabled={!input.trim() || loading} style={{ width: '36px', height: '36px', background: theme.burgundy, border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: !input.trim() || loading ? 0.5 : 1 }}>
          <Icon.Send />
        </button>
      </div>

      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>
    </div>
  );
}
