import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const EMPLOYEES = [
  { key: 'sachin',  name: 'Sachin',  initials: 'S'  },
  { key: 'sandhya', name: 'Sandhya', initials: 'Sa' },
  { key: 'bindu',   name: 'Bindu',   initials: 'B'  },
  { key: 'ganesh',  name: 'Ganesh',  initials: 'G'  },
];

const storageKey = (emp, date) => `wt-tracker-${emp}-${date}`;

const defaultContent = (name, date) =>
`## ${name} · ${date}

### Today's Work
-

### Meetings & Calls
-

### Pending / Follow-ups
- [ ]

### Notes

`;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s) {
  return esc(s)
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_((?!_).*?)_/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/`([^`]+)`/g, '<code style="font-family:\'IBM Plex Mono\',monospace;font-size:0.88em;padding:1px 5px;border-radius:3px;background:rgba(128,128,128,0.13)">$1</code>');
}

function parseMarkdown(md, colors) {
  if (!md) return '';
  const lines = md.split('\n');
  const out = [];
  let inUl = false, inOl = false, inCode = false, codeLines = [];

  const flush = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        out.push(`<pre style="background:rgba(128,128,128,0.08);border-radius:6px;padding:12px 16px;overflow-x:auto;font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;margin:8px 0"><code>${esc(codeLines.join('\n'))}</code></pre>`);
        codeLines = []; inCode = false;
      } else { flush(); inCode = true; }
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }

    if (line.startsWith('#### ')) { flush(); out.push(`<h4 style="font-size:12px;font-weight:600;margin:10px 0 4px;opacity:0.65;text-transform:uppercase;letter-spacing:0.4px">${inline(line.slice(5))}</h4>`); continue; }
    if (line.startsWith('### ')) { flush(); out.push(`<h3 style="font-size:14px;font-weight:600;margin:20px 0 6px;padding-bottom:4px;border-bottom:1px solid rgba(128,128,128,0.15)">${inline(line.slice(4))}</h3>`); continue; }
    if (line.startsWith('## '))  { flush(); out.push(`<h2 style="font-size:18px;font-weight:700;margin:4px 0 10px">${inline(line.slice(3))}</h2>`); continue; }
    if (line.startsWith('# '))   { flush(); out.push(`<h1 style="font-size:22px;font-weight:700;margin:0 0 14px;padding-bottom:10px;border-bottom:2px solid rgba(128,128,128,0.18)">${inline(line.slice(2))}</h1>`); continue; }

    if (line.match(/^[-*]{3,}$/) || line.match(/^_{3,}$/)) {
      flush(); out.push('<hr style="border:none;border-top:1px solid rgba(128,128,128,0.2);margin:16px 0" />'); continue;
    }

    // Checked checkbox
    if (line.match(/^[-*]\s\[[xX]\]\s?/)) {
      if (!inUl) { out.push('<ul style="list-style:none;padding-left:0;margin:4px 0">'); inUl = true; }
      out.push(`<li style="display:flex;gap:8px;align-items:flex-start;margin:4px 0;line-height:1.6"><span style="margin-top:3px;flex-shrink:0;font-size:14px;color:${colors.success}">✓</span><span style="text-decoration:line-through;opacity:0.55">${inline(line.replace(/^[-*]\s\[[xX]\]\s?/, ''))}</span></li>`);
      continue;
    }
    // Unchecked checkbox
    if (line.match(/^[-*]\s\[\s?\]\s?/)) {
      if (!inUl) { out.push('<ul style="list-style:none;padding-left:0;margin:4px 0">'); inUl = true; }
      out.push(`<li style="display:flex;gap:8px;align-items:flex-start;margin:4px 0;line-height:1.6"><span style="margin-top:4px;flex-shrink:0;width:13px;height:13px;border:1.5px solid rgba(128,128,128,0.45);border-radius:3px;display:inline-block"></span><span>${inline(line.replace(/^[-*]\s\[\s?\]\s?/, ''))}</span></li>`);
      continue;
    }
    // Bullet
    if (line.match(/^[-*]\s/)) {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul style="padding-left:18px;margin:4px 0">'); inUl = true; }
      out.push(`<li style="margin:3px 0;line-height:1.6">${inline(line.slice(2))}</li>`);
      continue;
    }
    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol style="padding-left:18px;margin:4px 0">'); inOl = true; }
      out.push(`<li style="margin:3px 0;line-height:1.6">${inline(line.replace(/^\d+\.\s/, ''))}</li>`);
      continue;
    }
    // Blockquote
    if (line.startsWith('> ')) {
      flush();
      out.push(`<blockquote style="border-left:3px solid rgba(128,128,128,0.3);margin:8px 0;padding:4px 0 4px 14px;opacity:0.75">${inline(line.slice(2))}</blockquote>`);
      continue;
    }

    if (line.trim() === '') { flush(); out.push('<div style="height:6px"></div>'); continue; }
    flush();
    out.push(`<p style="margin:3px 0;line-height:1.6">${inline(line)}</p>`);
  }
  flush();
  if (inCode) out.push(`<pre><code>${esc(codeLines.join('\n'))}</code></pre>`);
  return out.join('');
}

export default function WorkTracker() {
  const theme = useTheme();
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const [activeEmp, setActiveEmp] = useState(EMPLOYEES[0]);
  const [date, setDate] = useState(today);
  const [mode, setMode] = useState('split');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey(activeEmp.key, date));
    setContent(stored ?? defaultContent(activeEmp.name, date));
    setSaved(true);
  }, [activeEmp, date]);

  const handleChange = (val) => {
    setContent(val);
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(storageKey(activeEmp.key, date), val);
      setSaved(true);
    }, 600);
  };

  const shiftDate = (days) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  const fmtDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  const isToday = date === today;

  const insert = (before, after = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = content.slice(s, e);
    const next = content.slice(0, s) + before + sel + after + content.slice(e);
    handleChange(next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + before.length, e + before.length); }, 0);
  };

  const insertLine = (prefix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const lineStart = content.lastIndexOf('\n', s - 1) + 1;
    const next = content.slice(0, lineStart) + prefix + content.slice(lineStart);
    handleChange(next);
    setTimeout(() => { ta.focus(); const ns = s + prefix.length; ta.setSelectionRange(ns, ns); }, 0);
  };

  const empColor = { sachin: theme.burgundy, sandhya: theme.info, bindu: theme.orange, ganesh: theme.success };

  const tbBtn = (label, title, action, mono = false) => (
    <button
      key={label} onClick={action} title={title}
      style={{ padding: '4px 9px', background: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: mono ? '12px' : '11px', fontWeight: '600', color: theme.graphite, fontFamily: mono ? '"IBM Plex Mono", monospace' : 'inherit', lineHeight: 1.4 }}
      onMouseEnter={e => e.currentTarget.style.background = theme.smoke}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >{label}</button>
  );

  const sep = <div style={{ width: '1px', background: theme.fog, margin: '3px 3px', alignSelf: 'stretch' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)', gap: '14px' }}>

      {/* Page heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: theme.nero, margin: 0 }}>Work Tracker</h1>
          <p style={{ fontSize: '13px', color: theme.steel, margin: '3px 0 0' }}>Daily logs · visible to Sachin & Bindu only</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: theme.steel }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: saved ? theme.success : theme.warning, transition: 'background 0.3s' }} />
          {saved ? 'Saved' : 'Saving…'}
        </div>
      </div>

      {/* Employee tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {EMPLOYEES.map(emp => {
          const active = activeEmp.key === emp.key;
          const color = empColor[emp.key];
          return (
            <button key={emp.key} onClick={() => setActiveEmp(emp)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 16px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '500', border: `1.5px solid ${active ? color : theme.fog}`, background: active ? `${color}14` : theme.white, color: active ? color : theme.graphite, transition: 'all 0.15s' }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = theme.fog; e.currentTarget.style.color = theme.graphite; } }}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: color, color: '#fff', fontSize: '9px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{emp.initials}</div>
              {emp.name}
            </button>
          );
        })}
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Date nav */}
        <div style={{ display: 'flex', alignItems: 'center', background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '6px', overflow: 'hidden' }}>
          <button onClick={() => shiftDate(-1)}
            style={{ padding: '7px 12px', background: 'none', border: 'none', cursor: 'pointer', color: theme.steel, fontSize: '16px', lineHeight: 1 }}
            onMouseEnter={e => e.currentTarget.style.background = theme.smoke}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >‹</button>
          <span style={{ fontSize: '13px', fontWeight: '500', color: theme.nero, padding: '0 8px', minWidth: '178px', textAlign: 'center', userSelect: 'none' }}>{fmtDate(date)}</span>
          <button onClick={() => shiftDate(1)} disabled={isToday}
            style={{ padding: '7px 12px', background: 'none', border: 'none', cursor: isToday ? 'default' : 'pointer', color: isToday ? theme.fog : theme.steel, fontSize: '16px', lineHeight: 1 }}
            onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = theme.smoke; }}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >›</button>
        </div>

        {!isToday && (
          <button onClick={() => setDate(today)}
            style={{ padding: '7px 13px', fontSize: '12px', fontWeight: '500', borderRadius: '6px', border: `1px solid ${theme.fog}`, background: theme.white, color: theme.graphite, cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.background = theme.smoke}
            onMouseLeave={e => e.currentTarget.style.background = theme.white}
          >Today</button>
        )}

        <div style={{ flex: 1 }} />

        {/* Formatting toolbar */}
        {mode !== 'preview' && (
          <div style={{ display: 'flex', alignItems: 'center', background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '6px', padding: '3px' }}>
            {tbBtn('B', 'Bold (Ctrl+B)', () => insert('**', '**'))}
            {tbBtn('I', 'Italic', () => insert('*', '*'))}
            {sep}
            {tbBtn('H2', 'Heading 2', () => insertLine('## '))}
            {tbBtn('H3', 'Heading 3', () => insertLine('### '))}
            {sep}
            {tbBtn('—', 'Bullet list', () => insertLine('- '))}
            {tbBtn('☐', 'Todo item', () => insertLine('- [ ] '))}
            {tbBtn('☑', 'Done item', () => insertLine('- [x] '))}
            {sep}
            {tbBtn('`…`', 'Inline code', () => insert('`', '`'), true)}
            {tbBtn('───', 'Divider', () => {
              const ta = textareaRef.current;
              if (!ta) return;
              const pos = ta.selectionStart;
              handleChange(content.slice(0, pos) + '\n---\n' + content.slice(pos));
            })}
          </div>
        )}

        {/* View toggle */}
        <div style={{ display: 'flex', background: theme.smoke, borderRadius: '6px', padding: '3px', gap: '2px' }}>
          {[['edit', 'Edit'], ['split', 'Split'], ['preview', 'Preview']].map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)}
              style={{ padding: '5px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500', fontFamily: 'inherit', background: mode === m ? theme.white : 'transparent', color: mode === m ? theme.nero : theme.steel, boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}
            >{l}</button>
          ))}
        </div>
      </div>

      {/* Editor / Preview panes */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: mode === 'split' ? '1fr 1fr' : '1fr', gap: '10px', minHeight: 0 }}>
        {mode !== 'preview' && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const s = e.target.selectionStart;
                const next = content.slice(0, s) + '  ' + content.slice(s);
                handleChange(next);
                setTimeout(() => e.target.setSelectionRange(s + 2, s + 2), 0);
              }
              if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); insert('**', '**'); }
              if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); insert('*', '*'); }
            }}
            spellCheck={false}
            style={{
              resize: 'none', width: '100%', height: '100%',
              padding: '18px 20px',
              border: `1px solid ${theme.fog}`, borderRadius: '6px',
              fontSize: '13px', lineHeight: '1.75',
              fontFamily: '"IBM Plex Mono", monospace',
              background: theme.white, color: theme.nero,
              outline: 'none', boxSizing: 'border-box',
              overflowY: 'auto',
            }}
          />
        )}
        {mode !== 'edit' && (
          <div
            style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '6px', padding: '20px 24px', overflowY: 'auto', fontSize: '14px', color: theme.nero, lineHeight: '1.65' }}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content, theme) }}
          />
        )}
      </div>
    </div>
  );
}
