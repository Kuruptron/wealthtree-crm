import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

// ── Symbol catalogue ──────────────────────────────────────────────────────────

const ALL_SYMBOLS = [
  // Indian Equity
  { key: 'nifty50',   symbol: '^NSEI',      label: 'Nifty 50',        cat: 'Equity',    fmt: 'IN'  },
  { key: 'sensex',    symbol: '^BSESN',     label: 'Sensex',          cat: 'Equity',    fmt: 'IN'  },
  { key: 'banknifty', symbol: '^NSEBANK',   label: 'Bank Nifty',      cat: 'Equity',    fmt: 'IN'  },
  { key: 'indiavix',  symbol: '^INDIAVIX',  label: 'India VIX',       cat: 'Equity',    fmt: 'num' },
  { key: 'niftyit',   symbol: '^CNXIT',     label: 'Nifty IT',        cat: 'Equity',    fmt: 'IN'  },
  { key: 'midcap',    symbol: '^NSMIDCP',   label: 'Nifty Midcap',    cat: 'Equity',    fmt: 'IN'  },
  // Currency
  { key: 'usdinr',    symbol: 'USDINR=X',   label: 'USD / INR',       cat: 'Currency',  fmt: 'INR' },
  { key: 'eurinr',    symbol: 'EURINR=X',   label: 'EUR / INR',       cat: 'Currency',  fmt: 'INR' },
  { key: 'gbpinr',    symbol: 'GBPINR=X',   label: 'GBP / INR',       cat: 'Currency',  fmt: 'INR' },
  { key: 'jpyinr',    symbol: 'JPYINR=X',   label: 'JPY / INR',       cat: 'Currency',  fmt: 'INR' },
  // Commodities
  { key: 'gold',      symbol: 'GC=F',       label: 'Gold (USD/oz)',   cat: 'Commodity', fmt: 'USD' },
  { key: 'silver',    symbol: 'SI=F',       label: 'Silver (USD/oz)', cat: 'Commodity', fmt: 'USD' },
  { key: 'crude',     symbol: 'CL=F',       label: 'Crude WTI',       cat: 'Commodity', fmt: 'USD' },
  { key: 'brent',     symbol: 'BZ=F',       label: 'Brent Crude',     cat: 'Commodity', fmt: 'USD' },
  // Global
  { key: 'sp500',     symbol: '^GSPC',      label: 'S&P 500',         cat: 'Global',    fmt: 'USD' },
  { key: 'nasdaq',    symbol: '^IXIC',      label: 'Nasdaq',          cat: 'Global',    fmt: 'USD' },
  { key: 'dow',       symbol: '^DJI',       label: 'Dow Jones',       cat: 'Global',    fmt: 'USD' },
  { key: 'nikkei',    symbol: '^N225',      label: 'Nikkei 225',      cat: 'Global',    fmt: 'JPY' },
  { key: 'hangseng',  symbol: '^HSI',       label: 'Hang Seng',       cat: 'Global',    fmt: 'HKD' },
  // Rates
  { key: 'us10y',     symbol: '^TNX',       label: '10Y US Treasury', cat: 'Rates',     fmt: 'pct' },
  { key: 'us2y',      symbol: '^IRX',       label: '13W US T-Bill',   cat: 'Rates',     fmt: 'pct' },
];

const DEFAULT_PINNED = ['nifty50','sensex','banknifty','indiavix','usdinr','gold','crude','sp500'];

const TIMEFRAMES = [
  { key: '1D', label: '1D',  interval: '5m',  range: '1d'  },
  { key: '3D', label: '3D',  interval: '30m', range: '5d'  },
  { key: '5D', label: '5D',  interval: '30m', range: '5d'  },
  { key: '6M', label: '6M',  interval: '1d',  range: '6mo' },
  { key: '1Y', label: '1Y',  interval: '1d',  range: '1y'  },
  { key: '5Y', label: '5Y',  interval: '1wk', range: '5y'  },
];

const STORAGE_KEY = 'wt-macro-v1';

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      pinned:      s.pinned      || DEFAULT_PINNED,
      timeframe:   s.timeframe   || '1D',
      refreshSecs: s.refreshSecs || 60,
      chartSym:    s.chartSym    || 'nifty50',
    };
  } catch {
    return { pinned: DEFAULT_PINNED, timeframe: '1D', refreshSecs: 60, chartSym: 'nifty50' };
  }
}

