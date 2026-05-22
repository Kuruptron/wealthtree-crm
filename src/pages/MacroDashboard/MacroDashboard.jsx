import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { macroIndicators } from '../../data/mockData';

const categories = ['All', 'RBI', 'Rates', 'Currency', 'Equity', 'Flows', 'Commodity'];

export default function MacroDashboard() {
  const theme = useTheme();
  const [filterCat, setFilterCat] = useState('All');
  const [nifty, setNifty] = useState({ value: 22547.85, change: 145.32, pct: 0.65 });
  const [sensex, setSensex] = useState({ value: 74339.44, change: 487.28, pct: 0.66 });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNifty(prev => ({ value: parseFloat((prev.value + (Math.random() - 0.5) * 50).toFixed(2)), change: parseFloat((prev.change + (Math.random() - 0.5) * 10).toFixed(2)), pct: parseFloat((prev.pct + (Math.random() - 0.5) * 0.1).toFixed(2)) }));
      setSensex(prev => ({ value: parseFloat((prev.value + (Math.random() - 0.5) * 150).toFixed(2)), change: parseFloat((prev.change + (Math.random() - 0.5) * 30).toFixed(2)), pct: parseFloat((prev.pct + (Math.random() - 0.5) * 0.1).toFixed(2)) }));
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = macroIndicators.filter(i => filterCat === 'All' || i.category === filterCat);

  const IndexCard = ({ name, data }) => {
    const isPos = data.change >= 0;
    return (
      <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '20px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.success, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '11px', color: theme.steel }}>LIVE</span>
          </div>
        </div>
        <div style={{ fontSize: '28px', fontWeight: '600', color: theme.nero, fontFamily: '"IBM Plex Mono", monospace', marginBottom: '6px' }}>
          {data.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '13px', fontFamily: '"IBM Plex Mono", monospace' }}>
          <span style={{ color: isPos ? theme.success : theme.error }}>{isPos ? '▲' : '▼'} {isPos ? '+' : ''}{data.change.toFixed(2)}</span>
          <span style={{ color: isPos ? theme.success : theme.error }}>({isPos ? '+' : ''}{data.pct.toFixed(2)}%)</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: theme.nero, marginBottom: '4px' }}>Macro Dashboard</h1>
          <p style={{ fontSize: '14px', color: theme.steel }}>Real-time macroeconomic indicators</p>
        </div>
        <span style={{ fontSize: '12px', color: theme.steel, fontFamily: '"IBM Plex Mono", monospace', marginTop: '6px' }}>Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
        <IndexCard name="NIFTY 50" data={nifty} />
        <IndexCard name="SENSEX" data={sensex} />
        <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '20px', flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Market Breadth</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[{ label: 'Advances', value: '1,847', color: theme.success }, { label: 'Declines', value: '1,123', color: theme.error }, { label: 'Unchanged', value: '89', color: theme.steel }].map(b => (
              <div key={b.label}>
                <div style={{ fontSize: '22px', fontWeight: '600', color: b.color, fontFamily: '"IBM Plex Mono", monospace' }}>{b.value}</div>
                <div style={{ fontSize: '11px', color: theme.steel, textTransform: 'uppercase' }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {categories.map(c => <button key={c} onClick={() => setFilterCat(c)} style={{ padding: '7px 14px', fontSize: '13px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', background: filterCat === c ? theme.burgundy : theme.white, color: filterCat === c ? '#fff' : theme.graphite, border: `1px solid ${filterCat === c ? theme.burgundy : theme.fog}` }}>{c}</button>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {filtered.map(ind => (
          <div key={ind.label} style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{ind.label}</div>
            <div style={{ fontSize: '22px', fontWeight: '600', color: theme.nero, fontFamily: '"IBM Plex Mono", monospace', marginBottom: '4px' }}>{ind.value}</div>
            {ind.change !== null && <div style={{ fontSize: '12px', color: ind.change >= 0 ? theme.success : theme.error, fontFamily: '"IBM Plex Mono", monospace' }}>{ind.change >= 0 ? '▲ +' : '▼ '}{ind.change}</div>}
            <div style={{ fontSize: '11px', color: theme.steel, marginTop: '4px' }}>{ind.category}</div>
          </div>
        ))}
      </div>

      <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.nero, marginBottom: '16px' }}>Upcoming Events</h3>
        {[
          { date: '2026-06-04', event: 'RBI MPC Policy Decision', impact: 'High', expected: 'No change expected' },
          { date: '2026-06-12', event: 'CPI Inflation Data (May)', impact: 'High', expected: '4.0% YoY' },
          { date: '2026-06-15', event: 'India IIP Data', impact: 'Medium', expected: '4.5% growth' },
          { date: '2026-06-18', event: 'US Fed Meeting', impact: 'High', expected: 'Hold at 4.25-4.50%' },
          { date: '2026-06-28', event: 'India Q4 GDP Data', impact: 'High', expected: '6.8% growth' },
        ].map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 0', borderBottom: i < 4 ? `1px solid ${theme.fog}` : 'none' }}>
            <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px', color: theme.steel, minWidth: '90px' }}>{ev.date}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: theme.nero }}>{ev.event}</div>
              <div style={{ fontSize: '12px', color: theme.steel }}>{ev.expected}</div>
            </div>
            <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '3px', background: ev.impact === 'High' ? `${theme.error}18` : `${theme.warning}18`, color: ev.impact === 'High' ? theme.error : theme.warning }}>{ev.impact}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
