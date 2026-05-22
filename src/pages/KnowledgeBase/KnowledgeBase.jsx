import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/shared/Icons';
import PageHeader from '../../components/shared/PageHeader';
import Modal from '../../components/shared/Modal';
import { knowledgeEntries as initialEntries } from '../../data/mockData';

export default function KnowledgeBase() {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const [entries, setEntries] = useState(initialEntries);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'Book', author: '', date: new Date().toISOString().split('T')[0], summary: '', tags: '', highlights: '' });

  const typeIcon = { Book: Icon.Book, Research: Icon.FileText, Article: Icon.Link, 'AMC Note': Icon.Briefcase, Podcast: Icon.Brain };
  const typeColor = { Book: theme.burgundy, Research: theme.info, Article: theme.success, 'AMC Note': theme.orange, Podcast: '#7C3AED' };

  const filtered = entries.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.summary.toLowerCase().includes(search.toLowerCase()) || e.tags.some(t => t.includes(search.toLowerCase()));
    const matchType = filterType === 'All' || e.type === filterType;
    return matchSearch && matchType;
  });

  const handleAdd = () => {
    setEntries(prev => [{ id: Date.now(), ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), highlights: form.highlights.split('\n').map(h => h.trim()).filter(Boolean) }, ...prev]);
    setShowAdd(false);
    setForm({ title: '', type: 'Book', author: '', date: new Date().toISOString().split('T')[0], summary: '', tags: '', highlights: '' });
  };

  const inputStyle = { width: '100%', padding: '9px 12px', border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: theme.smoke, color: theme.nero };
  const Label = ({ children }) => <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{children}</label>;

  return (
    <div>
      <PageHeader title="Knowledge Base" subtitle="Books, research, articles, and team learnings" action={isAdmin ? { label: 'Add Entry', onClick: () => setShowAdd(true) } : null} />

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.steel }}><Icon.Search /></div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search knowledge base..." style={{ ...inputStyle, paddingLeft: '40px' }} />
        </div>
        {['All', 'Book', 'Research', 'Article', 'AMC Note', 'Podcast'].map(t => (
          <button key={t} onClick={() => setFilterType(t)} style={{ padding: '9px 14px', fontSize: '13px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', background: filterType === t ? theme.burgundy : theme.white, color: filterType === t ? '#fff' : theme.graphite, border: `1px solid ${filterType === t ? theme.burgundy : theme.fog}` }}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '48px', textAlign: 'center', color: theme.steel }}>
            No entries found. <button onClick={() => setShowAdd(true)} style={{ background: 'none', border: 'none', color: theme.burgundy, cursor: 'pointer', fontFamily: 'inherit' }}>Add the first one →</button>
          </div>
        ) : filtered.map(e => {
          const TypeIcon = typeIcon[e.type] || Icon.FileText;
          return (
            <div key={e.id} style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 }}>
                    <div style={{ color: typeColor[e.type] || theme.steel, marginTop: '2px', flexShrink: 0 }}><TypeIcon /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: theme.nero }}>{e.title}</span>
                        <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '3px', background: `${typeColor[e.type] || theme.graphite}20`, color: typeColor[e.type] || theme.graphite }}>{e.type}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: theme.steel, marginBottom: '8px' }}>{e.author && <span>{e.author} · </span>}<span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{e.date}</span></div>
                      <p style={{ fontSize: '13px', color: theme.graphite, lineHeight: '1.6', margin: 0 }}>{e.summary}</p>
                    </div>
                  </div>
                  <div style={{ color: theme.steel, marginLeft: '12px', flexShrink: 0, transform: expanded === e.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><Icon.ChevronDown /></div>
                </div>
                {e.tags.length > 0 && <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', marginLeft: '32px' }}>{e.tags.map(t => <span key={t} style={{ padding: '2px 8px', background: theme.smoke, borderRadius: '3px', fontSize: '11px', color: theme.steel }}>#{t}</span>)}</div>}
              </div>
              {expanded === e.id && e.highlights.length > 0 && (
                <div style={{ borderTop: `1px solid ${theme.fog}`, padding: '16px 20px', background: theme.smoke }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Key Highlights</div>
                  {e.highlights.map((h, i) => <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '13px', color: theme.nero, lineHeight: '1.5' }}><span style={{ color: theme.burgundy, fontWeight: '600', flexShrink: 0 }}>·</span><span>{h}</span></div>)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAdd && (
        <Modal title="Add Knowledge Entry" onClose={() => setShowAdd(false)} width="640px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}><Label>Title</Label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} /></div>
              <div><Label>Type</Label><select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inputStyle}><option>Book</option><option>Research</option><option>Article</option><option>AMC Note</option><option>Podcast</option></select></div>
              <div><Label>Author / Source</Label><input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} style={inputStyle} /></div>
            </div>
            <div><Label>Summary / Notes</Label><textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} rows={4} placeholder="What did you learn? What's the key takeaway?" style={{ ...inputStyle, resize: 'vertical' }} /></div>
            <div><Label>Key Highlights (one per line)</Label><textarea value={form.highlights} onChange={e => setForm(p => ({ ...p, highlights: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            <div><Label>Tags (comma separated)</Label><input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. equity, macro" style={inputStyle} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: '9px 20px', background: theme.smoke, border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: theme.nero }}>Cancel</button>
            <button onClick={handleAdd} disabled={!form.title || !form.summary} style={{ padding: '9px 20px', background: theme.burgundy, border: 'none', borderRadius: '4px', color: '#fff', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', opacity: !form.title || !form.summary ? 0.5 : 1 }}>Save Entry</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