function saveSettings(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

async function fetchYahoo(symbol, interval, range) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    const res = j.chart?.result?.[0];
    if (!res) throw new Error('empty');
    const m = res.meta;
    const ts = res.timestamp || [];
    const cl = res.indicators?.quote?.[0]?.close || [];
    return {
      price:  m.regularMarketPrice,
      prev:   m.previousClose || m.chartPreviousClose || m.regularMarketPrice,
      high:   m.regularMarketDayHigh,
      low:    m.regularMarketDayLow,
      series: ts.map((t, i) => ({ time: t * 1000, price: cl[i] }))
               .filter(d => d.price != null && !isNaN(d.price)),
    };
  } catch (e) {
    console.warn('Yahoo fetch failed:', symbol, e.message);
    return null;
  }
}

function trimSeries(series, tfKey) {
  if (tfKey !== '3D') return series;
  const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;
  return series.filter(d => d.time >= cutoff);
}

function fmtPrice(p, fmt) {
  if (p == null) return '—';
  if (fmt === 'pct') return p.toFixed(2) + '%';
  if (fmt === 'num') return p.toFixed(2);
  return p.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function chgOf(price, prev) {
  if (price == null || prev == null) return { chg: 0, pct: 0 };
  return { chg: price - prev, pct: ((price - prev) / Math.abs(prev || 1)) * 100 };
}

// ── SVG Line Chart ────────────────────────────────────────────────────────────

function LineChart({ series, up, theme, tfKey }) {
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);

  const W = 900, H = 230;
  const pad = { t: 14, r: 20, b: 38, l: 80 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  const valid = (series || []).filter(d => d.price != null && !isNaN(d.price));

  if (!valid.length) {
    return (
      <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.steel, fontSize: 13, gap: 8 }}>
        <span style={{ animation: 'pulse 1.5s infinite', display: 'inline-block' }}>⊙</span> Fetching live data…
      </div>
    );
  }

  const prices = valid.map(d => d.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const rng = hi - lo || Math.abs(hi) * 0.01 || 1;
  const buf = rng * 0.08;

  const xOf = i => pad.l + (i / (valid.length - 1)) * cW;
  const yOf = p => pad.t + cH - ((p - lo + buf) / (rng + buf * 2)) * cH;

  const linePts = valid.map((d, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(d.price).toFixed(1)}`).join('');
  const areaPts = `${linePts}L${xOf(valid.length - 1).toFixed(1)},${(pad.t + cH).toFixed(1)}L${xOf(0).toFixed(1)},${(pad.t + cH).toFixed(1)}Z`;

  const lineColor = up ? theme.success : theme.error;
  const gradId = `cg_${up ? 'u' : 'd'}`;

  // Y axis — 5 ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => lo + (rng * i / 4));
  // X axis — up to 6 evenly spaced
  const nX = Math.min(6, valid.length);
  const xIdxs = Array.from({ length: nX }, (_, i) => Math.round((i / (nX - 1)) * (valid.length - 1)));

  const fmtY = v => v >= 100000 ? (v / 1000).toFixed(0) + 'k'
    : v >= 1000   ? v.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : v.toFixed(2);

  const fmtX = d => {
    const dt = new Date(d.time);
    if (['1D', '3D', '5D'].includes(tfKey))
      return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    return dt.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short',
      ...(tfKey === '5Y' ? { year: '2-digit' } : {}),
    });
  };

  const onMove = e => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - rect.left) * (W / rect.width);
    const i = Math.max(0, Math.min(valid.length - 1, Math.round(((relX - pad.l) / cW) * (valid.length - 1))));
    setHover({ i, d: valid[i], sx: xOf(i), sy: yOf(valid[i].price) });
  };

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={lineColor} stopOpacity="0.20" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={pad.l} y1={yOf(v).toFixed(1)} x2={W - pad.r} y2={yOf(v).toFixed(1)}
              stroke={theme.fog} strokeWidth="0.6" />
            <text x={pad.l - 8} y={yOf(v) + 4} textAnchor="end" fontSize="11"
              fill={theme.steel} fontFamily="IBM Plex Mono, monospace">{fmtY(v)}</text>
          </g>
        ))}

        {/* X labels */}
        {xIdxs.map(i => (
          <text key={i} x={xOf(i).toFixed(1)} y={H - 6} textAnchor="middle" fontSize="11"
            fill={theme.steel} fontFamily="IBM Plex Mono, monospace">{fmtX(valid[i])}</text>
        ))}

        {/* Area + line */}
        <path d={areaPts} fill={`url(#${gradId})`} />
        <path d={linePts} fill="none" stroke={lineColor} strokeWidth="1.8" strokeLinejoin="round" />

        {/* Hover crosshair */}
        {hover && (
          <>
            <line x1={hover.sx.toFixed(1)} y1={pad.t} x2={hover.sx.toFixed(1)} y2={pad.t + cH}
              stroke={theme.steel} strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
            <circle cx={hover.sx} cy={hover.sy} r="4.5"
              fill={lineColor} stroke={theme.white} strokeWidth="2" />
          </>
        )}
      </svg>

      {/* Hover tooltip */}
      {hover && (
        <div style={{
          position: 'absolute', top: 10,
          ...(hover.sx / W > 0.55 ? { left: '4%' } : { right: '4%' }),
          background: theme.white, border: `1px solid ${theme.fog}`,
          borderRadius: 7, padding: '8px 14px',
          pointerEvents: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10,
        }}>
          <div style={{ fontSize: 11, color: theme.steel, marginBottom: 3 }}>{fmtX(hover.d)}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: lineColor, fontFamily: '"IBM Plex Mono", monospace' }}>
            {hover.d.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Symbol card ───────────────────────────────────────────────────────────────

function SymbolCard({ sym, d, selected, onClick, pinned, onTogglePin, theme }) {
  const { chg, pct } = d ? chgOf(d.price, d.prev) : { chg: 0, pct: 0 };
  const up = chg >= 0;
  const isLoading = !d;

  return (
    <div onClick={onClick}
      style={{
        background: selected ? `${theme.burgundy}14` : theme.white,
        border: `1.5px solid ${selected ? theme.burgundy : theme.fog}`,
        borderRadius: 8, padding: '14px 16px', cursor: 'pointer',
        transition: 'all 0.15s', position: 'relative',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = `${theme.burgundy}70`; e.currentTarget.style.background = theme.smoke; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = theme.fog; e.currentTarget.style.background = theme.white; } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {sym.label}
        </span>
        <button onClick={e => { e.stopPropagation(); onTogglePin(sym.key); }}
          title={pinned ? 'Unpin' : 'Pin to dashboard'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: pinned ? theme.burgundy : theme.fog, fontSize: 15, padding: 0, lineHeight: 1, transition: 'color 0.15s' }}>
          ★
        </button>
      </div>
      {isLoading ? (
        <div style={{ height: 42, display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: theme.steel, animation: 'pulse 1.5s infinite' }}>Loading…</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.nero, fontFamily: '"IBM Plex Mono", monospace', marginBottom: 4, letterSpacing: '-0.5px' }}>
            {fmtPrice(d.price, sym.fmt)}
          </div>
          <div style={{ fontSize: 12, fontFamily: '"IBM Plex Mono", monospace', color: up ? theme.success : theme.error }}>
            {up ? '▲' : '▼'} {Math.abs(chg).toFixed(2)} <span style={{ opacity: 0.8 }}>({up ? '+' : ''}{pct.toFixed(2)}%)</span>
          </div>
        </>
      )}
      {/* Live indicator */}
      <div style={{ position: 'absolute', top: 14, left: 14 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: d ? theme.success : theme.fog, animation: d ? 'pulse 2s infinite' : 'none' }} />
      </div>
    </div>
  );
}

// ── Customize drawer ──────────────────────────────────────────────────────────

function CustomizeDrawer({ pinned, onToggle, refreshSecs, onRefreshChange, onClose, theme }) {
  const cats = [...new Set(ALL_SYMBOLS.map(s => s.cat))];

  return (
    <>
      <div onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 499 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: 340, height: '100vh',
        background: theme.white, borderLeft: `1px solid ${theme.fog}`,
        boxShadow: '-12px 0 40px rgba(0,0,0,0.18)', zIndex: 500,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.fog}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.nero, margin: 0 }}>Customize Dashboard</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.steel, fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Symbols by category */}
          {cats.map(cat => (
            <div key={cat} style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>{cat}</div>
              {ALL_SYMBOLS.filter(s => s.cat === cat).map(s => {
                const on = pinned.includes(s.key);
                return (
                  <div key={s.key} onClick={() => onToggle(s.key)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${theme.fog}`, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <span style={{ fontSize: 13, color: theme.nero }}>{s.label}</span>
                    {/* Toggle pill */}
                    <div style={{ width: 40, height: 22, borderRadius: 11, background: on ? theme.burgundy : theme.fog, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: on ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Auto-refresh */}
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Auto-Refresh</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ val: 30, label: '30s' }, { val: 60, label: '1 min' }, { val: 300, label: '5 min' }].map(o => (
              <button key={o.val} onClick={() => onRefreshChange(o.val)}
                style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: `1.5px solid ${refreshSecs === o.val ? theme.burgundy : theme.fog}`, background: refreshSecs === o.val ? `${theme.burgundy}14` : theme.smoke, color: refreshSecs === o.val ? theme.burgundy : theme.graphite, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                {o.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20, fontSize: 12, color: theme.steel, lineHeight: 1.6 }}>
            Data sourced from Yahoo Finance. Market hours: IST 09:15–15:30 for Indian indices.
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main MacroDashboard ───────────────────────────────────────────────────────

export default function MacroDashboard() {
  const theme = useTheme();
  const [settings, setSettings]         = useState(loadSettings);
  const [data, setData]                 = useState({});
  const [tf, setTf]                     = useState(() => loadSettings().timeframe);
  const [chartSym, setChartSym]         = useState(() => loadSettings().chartSym);
  const [lastUp, setLastUp]             = useState(null);
  const [fetching, setFetching]         = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [filterCat, setFilterCat]       = useState('All');

  const updateSettings = patch => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  };

  const fetchAll = useCallback(async () => {
    const tfObj = TIMEFRAMES.find(t => t.key === tf) || TIMEFRAMES[0];
    setFetching(true);
    const entries = await Promise.all(
      settings.pinned.map(async key => {
        const sym = ALL_SYMBOLS.find(s => s.key === key);
        if (!sym) return [key, null];
        const d = await fetchYahoo(sym.symbol, tfObj.interval, tfObj.range);
        if (!d) return [key, null];
        return [key, { ...d, series: trimSeries(d.series, tf) }];
      })
    );
    setData(prev => {
      const next = { ...prev };
      for (const [k, d] of entries) { if (d) next[k] = d; }
      return next;
    });
    setLastUp(new Date());
    setFetching(false);
  }, [settings.pinned, tf]);

  // Refetch when pinned list or timeframe changes
  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh
  useEffect(() => {
    const id = setInterval(fetchAll, settings.refreshSecs * 1000);
    return () => clearInterval(id);
  }, [fetchAll, settings.refreshSecs]);

  // If the charted symbol is unpinned, switch to first pinned
  useEffect(() => {
    if (!settings.pinned.includes(chartSym) && settings.pinned.length > 0) {
      setChartSym(settings.pinned[0]);
    }
  }, [settings.pinned, chartSym]);

  const cats = ['All', ...new Set(
    ALL_SYMBOLS.filter(s => settings.pinned.includes(s.key)).map(s => s.cat)
  )];

  const displaySymbols = ALL_SYMBOLS.filter(s =>
    settings.pinned.includes(s.key) &&
    (filterCat === 'All' || s.cat === filterCat)
  );

  const chartSymObj  = ALL_SYMBOLS.find(s => s.key === chartSym) || ALL_SYMBOLS[0];
  const chartData    = data[chartSym];
  const { chg: cChg, pct: cPct } = chartData ? chgOf(chartData.price, chartData.prev) : { chg: 0, pct: 0 };
  const chartUp      = cChg >= 0;

  const selectChartSym = key => {
    setChartSym(key);
    updateSettings({ chartSym: key });
  };
  const selectTf = key => {
    setTf(key);
    updateSettings({ timeframe: key });
  };

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.nero, marginBottom: 4 }}>Macro Dashboard</h1>
          <p style={{ fontSize: 13, color: theme.steel }}>
            Live market data · {settings.pinned.length} symbols tracked · refreshes every {settings.refreshSecs < 60 ? `${settings.refreshSecs}s` : `${settings.refreshSecs / 60}m`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {lastUp && (
            <span style={{ fontSize: 11, color: theme.steel, fontFamily: '"IBM Plex Mono", monospace' }}>
              {fetching ? '⟳ updating…' : `↺ ${lastUp.toLocaleTimeString('en-IN', { hour12: false })}`}
            </span>
          )}
          <button onClick={fetchAll} disabled={fetching}
            style={{ padding: '7px 14px', fontSize: 12, borderRadius: 6, border: `1px solid ${theme.fog}`, background: theme.white, color: theme.graphite, cursor: 'pointer', fontFamily: 'inherit', opacity: fetching ? 0.5 : 1 }}>
            ↻ Refresh
          </button>
          <button onClick={() => setShowCustomize(true)}
            style={{ padding: '7px 16px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: 'none', background: theme.burgundy, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            ⚙ Customize
          </button>
        </div>
      </div>

      {/* ── Chart section ── */}
      <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
        {/* Chart controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          {/* Symbol picker + price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <select value={chartSym}
              onChange={e => selectChartSym(e.target.value)}
              style={{ padding: '8px 12px', border: `1px solid ${theme.fog}`, borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', background: theme.smoke, color: theme.nero, outline: 'none', cursor: 'pointer' }}>
              {ALL_SYMBOLS.filter(s => settings.pinned.includes(s.key)).map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>

            {chartData ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: theme.nero, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '-1px' }}>
                  {fmtPrice(chartData.price, chartSymObj.fmt)}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: chartUp ? theme.success : theme.error, fontFamily: '"IBM Plex Mono", monospace' }}>
                  {chartUp ? '▲' : '▼'} {Math.abs(cChg).toFixed(2)} ({chartUp ? '+' : ''}{cPct.toFixed(2)}%)
                </span>
              </div>
            ) : (
              <span style={{ fontSize: 13, color: theme.steel, animation: 'pulse 1.5s infinite' }}>Fetching…</span>
            )}
          </div>

          {/* Timeframe tabs */}
          <div style={{ display: 'flex', background: theme.smoke, borderRadius: 7, padding: 3, gap: 2 }}>
            {TIMEFRAMES.map(t => (
              <button key={t.key} onClick={() => selectTf(t.key)}
                style={{ padding: '6px 14px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace', background: tf === t.key ? theme.white : 'transparent', color: tf === t.key ? theme.nero : theme.steel, boxShadow: tf === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stat row */}
        {chartData && (
          <div style={{ display: 'flex', gap: 24, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'Day High',   val: fmtPrice(chartData.high, chartSymObj.fmt), color: theme.success },
              { label: 'Day Low',    val: fmtPrice(chartData.low,  chartSymObj.fmt), color: theme.error   },
              { label: 'Prev Close', val: fmtPrice(chartData.prev, chartSymObj.fmt), color: theme.steel   },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 10, color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: s.color, fontFamily: '"IBM Plex Mono", monospace' }}>{s.val}</div>
              </div>
            ))}
          </div>
        )}

        <LineChart series={chartData?.series} up={chartUp} theme={theme} tfKey={tf} />
      </div>

      {/* ── Category filter ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            style={{ padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${filterCat === c ? theme.burgundy : theme.fog}`, background: filterCat === c ? theme.burgundy : theme.white, color: filterCat === c ? '#fff' : theme.graphite, transition: 'all 0.15s' }}>
            {c}
          </button>
        ))}
      </div>

      {/* ── Symbol cards grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: 12, marginBottom: 28 }}>
        {displaySymbols.map(sym => (
          <SymbolCard
            key={sym.key} sym={sym} d={data[sym.key]}
            selected={chartSym === sym.key}
            onClick={() => selectChartSym(sym.key)}
            pinned={settings.pinned.includes(sym.key)}
            onTogglePin={key => {
              const next = settings.pinned.includes(key)
                ? settings.pinned.filter(k => k !== key)
                : [...settings.pinned, key];
              updateSettings({ pinned: next });
            }}
            theme={theme}
          />
        ))}
      </div>

      {/* ── Upcoming events ── */}
      <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: 10, padding: '20px 24px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: theme.nero, marginBottom: 16 }}>Upcoming Events</h3>
        {[
          { date: '2026-06-04', event: 'RBI MPC Policy Decision',   impact: 'High',   expected: 'No change expected'      },
          { date: '2026-06-12', event: 'CPI Inflation Data (May)',   impact: 'High',   expected: '4.0% YoY'               },
          { date: '2026-06-15', event: 'India IIP Data',             impact: 'Medium', expected: '4.5% growth'            },
          { date: '2026-06-18', event: 'US Fed Meeting',             impact: 'High',   expected: 'Hold at 4.25–4.50%'     },
          { date: '2026-06-28', event: 'India Q4 GDP Data',          impact: 'High',   expected: '6.8% growth'            },
        ].map((ev, i, arr) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${theme.fog}` : 'none' }}>
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

      {/* ── Customize drawer ── */}
      {showCustomize && (
        <CustomizeDrawer
          pinned={settings.pinned}
          onToggle={key => {
            const next = settings.pinned.includes(key)
              ? settings.pinned.filter(k => k !== key)
              : [...settings.pinned, key];
            updateSettings({ pinned: next });
          }}
          refreshSecs={settings.refreshSecs}
          onRefreshChange={s => updateSettings({ refreshSecs: s })}
          onClose={() => setShowCustomize(false)}
          theme={theme}
        />
      )}
    </div>
  );
}
