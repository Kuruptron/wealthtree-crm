import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/shared/Icons';
import PageHeader from '../../components/shared/PageHeader';
import Modal from '../../components/shared/Modal';
import { tasks as initialTasks, clients } from '../../data/mockData';

export default function Tasks() {
  const theme = useTheme();
  const navigate = useNavigate();
  const priorityColor = { High: theme.error, Medium: theme.warning, Low: theme.steel };
  const statusColor = { Pending: theme.error, 'In Progress': theme.info, Scheduled: theme.warning, Done: theme.success };

  const [tasks, setTasks] = useState(initialTasks);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', clientId: '', priority: 'Medium', due: '', type: 'Advisory', status: 'Pending' });

  const filtered = tasks.filter(t => (filterStatus === 'All' || t.status === filterStatus) && (filterPriority === 'All' || t.priority === filterPriority));
  const markDone = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'Done' } : t));

  const handleAdd = () => {
    const client = clients.find(c => c.id === parseInt(form.clientId));
    setTasks(prev => [...prev, { id: Date.now(), ...form, clientId: parseInt(form.clientId), client: client?.name || 'N/A' }]);
    setShowAdd(false);
    setForm({ title: '', clientId: '', priority: 'Medium', due: '', type: 'Advisory', status: 'Pending' });
  };

  const grouped = { Pending: filtered.filter(t => t.status === 'Pending'), 'In Progress': filtered.filter(t => t.status === 'In Progress'), Scheduled: filtered.filter(t => t.status === 'Scheduled'), Done: filtered.filter(t => t.status === 'Done') };
  const inputStyle = { width: '100%', padding: '9px 12px', border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: theme.smoke, color: theme.nero };
  const Label = ({ children }) => <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{children}</label>;

  const TaskGroup = ({ tasks: tlist }) => {
    if (!tlist.length) return <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '32px', textAlign: 'center', color: theme.steel, fontSize: '14px' }}>No tasks.</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tlist.map(t => (
          <div key={t.id} style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', opacity: t.status === 'Done' ? 0.6 : 1 }}>
            <button onClick={() => markDone(t.id)} style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, background: t.status === 'Done' ? theme.success : theme.white, border: `2px solid ${t.status === 'Done' ? theme.success : theme.fog}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {t.status === 'Done' && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: t.status === 'Done' ? theme.steel : theme.nero, textDecoration: t.status === 'Done' ? 'line-through' : 'none', marginBottom: '3px' }}>{t.title}</div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: theme.steel }}>
                <button onClick={() => navigate(`/clients/${t.clientId}`)} style={{ background: 'none', border: 'none', color: theme.burgundy, cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', padding: 0 }}>{t.client}</button>
                <span>{t.type}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: priorityColor[t.priority], background: `${priorityColor[t.priority]}18`, padding: '2px 8px', borderRadius: '3px' }}>{t.priority}</span>
              <span style={{ fontSize: '12px', color: theme.steel, fontFamily: '"IBM Plex Mono", monospace' }}>{t.due}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Tasks" subtitle={`${tasks.filter(t => t.status !== 'Done').length} open tasks`} action={{ label: 'Add Task', onClick: () => setShowAdd(true) }} />

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'Pending', 'In Progress', 'Scheduled', 'Done'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '7px 14px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', background: filterStatus === s ? theme.burgundy : theme.white, color: filterStatus === s ? '#fff' : theme.graphite, border: `1px solid ${filterStatus === s ? theme.burgundy : theme.fog}` }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'High', 'Medium', 'Low'].map(p => (
            <button key={p} onClick={() => setFilterPriority(p)} style={{ padding: '7px 14px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', background: filterPriority === p ? (priorityColor[p] || theme.burgundy) : theme.white, color: filterPriority === p ? '#fff' : (priorityColor[p] || theme.graphite), border: `1px solid ${filterPriority === p ? (priorityColor[p] || theme.burgundy) : theme.fog}` }}>{p}</button>
          ))}
        </div>
      </div>

      {filterStatus === 'All' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(grouped).filter(([, items]) => items.length > 0).map(([status, items]) => (
            <div key={status}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: statusColor[status] || theme.steel }}>{status}</span>
                <span style={{ fontSize: '12px', background: `${statusColor[status] || theme.steel}18`, color: statusColor[status] || theme.steel, padding: '1px 8px', borderRadius: '10px', fontWeight: '600' }}>{items.length}</span>
              </div>
              <TaskGroup tasks={items} />
            </div>
          ))}
          {filtered.length === 0 && <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '48px', textAlign: 'center', color: theme.steel }}>No tasks found.</div>}
        </div>
      ) : <TaskGroup tasks={filtered} />}

      {showAdd && (
        <Modal title="Add Task" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><Label>Task</Label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="What needs to be done?" style={inputStyle} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><Label>Client</Label><select value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))} style={inputStyle}><option value="">Select client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><Label>Due Date</Label><input type="date" value={form.due} onChange={e => setForm(p => ({ ...p, due: e.target.value }))} style={inputStyle} /></div>
              <div><Label>Priority</Label><select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={inputStyle}><option>High</option><option>Medium</option><option>Low</option></select></div>
              <div><Label>Type</Label><select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inputStyle}><option>Advisory</option><option>Review</option><option>Compliance</option><option>Operations</option><option>Other</option></select></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: '9px 20px', background: theme.smoke, border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: theme.nero }}>Cancel</button>
            <button onClick={handleAdd} disabled={!form.title} style={{ padding: '9px 20px', background: theme.burgundy, border: 'none', borderRadius: '4px', color: '#fff', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', opacity: !form.title ? 0.5 : 1 }}>Add Task</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
