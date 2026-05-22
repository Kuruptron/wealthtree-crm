import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, useToggleTheme, useIsDark } from '../../context/ThemeContext';
import { Icon } from '../shared/Icons';
import { clients, interactions, knowledgeEntries } from '../../data/mockData';

export default function Header() {
  const theme = useTheme();
  const toggleTheme = useToggleTheme();
  const isDark = useIsDark();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);

  const results = search.length > 1 ? [
    ...clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.pan.toLowerCase().includes(search.toLowerCase())).slice(0, 3).map(c => ({ type: 'Client', label: c.name, sub: c.pan, path: `/clients/${c.id}` })),
    ...interactions.filter(i => i.summary.toLowerCase().includes(search.toLowerCase())).slice(0, 2).map(i => ({ type: 'Interaction', label: i.clientName, sub: i.summary.substring(0, 50) + '...', path: `/clients/${i.clientId}` })),
    ...knowledgeEntries.filter(e => e.title.toLowerCase().includes(search.toLowerCase())).slice(0, 2).map(e => ({ type: 'Knowledge', label: e.title, sub: e.type, path: '/knowledge' })),
  ] : [];

  const typeColor = { Client: theme.burgundy, Interaction: theme.info, Knowledge: theme.success };

  return (
    <div style={{ height: '60px', background: theme.white, borderBottom: `1px solid ${theme.fog}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: '16px', flexShrink: 0, position: 'relative', zIndex: 100 }}>
      <div style={{ flex: 1, maxWidth: '480px', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.steel }}><Icon.Search /></div>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search clients, interactions, knowledge..."
          style={{ width: '100%', padding: '8px 12px 8px 40px', border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '13px', background: theme.smoke, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: theme.nero }}
        />
        {showResults && results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', marginTop: '4px', zIndex: 200, overflow: 'hidden' }}>
            {results.map((r, i) => (
              <div key={i} onClick={() => { navigate(r.path); setSearch(''); setShowResults(false); }}
                style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', borderBottom: i < results.length - 1 ? `1px solid ${theme.fog}` : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = theme.smoke}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '10px', fontWeight: '700', color: typeColor[r.type], background: `${typeColor[r.type]}20`, padding: '2px 6px', borderRadius: '3px', flexShrink: 0 }}>{r.type}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: theme.nero }}>{r.label}</div>
                  <div style={{ fontSize: '11px', color: theme.steel }}>{r.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{ width: '34px', height: '34px', background: theme.smoke, border: `1px solid ${theme.fog}`, borderRadius: '4px', color: theme.nero, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = theme.fog; }}
          onMouseLeave={e => { e.currentTarget.style.background = theme.smoke; }}
        >
          {isDark ? <Icon.Sun /> : <Icon.Moon />}
        </button>

        <button style={{ width: '34px', height: '34px', background: theme.smoke, border: 'none', borderRadius: '4px', color: theme.steel, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Icon.Bell />
          <div style={{ position: 'absolute', top: '7px', right: '7px', width: '5px', height: '5px', borderRadius: '50%', background: theme.error }} />
        </button>

        <div style={{ width: '32px', height: '32px', background: theme.burgundy, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>S</div>
      </div>
    </div>
  );
}
