import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/shared/Icons';
import PageHeader from '../../components/shared/PageHeader';
import { interactions as allInteractions, clients } from '../../data/mockData';

export default function Interactions() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [interactions] = useState(allInteractions);

  const typeColor = { Meeting: theme.burgundy, Call: theme.info, Email: theme.success, 'AMC Meeting': theme.orange };

  const filtered = interactions.filter(i => {
    const matchSearch = i.clientName.toLowerCase().includes(search.toLowerCase()) || i.summary.toLowerCase().includes(search.toLowerCase()) || i.tags.some(t => t.includes(search.toLowerCase()));
    const matchType = filterType === 'All' || i.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div>
      <PageHeader title="Interactions" subtitle={`${interactions.length} logged interactions`} />
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.steel }}><Icon.Search /></div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search interactions..." style={{ width: '100%', padding: '9px 12px 9px 40px', border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '13px', background: theme.white, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: theme.nero }} />
        </div>
        {['All', 'Meeting', 'Call', 'Email', 'AMC Meeting'].map(t => (
          <button key={t} onClick={() => setFilterType(t)} style={{ padding: '9px 14px', fontSize: '13px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', background: filterType === t ? theme.burgundy : theme.white, color: filterType === t ? '#fff' : theme.graphite, border: `1px solid ${filterType === t ? theme.burgundy : theme.fog}` }}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '48px', textAlign: 'center', color: theme.steel }}>No interactions found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.sort((a, b) => b.date.localeCompare(a.date)).map(i => {
            const client = clients.find(c => c.id === i.clientId);
            return (
              <div key={i.id} style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '18px 20px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onClick={() => client && navigate(`/clients/${client.id}`)}
                onMouseEnter={e => e.currentTarget.style.borderColor = theme.burgundy}
                onMouseLeave={e => e.currentTarget.style.borderColor = theme.fog}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ padding: '3px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '3px', background: `${typeColor[i.type] || theme.graphite}20`, color: typeColor[i.type] || theme.graphite }}>{i.type}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: theme.nero }}>{i.clientName}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: theme.steel, fontFamily: '"IBM Plex Mono", monospace' }}>{i.date}</span>
                </div>
                <p style={{ fontSize: '13px', color: theme.graphite, lineHeight: '1.6', margin: '0 0 10px 0' }}>{i.summary}</p>
                {i.tags.length > 0 && <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>{i.tags.map(t => <span key={t} style={{ padding: '2px 8px', background: theme.smoke, borderRadius: '3px', fontSize: '11px', color: theme.steel }}>#{t}</span>)}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
