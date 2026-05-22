import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

const INDICES = [
  { symbol: '^NSEI',  label: 'Nifty 50',  sub: 'NSE · India'   },
  { symbol: '^BSESN', label: 'Sensex',    sub: 'BSE · India'   },
  { symbol: '^GSPC',  label: 'S&P 500',   sub: 'NYSE · USA'    },
  { symbol: '^DJI',   label: 'Dow Jones', sub: 'NYSE · USA'    },
  { symbol: '^IXIC',  label: 'Nasdaq',    sub: 'NASDAQ · USA'  },
  { symbol: '^N225',  label: 'Nikkei 225',sub: 'TSE · Japan'   },
];

const EVENTS = [
  { date: '2026-06-04', event: 'RBI MPC Policy Decision',  impact: 'High',   expected: 'No change expected'  },
  { date: '2026-06-12', event: 'CPI Inflation Data (May)', impact: 'High',   expected: '4.0% YoY'            },
  { date: '2026-06-15', event: 'India IIP Data',           impact: 'Medium', expected: '4.5% growth'         },
  { date: '2026-06-18', event: 'US Fed Meeting',           impact: 'High',   expected: 'Hold at 4.25–4.50%'  },
  { date: '2026-06-28', event: 'India Q4 GDP Data',        impact: 'High',   expected: '6.8% growth'         },
];

function yahooUrl(symbol) {
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d&includePrePost=false`;
}

// Try direct, then query2, then CORS proxy
const FETCH_SOURCES = [
  s => `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?interval=1d&range=1d&includePrePost=false`,
  s => yahooUrl(s),
  s => `https://corsproxy.io/?${encodeURIComponent(yahooUrl(s))}`,
];

async function fetchQuote(symbol) {
  for (const srcFn of FETCH_SOURCES) {
    try {
      const res = await fetch(srcFn(symbol), { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const json = await res.json();
      const m = json.chart?.result?.[0]?.meta;
      if (m?.regularMarketPrice != null) {
        return {
          price:  m.regularMarketPrice,
          change: m.regularMarketPrice - (m.previousClose ?? m.chartPreviousClose ?? m.regularMarketPrice),
          prev:   m.previousClose ?? m.chartPreviousClose ?? m.regularMarketPrice,
          high:   m.regularMarketDayHigh,
          low:    m.regularMarketDayLow,
        };
      }
    } catch { /* try next source */ }
  }
  return null;
}

function fmt(v, decimals = 2) {
  if (v == null || isNaN(v)) return '—';
  return v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function IndexCard({ idx, theme }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    const d = await fetchQuote(idx.symbol);
    if (d) { setData(d); setError(false); }
    else    { setError(true); }
    setLoading(false);
  }, [idx.symbol]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(load, 5_000);
    return () => clearInterval(id);
  }, [load]);

  const chg  = data?.change ?? 0;
  const pct  = data && data.prev ? (chg / Math.abs(data.prev)) * 100 : 0;
  const up   = chg >= 0;
  const clr  = error ? theme.steel : up ? theme.success : theme.error;

  return (
    <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: 10, padding: '20px 22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.nero }}>{idx.label}</div>
          <div style={{ fontSize: 11, color: theme.steel, marginTop: 2 }}>{idx.sub}</div>
        </div>
        {loading && (
          <div style={{ width: 16, height: 16, border: `2px solid ${theme.fog}`, borderTopColor: theme.burgundy, borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
        )}
      </div>

      {/* Price */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: theme.nero, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '-0.5px', lineHeight: 1 }}>
          {loading ? <span style={{ color: theme.fog }}>—</span> : fmt(data?.price)}
        </div>
        {!loading && data && (
          <div style={{ marginTop: 5, fontSize: 13, fontWeight: 600, color: clr, fontFamily: '"IBM Plex Mono", monospace' }}>
            {up ? '▲' : '▼'} {Math.abs(chg).toFixed(2)} ({up ? '+' : ''}{pct.toFixed(2)}%)
          </div>
        )}
        {!loading && error && (
          <div style={{ marginTop: 5, fontSize: 12, color: theme.steel }}>Data unavailable</div>
        )}
      </div>

      {/* Day stats */}
      {data && !loading && (
        <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${theme.fog}`, paddingTop: 12 }}>
          {[
            { label: 'High',       val: fmt(data.high), color: theme.success },
            { label: 'Low',        val: fmt(data.low),  color: theme.error   },
            { label: 'Prev Close', val: fmt(data.prev), color: theme.steel   },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ flex: 1, paddingRight: i < arr.length - 1 ? 12 : 0, borderRight: i < arr.length - 1 ? `1px solid ${theme.fog}` : 'none', paddingLeft: i > 0 ? 12 : 0 }}>
              <div style={{ fontSize: 10, color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.color, fontFamily: '"IBM Plex Mono", monospace' }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Skeleton stats row while loading */}
      {loading && (
        <div style={{ display: 'flex', gap: 12, borderTop: `1px solid ${theme.fog}`, paddingTop: 12 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ height: 10, background: theme.fog, borderRadius: 4, marginBottom: 5, width: '60%' }} />
              <div style={{ height: 12, background: theme.fog, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MacroDashboard() {
  const theme = useTheme();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.nero, marginBottom: 4 }}>Macro Dashboard</h1>
        <p style={{ fontSize: 13, color: theme.steel }}>Live market data · auto-refreshes every minute</p>
      </div>

      {/* Index grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 28 }}>
        {INDICES.map(idx => <IndexCard key={idx.symbol} idx={idx} theme={theme} />)}
      </div>

      {/* Upcoming events */}
      <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: 10, padding: '20px 24px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: theme.nero, marginBottom: 16 }}>Upcoming Events</h3>
        {EVENTS.map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: i < EVENTS.length - 1 ? `1px solid ${theme.fog}` : 'none' }}>
            <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, color: theme.steel, minWidth: 92 }}>{ev.date}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: theme.nero }}>{ev.event}</div>
              <div style={{ fontSize: 12, color: theme.steel }}>{ev.expected}</div>
            </div>
            <span style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600, borderRadius: 3, background: ev.impact === 'High' ? `${theme.error}18` : `${theme.warning}18`, color: ev.impact === 'High' ? theme.error : theme.warning }}>
              {ev.impact}
            </span>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
