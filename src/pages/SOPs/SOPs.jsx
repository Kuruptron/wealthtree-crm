import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/shared/Icons';
import PageHeader from '../../components/shared/PageHeader';
import { sops as initialSOPs } from '../../data/mockData';

export default function SOPs() {
  const theme = useTheme();
  const categoryColor = { Onboarding: theme.burgundy, Review: theme.info, Transactions: theme.success, Compliance: theme.warning };
  const [sops] = useState(initialSOPs);
  const [selected, setSelected] = useState(null);
  const [checklist, setChecklist] = useState({});

  const activeSOP = sops.find(s => s.id === selected);
  const toggleStep = (sopId, stepId) => setChecklist(prev => ({ ...prev, [`${sopId}-${stepId}`]: !prev[`${sopId}-${stepId}`] }));
  const getProgress = (sopId, steps) => { const done = steps.filter(s => checklist[`${sopId}-${s.id}`]).length; return { done, total: steps.length, pct: Math.round((done / steps.length) * 100) }; };
  const resetChecklist = (sopId, steps) => { const reset = {}; steps.forEach(s => { reset[`${sopId}-${s.id}`] = false; }); setChecklist(prev => ({ ...prev, ...reset })); };

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 140px)' }}>
      <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        <PageHeader title="SOPs" subtitle="Standard Operating Procedures" />
        {sops.map(sop => {
          const prog = getProgress(sop.id, sop.steps);
          return (
            <div key={sop.id} onClick={() => setSelected(sop.id)} style={{ background: selected === sop.id ? `${theme.burgundy}10` : theme.white, border: `1px solid ${selected === sop.id ? theme.burgundy : theme.fog}`, borderRadius: '4px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: theme.nero }}>{sop.title}</div>
                <span style={{ padding: '2px 8px', fontSize: '10px', fontWeight: '600', borderRadius: '3px', background: `${categoryColor[sop.category] || theme.steel}18`, color: categoryColor[sop.category] || theme.steel, whiteSpace: 'nowrap', marginLeft: '8px' }}>{sop.category}</span>
              </div>
              <div style={{ fontSize: '12px', color: theme.steel, marginBottom: '10px' }}>{sop.steps.length} steps</div>
              <div style={{ height: '4px', background: theme.fog, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${prog.pct}%`, background: prog.pct === 100 ? theme.success : theme.burgundy, borderRadius: '2px', transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: '11px', color: theme.steel, marginTop: '4px' }}>{prog.done}/{prog.total} steps</div>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!activeSOP ? (
          <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '64px', textAlign: 'center', color: theme.steel, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
            <Icon.FileText />
            <p style={{ fontSize: '14px' }}>Select an SOP to view and run it.</p>
          </div>
        ) : (
          <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: theme.nero, margin: 0 }}>{activeSOP.title}</h2>
                  <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '3px', background: `${categoryColor[activeSOP.category] || theme.steel}18`, color: categoryColor[activeSOP.category] || theme.steel }}>{activeSOP.category}</span>
                </div>
                <div style={{ fontSize: '12px', color: theme.steel }}>Last updated: {activeSOP.lastUpdated}</div>
              </div>
              <button onClick={() => resetChecklist(activeSOP.id, activeSOP.steps)} style={{ padding: '8px 16px', background: theme.smoke, border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '13px', color: theme.graphite, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button>
            </div>

            {(() => {
              const prog = getProgress(activeSOP.id, activeSOP.steps);
              return (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: theme.graphite }}>Progress</span>
                    <span style={{ fontFamily: '"IBM Plex Mono", monospace', color: prog.pct === 100 ? theme.success : theme.nero, fontWeight: '600' }}>{prog.pct}%</span>
                  </div>
                  <div style={{ height: '8px', background: theme.fog, borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${prog.pct}%`, background: prog.pct === 100 ? theme.success : theme.burgundy, borderRadius: '4px', transition: 'width 0.3s' }} />
                  </div>
                </div>
              );
            })()}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {activeSOP.steps.map((step, idx) => {
                const done = checklist[`${activeSOP.id}-${step.id}`];
                return (
                  <div key={step.id} onClick={() => toggleStep(activeSOP.id, step.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '4px', background: done ? `${theme.success}10` : 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => { if (!done) e.currentTarget.style.background = theme.smoke; }}
                    onMouseLeave={e => { e.currentTarget.style.background = done ? `${theme.success}10` : 'transparent'; }}
                  >
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? theme.success : theme.white, border: `2px solid ${done ? theme.success : theme.fog}`, transition: 'all 0.15s' }}>
                      {done && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
                      <span style={{ fontSize: '12px', color: theme.steel, fontFamily: '"IBM Plex Mono", monospace', minWidth: '20px' }}>{String(idx + 1).padStart(2, '0')}</span>
                      <span style={{ fontSize: '14px', color: done ? theme.steel : theme.nero, textDecoration: done ? 'line-through' : 'none', lineHeight: '1.4' }}>{step.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {getProgress(activeSOP.id, activeSOP.steps).pct === 100 && (
              <div style={{ marginTop: '20px', padding: '16px', background: `${theme.success}12`, border: `1px solid ${theme.success}30`, borderRadius: '4px', textAlign: 'center', fontSize: '14px', color: theme.success, fontWeight: '600' }}>
                All steps completed. SOP run is complete.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
