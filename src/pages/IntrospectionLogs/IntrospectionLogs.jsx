import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/shared/Icons';
import PageHeader from '../../components/shared/PageHeader';
import Modal from '../../components/shared/Modal';
import { introspectionLogs as initialLogs } from '../../data/mockData';

const eventTypes = ['MPC Meeting', 'Macro Shock', 'Year End Review', 'Election Result', 'Budget', 'Global Event', 'Market Milestone', 'Other'];
const moods = ['Optimistic', 'Cautiously Optimistic', 'Neutral', 'Cautious', 'Bearish', 'Reflective'];

export default function IntrospectionLogs() {
  const theme = useTheme();
  const moodColor = { 'Cautiously Optimistic': theme.success, Optimistic: theme.success, Cautious: theme.warning, Bearish: theme.error, Reflective: theme.info, Neutral: theme.steel };
  const [logs, setLogs] = useState(initialLogs);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], event: 'MPC Meeting', mood: 'Neutral', body: '', tags: '' });

  const filtered = logs.filter(l => l.title.toLowerCase().includes(search.toLowerCase()) || l.body.toLowerCase().includes(search.toLowerCase()) || l.tags.some(t => t.includes(search.toLowerCase())));

  const handleAdd = () => {
    setLogs(prev => [{ id: Date.now(), ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }, ...prev]);
    setShowAdd(false);
    setForm({ title: '', date: new Date().toISOString().split('T')[0], event: 'MPC Meeting', mood: 'Neutral', body: '', tags: '' });
  };

  const inputStyle = { width: '100%', padding: '9px 12px', border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: theme.smoke, color: theme.nero };
  const Label = ({ children }) => <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{children}</label>;

  return (
    <div>
      <PageHeader title="Introspection Logs" subtitle="What were we actually thinking during big market moments — preserved, not reconstructed" action={{ label: 'Add Log', onClick: () => setShowAdd(true) }} />

      <div style={{ background: `${theme.burgundy}10`, border: `1px solid ${theme.burgundy}30`, borderRadius: '4px', padding: '14px 18px', marginBottom: '24px', fontSize: '13px', color: theme.graphite, lineHeight: '1.6' }}>
        These logs are honest, timestamped records of what the team believed during significant events. They are locked 24 hours after creation. No hindsight allowed.
      </div>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.steel }}><Icon.Search /></div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." style={{ ...inputStyle, paddingLeft: '40px', boxSizing: 'border-box' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '48px', textAlign: 'center', color: theme.steel }}>
            No logs yet. <button onClick={() => setShowAdd(true)} style={{ background: 'none', border: 'none', color: theme.burgundy, cursor: 'pointer', fontFamily: 'inherit' }}>Write your first introspection →</button>
          </div>
        ) : filtered.sort((a, b) => b.date.localeCompare(a.date)).map(log => (
          <div key={log.id} style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: theme.nero }}>{log.title}</span>
                    <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '3px', background: theme.smoke, color: theme.steel }}>{log.event}</span>
                    <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '3px', background: `${moodColor[log.mood] || theme.steel}18`, color: moodColor[log.mood] || theme.steel }}>{log.mood}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: theme.steel, fontFamily: '"IBM Plex Mono", monospace', marginBottom: '8px' }}>{log.date}</div>
                  {expanded !== log.id && <p style={{ fontSize: '13px', color: theme.graphite, lineHeight: '1.6', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{log.body}</p>}
                </div>
                <div style={{ color: theme.steel, marginLeft: '12px', flexShrink: 0, transform: expanded === log.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><Icon.ChevronDown /></div>
              </div>
              {log.tags.length > 0 && <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>{log.tags.map(t => <span key={t} style={{ padding: '2px 8px', background: theme.smoke, borderRadius: '3px', fontSize: '11px', color: theme.steel }}>#{t}</span>)}</div>}
            </div>
            {expanded === log.id && (
              <div style={{ borderTop: `1px solid ${theme.fog}`, padding: '20px', background: theme.smoke }}>
                <p style={{ fontSize: '14px', color: theme.nero, lineHeight: '1.8', margin: 0, whiteSpace: 'pre-wrap' }}>{log.body}</p>
                <div style={{ marginTop: '16px', fontSize: '11px', color: theme.steel }}>Locked • Cannot be edited after 24h</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <Modal title="Write Introspection Log" onClose={() => setShowAdd(false)} width="680px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><Label>Title</Label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. RBI Rate Cut — What We Were Thinking" style={inputStyle} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div><Label>Date</Label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} /></div>
              <div><Label>Event Type</Label><select value={form.event} onChange={e => setForm(p => ({ ...p, event: e.target.value }))} style={inputStyle}>{eventTypes.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><Label>Team Mood</Label><select value={form.mood} onChange={e => setForm(p => ({ ...p, mood: e.target.value }))} style={inputStyle}>{moods.map(m => <option key={m}>{m}</option>)}</select></div>
            </div>
            <div><Label>Your Thoughts</Label><textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={8} placeholder="What were you actually thinking? Be honest — this is your record." style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }} /></div>
            <div><Label>Tags</Label><input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. rbi, rates, equity" style={inputStyle} /></div>
            <div style={{ fontSize: '12px', color: theme.steel, background: theme.smoke, padding: '10px 14px', borderRadius: '4px', border: `1px solid ${theme.fog}` }}>
              This log will be locked 24 hours after creation.
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: '9px 20px', background: theme.smoke, border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: theme.nero }}>Cancel</button>
            <button onClick={handleAdd} disabled={!form.title || !form.body} style={{ padding: '9px 20px', background: theme.burgundy, border: 'none', borderRadius: '4px', color: '#fff', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', opacity: !form.title || !form.body ? 0.5 : 1 }}>Save Log</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
