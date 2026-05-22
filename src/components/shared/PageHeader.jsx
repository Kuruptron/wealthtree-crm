import { useTheme } from '../../context/ThemeContext';
import { Icon } from './Icons';

export default function PageHeader({ title, subtitle, action }) {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: theme.nero, marginBottom: '4px' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '14px', color: theme.steel }}>{subtitle}</p>}
      </div>
      {action && (
        <button onClick={action.onClick} style={{ padding: '9px 16px', background: theme.burgundy, border: 'none', borderRadius: '4px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
          <Icon.Plus />{action.label}
        </button>
      )}
    </div>
  );
}
