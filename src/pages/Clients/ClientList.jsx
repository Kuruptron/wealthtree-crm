import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/shared/Icons';
import DataTable from '../../components/shared/DataTable';
import PageHeader from '../../components/shared/PageHeader';
import Modal from '../../components/shared/Modal';
import { clients as initialClients } from '../../data/mockData';

export default function ClientList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', pan: '', email: '', phone: '', city: '', riskProfile: 'Moderate', status: 'Active' });

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.pan.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const inputStyle = { width: '100%', padding: '9px 12px', border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: theme.smoke, color: theme.nero };
  const selectStyle = { ...inputStyle };

  const columns = [
    { header: 'Client', key: 'name', render: r => (
      <div>
        <div style={{ fontWeight: '500', color: theme.nero }}>{r.name}</div>
        <div style={{ fontSize: '12px', color: theme.steel, fontFamily: '"IBM Plex Mono", monospace' }}>{r.pan}</div>
      </div>
    )},
    { header: 'Contact', key: 'email', render: r => (
      <div>
        <div style={{ fontSize: '13px', color: theme.graphite }}>{r.email}</div>
        <div style={{ fontSize: '12px', color: theme.steel }}>{r.phone}</div>
      </div>
    )},
    { header: 'City', key: 'city' },
    { header: 'AUM', key: 'aum', mono: true, render: r => formatCurrency(r.aum) },
    { header: 'Monthly SIP', key: 'sip', mono: true, render: r => formatCurrency(r.sip) },
    { header: 'Returns', key: 'returns', mono: true, render: r => <span style={{ color: r.returns >= 0 ? theme.success : theme.error }}>{r.returns >= 0 ? '+' : ''}{r.returns}%</span> },
    { header: 'Risk', key: 'riskProfile', render: r => <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '3px', background: r.riskProfile === 'Aggressive' ? `${theme.error}18` : r.riskProfile === 'Moderate' ? `${theme.warning}18` : `${theme.info}18`, color: r.riskProfile === 'Aggressive' ? theme.error : r.riskProfile === 'Moderate' ? theme.warning : theme.info }}>{r.riskProfile}</span> },
    { header: 'Status', key: 'status', render: r => <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '3px', background: r.status === 'Active' ? `${theme.success}20` : `${theme.warning}20`, color: r.status === 'Active' ? theme.success : theme.warning }}>{r.status}</span> },
  ];

  const handleAdd = () => {
    const newClient = { ...form, id: clients.length + 1, aum: 0, returns: 0, sip: 0, folios: 0, lastContact: new Date().toISOString().split('T')[0], dob: '', family: `${form.name.split(' ')[1] || form.name} Family` };
    setClients(prev => [...prev, newClient]);
    setShowAdd(false);
    setForm({ name: '', pan: '', email: '', phone: '', city: '', riskProfile: 'Moderate', status: 'Active' });
  };

  const Label = ({ children }) => <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{children}</label>;

  return (
    <div>
      <PageHeader title="Clients" subtitle={`${clients.length} clients · ${formatCurrency(clients.reduce((s, c) => s + c.aum, 0))} total AUM`} action={{ label: 'Add Client', onClick: () => setShowAdd(true) }} />

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.steel }}><Icon.Search /></div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, PAN, email..." style={{ ...inputStyle, paddingLeft: '40px' }} />
        </div>
        {['All', 'Active', 'Review'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '9px 16px', fontSize: '13px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', background: filterStatus === s ? theme.burgundy : theme.white, color: filterStatus === s ? '#fff' : theme.graphite, border: `1px solid ${filterStatus === s ? theme.burgundy : theme.fog}` }}>{s}</button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} onRowClick={r => navigate(`/clients/${r.id}`)} emptyMessage="No clients match your search" />

      {showAdd && (
        <Modal title="Add New Client" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[{ label: 'Full Name', key: 'name', type: 'text', full: true }, { label: 'PAN', key: 'pan', type: 'text' }, { label: 'Email', key: 'email', type: 'email' }, { label: 'Phone', key: 'phone', type: 'tel' }, { label: 'City', key: 'city', type: 'text' }].map(f => (
              <div key={f.key} style={{ gridColumn: f.full ? '1 / -1' : 'auto' }}>
                <Label>{f.label}</Label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
              </div>
            ))}
            <div><Label>Risk Profile</Label><select value={form.riskProfile} onChange={e => setForm(p => ({ ...p, riskProfile: e.target.value }))} style={selectStyle}><option>Conservative</option><option>Moderate</option><option>Aggressive</option></select></div>
            <div><Label>Status</Label><select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={selectStyle}><option>Active</option><option>Review</option><option>Inactive</option></select></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: '9px 20px', background: theme.smoke, border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: theme.nero }}>Cancel</button>
            <button onClick={handleAdd} disabled={!form.name || !form.pan} style={{ padding: '9px 20px', background: theme.burgundy, border: 'none', borderRadius: '4px', color: '#fff', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', opacity: !form.name || !form.pan ? 0.5 : 1 }}>Add Client</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
