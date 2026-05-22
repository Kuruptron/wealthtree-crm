import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/shared/Icons';
import Modal from '../../components/shared/Modal';
import { clients, interactions as allInteractions } from '../../data/mockData';

const Tab = ({ label, active, onClick, theme }) => (
  <button onClick={onClick} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${active ? theme.burgundy : 'transparent'}`, color: active ? theme.burgundy : theme.steel, fontSize: '14px', fontWeight: active ? '600' : '400', cursor: 'pointer', fontFamily: 'inherit' }}>{label}</button>
);

export default function ClientProfile() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const client = clients.find(c => c.id === parseInt(id));
  const [activeTab, setActiveTab] = useState('overview');
  const [interactions, setInteractions] = useState(allInteractions.filter(i => i.clientId === parseInt(id)));
  const [showLog, setShowLog] = useState(false);
  const [logForm, setLogForm] = useState({ type: 'Meeting', date: new Date().toISOString().split('T')[0], summary: '', tags: '' });

  const inputStyle = { width: '100%', padding: '9px 12px', border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: theme.smoke, color: theme.nero, boxSizing: 'border-box' };
  const Label = ({ children }) => <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{children}</label>;

  if (!client) return (
    <div style={{ padding: '48px', textAlign: 'center', color: theme.steel }}>
      Client not found. <button onClick={() => navigate('/clients')} style={{ background: 'none', border: 'none', color: theme.burgundy, cursor: 'pointer', fontFamily: 'inherit' }}>Go back</button>
    </div>
  );

  const handleLogInteraction = () => {
    setInteractions(prev => [{ id: Date.now(), clientId: client.id, clientName: client.name, type: logForm.type, date: logForm.date, summary: logForm.summary, tags: logForm.tags.split(',').map(t => t.trim()).filter(Boolean), loggedBy: 'Sachin' }, ...prev]);
    setShowLog(false);
    setLogForm({ type: 'Meeting', date: new Date().toISOString().split('T')[0], summary: '', tags: '' });
  };

  const typeColor = { Meeting: theme.burgundy, Call: theme.info, Email: theme.success, 'AMC Meeting': theme.orange };

  return (
    <div>
      <button onClick={() => navigate('/clients')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: theme.steel, cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', marginBottom: '20px' }}>
        <Icon.ArrowLeft /> Back to Clients
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', background: theme.burgundy, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: '600' }}>{client.name.charAt(0)}</div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '600', color: theme.nero, marginBottom: '4px' }}>{client.name}</h1>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: theme.steel }}>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{client.pan}</span>
              <span>{client.city}</span>
              <span style={{ padding: '1px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '3px', background: client.status === 'Active' ? `${theme.success}20` : `${theme.warning}20`, color: client.status === 'Active' ? theme.success : theme.warning }}>{client.status}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setShowLog(true)} style={{ padding: '9px 16px', background: theme.burgundy, border: 'none', borderRadius: '4px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
          <Icon.Plus /> Log Interaction
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[{ label: 'AUM', value: formatCurrency(client.aum) }, { label: 'Monthly SIP', value: formatCurrency(client.sip) }, { label: 'Returns (XIRR)', value: `${client.returns}%`, color: client.returns >= 0 ? theme.success : theme.error }, { label: 'Folios', value: client.folios }].map(s => (
          <div key={s.label} style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: '600', color: s.color || theme.nero, fontFamily: '"IBM Plex Mono", monospace' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ borderBottom: `1px solid ${theme.fog}`, marginBottom: '24px' }}>
        {['overview', 'interactions', 'portfolio'].map(t => <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={activeTab === t} onClick={() => setActiveTab(t)} theme={theme} />)}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.nero, marginBottom: '16px' }}>Personal Details</h3>
            {[{ label: 'Email', value: client.email, icon: Icon.Mail }, { label: 'Phone', value: client.phone, icon: Icon.Phone }, { label: 'Date of Birth', value: client.dob, icon: Icon.Calendar }, { label: 'City', value: client.city, icon: Icon.Globe }, { label: 'Family Group', value: client.family, icon: Icon.Users }].map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ color: theme.steel, flexShrink: 0 }}><f.icon /></div>
                <div>
                  <div style={{ fontSize: '11px', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</div>
                  <div style={{ fontSize: '14px', color: theme.nero }}>{f.value || '—'}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.nero, marginBottom: '16px' }}>Investment Profile</h3>
            {[{ label: 'Risk Profile', value: client.riskProfile }, { label: 'Last Contact', value: client.lastContact }, { label: 'Active Folios', value: client.folios }, { label: 'Interactions', value: interactions.length }].map(f => (
              <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${theme.fog}` }}>
                <span style={{ fontSize: '13px', color: theme.steel }}>{f.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: theme.nero }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'interactions' && (
        <div>
          {interactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: theme.steel, background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px' }}>
              No interactions logged yet. <button onClick={() => setShowLog(true)} style={{ background: 'none', border: 'none', color: theme.burgundy, cursor: 'pointer', fontFamily: 'inherit' }}>Log the first one →</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {interactions.map(i => (
                <div key={i.id} style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ padding: '3px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '3px', background: `${typeColor[i.type] || theme.graphite}20`, color: typeColor[i.type] || theme.graphite }}>{i.type}</span>
                      <span style={{ fontSize: '12px', color: theme.steel, fontFamily: '"IBM Plex Mono", monospace' }}>{i.date}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: theme.steel }}>by {i.loggedBy}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: theme.nero, lineHeight: '1.6', margin: 0, marginBottom: i.tags.length ? '10px' : 0 }}>{i.summary}</p>
                  {i.tags.length > 0 && <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>{i.tags.map(t => <span key={t} style={{ padding: '2px 8px', background: theme.smoke, borderRadius: '3px', fontSize: '11px', color: theme.steel }}>#{t}</span>)}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '48px', textAlign: 'center', color: theme.steel }}>
          <Icon.Briefcase />
          <p style={{ marginTop: '12px', fontSize: '14px' }}>Portfolio data will sync from CAMS + KFintech once APIs are connected.</p>
          <p style={{ fontSize: '13px', color: theme.steel }}>PAN: <span style={{ fontFamily: '"IBM Plex Mono", monospace', color: theme.nero }}>{client.pan}</span></p>
        </div>
      )}

      {showLog && (
        <Modal title="Log Interaction" onClose={() => setShowLog(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><Label>Type</Label><select value={logForm.type} onChange={e => setLogForm(p => ({ ...p, type: e.target.value }))} style={inputStyle}><option>Meeting</option><option>Call</option><option>Email</option><option>AMC Meeting</option></select></div>
              <div><Label>Date</Label><input type="date" value={logForm.date} onChange={e => setLogForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} /></div>
            </div>
            <div><Label>Notes</Label><textarea value={logForm.summary} onChange={e => setLogForm(p => ({ ...p, summary: e.target.value }))} rows={5} placeholder="What was discussed? Any action items?" style={{ ...inputStyle, resize: 'vertical' }} /></div>
            <div><Label>Tags (comma separated)</Label><input value={logForm.tags} onChange={e => setLogForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. review, sip, rebalancing" style={inputStyle} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button onClick={() => setShowLog(false)} style={{ padding: '9px 20px', background: theme.smoke, border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: theme.nero }}>Cancel</button>
            <button onClick={handleLogInteraction} disabled={!logForm.summary} style={{ padding: '9px 20px', background: theme.burgundy, border: 'none', borderRadius: '4px', color: '#fff', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', opacity: !logForm.summary ? 0.5 : 1 }}>Save Interaction</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
