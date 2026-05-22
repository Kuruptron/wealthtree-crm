import { useTheme } from '../../context/ThemeContext';

export default function StatCard({ label, value, change, icon: IconComponent, sub }) {
  const theme = useTheme();
  return (
    <div style={{ background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ color: theme.steel }}>{IconComponent && <IconComponent />}</div>
        {change !== undefined && (
          <span style={{ fontSize: '13px', fontFamily: '"IBM Plex Mono", monospace', color: change >= 0 ? theme.success : theme.error }}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div style={{ fontSize: '28px', fontWeight: '600', color: theme.nero, marginBottom: '4px', fontFamily: '"IBM Plex Mono", monospace' }}>{value}</div>
      <div style={{ fontSize: '12px', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>{label}</div>
      {sub && <div style={{ fontSize: '12px', color: theme.steel, marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}
