import { useState, useEffect } from 'react';
import { formatNumber } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export default function LiveMarketTicker() {
  const theme = useTheme();
  const [indices, setIndices] = useState({
    nifty: { value: 22547.85, change: 145.32, pct: 0.65 },
    sensex: { value: 74339.44, change: 487.28, pct: 0.66 },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => ({
        nifty: { value: parseFloat((prev.nifty.value + (Math.random() - 0.5) * 50).toFixed(2)), change: parseFloat((prev.nifty.change + (Math.random() - 0.5) * 10).toFixed(2)), pct: parseFloat((prev.nifty.pct + (Math.random() - 0.5) * 0.1).toFixed(2)) },
        sensex: { value: parseFloat((prev.sensex.value + (Math.random() - 0.5) * 150).toFixed(2)), change: parseFloat((prev.sensex.change + (Math.random() - 0.5) * 30).toFixed(2)), pct: parseFloat((prev.sensex.pct + (Math.random() - 0.5) * 0.1).toFixed(2)) }
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const IndexPill = ({ name, data }) => {
    const isPos = data.change >= 0;
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '6px 14px', background: theme.smoke, borderRadius: '6px', fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px' }}>
        <span style={{ fontWeight: '600', color: theme.nero }}>{name}</span>
        <span style={{ color: theme.graphite }}>{formatNumber(data.value)}</span>
        <span style={{ color: isPos ? theme.success : theme.error, display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isPos ? '▲' : '▼'} {isPos ? '+' : ''}{data.change.toFixed(2)} ({isPos ? '+' : ''}{data.pct}%)
        </span>
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: theme.success, animation: 'pulse 2s infinite' }} />
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: '12px', padding: '16px 0', borderBottom: `1px solid ${theme.fog}`, marginBottom: '32px', flexWrap: 'wrap' }}>
      <IndexPill name="NIFTY 50" data={indices.nifty} />
      <IndexPill name="SENSEX" data={indices.sensex} />
    </div>
  );
}
