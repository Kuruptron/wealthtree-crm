import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Icon } from '../components/shared/Icons';
import StatCard from '../components/shared/StatCard';
import DataTable from '../components/shared/DataTable';
import LiveMarketTicker from '../components/shared/LiveMarketTicker';
import { clients, tasks } from '../data/mockData';

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const totalAUM = clients.reduce((s, c) => s + c.aum, 0);
  const totalSIP = clients.reduce((s, c) => s + c.sip, 0);
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

  const clientColumns = [
    { header: 'Client', key: 'name' },
    { header: 'City', key: 'city' },
    { header: 'AUM', key: 'aum', mono: true, render: r => formatCurrency(r.aum) },
    { header: 'Returns', key: 'returns', mono: true, render: r => <span style={{ color: r.returns >= 0 ? theme.success : theme.error }}>{r.returns >= 0 ? '+' : ''}{r.returns}%</span> },
    { header: 'Status', key: 'status', render: r => <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '3px', background: r.status === 'Active' ? `${theme.success}20` : `${theme.warning}20`, color: r.status === 'Active' ? theme.success : theme.warning }}>{r.status}</span> },
    { header: 'Last Contact', key: 'lastContact', mono: true },
  ];

  const taskColumns = [
    { header: 'Task', key: 'title' },
    { header: 'Client', key: 'client' },
    { header: 'Priority', key: 'priority', render: r => <span style={{ color: r.priority === 'High' ? theme.error : r.priority === 'Medium' ? theme.warning : theme.steel, fontWeight: '500' }}>{r.priority}</span> },
    { header: 'Due', key: 'due', mono: true },
    { header: 'Status', key: 'status', render: r => <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: '600', borderRadius: '3px', background: r.status === 'Pending' ? `${theme.error}18` : r.status === 'In Progress' ? `${theme.info}18` : `${theme.success}18`, color: r.status === 'Pending' ? theme.error : r.status === 'In Progress' ? theme.info : theme.success }}>{r.status}</span> },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: theme.nero, marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: theme.steel }}>WealthTree • Overview</p>
      </div>

      <LiveMarketTicker />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Total AUM" value={formatCurrency(totalAUM)} change={8.3} icon={Icon.Chart} />
        <StatCard label="Total Clients" value={clients.length} sub={`${activeClients} active`} icon={Icon.Users} />
        <StatCard label="Monthly SIP Book" value={formatCurrency(totalSIP)} icon={Icon.TrendUp} />
        <StatCard label="Pending Tasks" value={pendingTasks} icon={Icon.Task} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.nero, marginBottom: '16px' }}>AUM by Risk Profile</h3>
          {['Conservative', 'Moderate', 'Aggressive'].map(rp => {
            const rpAUM = clients.filter(c => c.riskProfile === rp).reduce((s, c) => s + c.aum, 0);
            const pct = ((rpAUM / totalAUM) * 100).toFixed(1);
            return (
              <div key={rp} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: theme.graphite }}>{rp}</span>
                  <span style={{ fontSize: '13px', fontFamily: '"IBM Plex Mono", monospace', color: theme.nero }}>{formatCurrency(rpAUM)} <span style={{ color: theme.steel }}>({pct}%)</span></span>
                </div>
                <div style={{ height: '6px', background: theme.fog, borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: theme.burgundy, borderRadius: '3px' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.nero, marginBottom: '16px' }}>Recent Activity</h3>
          {[
            { text: 'Quarterly review with Rajesh Kumar', time: 'Today', icon: Icon.Users },
            { text: 'New introspection log — Tariff shock', time: 'Yesterday', icon: Icon.Brain },
            { text: 'Added research: RBI MPC April 2026', time: '2 days ago', icon: Icon.Book },
            { text: 'SIP setup completed for Vikram Singh', time: '3 days ago', icon: Icon.TrendUp },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < 3 ? '14px' : 0, paddingBottom: i < 3 ? '14px' : 0, borderBottom: i < 3 ? `1px solid ${theme.fog}` : 'none' }}>
              <div style={{ color: theme.steel, marginTop: '1px', flexShrink: 0 }}><item.icon /></div>
              <div>
                <div style={{ fontSize: '13px', color: theme.nero }}>{item.text}</div>
                <div style={{ fontSize: '12px', color: theme.steel, marginTop: '2px' }}>{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: theme.nero }}>Client Portfolio</h2>
          <button onClick={() => navigate('/clients')} style={{ background: 'none', border: 'none', fontSize: '13px', color: theme.burgundy, cursor: 'pointer', fontFamily: 'inherit' }}>View all →</button>
        </div>
        <DataTable columns={clientColumns} data={clients} onRowClick={r => navigate(`/clients/${r.id}`)} />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: theme.nero }}>Pending Tasks</h2>
          <button onClick={() => navigate('/tasks')} style={{ background: 'none', border: 'none', fontSize: '13px', color: theme.burgundy, cursor: 'pointer', fontFamily: 'inherit' }}>View all →</button>
        </div>
        <DataTable columns={taskColumns} data={tasks.filter(t => t.status === 'Pending')} />
      </div>
    </div>
  );
}
