import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../shared/Icons';

const navItems = [
  { path: '/',             label: 'Dashboard',    icon: Icon.Home     },
  { path: '/clients',      label: 'Clients',      icon: Icon.Users    },
  { path: '/interactions', label: 'Interactions', icon: Icon.Phone    },
  { path: '/tasks',        label: 'Tasks',        icon: Icon.Task     },
  { path: '/knowledge',    label: 'Knowledge Base', icon: Icon.Book   },
  { path: '/introspection',label: 'Introspection', icon: Icon.Brain   },
  { path: '/macro',        label: 'Macro',        icon: Icon.Globe    },
  { path: '/sops',         label: 'SOPs',         icon: Icon.FileText },
  { path: '/ai',           label: 'AI Assistant', icon: Icon.Bot      },
  { path: '/tracker',      label: 'Work Tracker', icon: Icon.Tracker, restricted: ['sachin', 'bindu'] },
];

export default function Sidebar({ collapsed, onToggle }) {
  const theme = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const visible = navItems.filter(item =>
    !item.restricted || item.restricted.includes(user?.username)
  );

  return (
    <div style={{ width: collapsed ? '56px' : '220px', background: theme.white, borderRight: `1px solid ${theme.fog}`, display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease', flexShrink: 0, overflow: 'hidden' }}>
      <div style={{ padding: collapsed ? '16px' : '16px 20px', borderBottom: `1px solid ${theme.fog}`, display: 'flex', alignItems: 'center', gap: '12px', minHeight: '60px' }}>
        <div style={{ width: '28px', height: '28px', background: theme.burgundy, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>W</div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: theme.nero, letterSpacing: '-0.3px' }}>WealthTree</div>
            <div style={{ fontSize: '10px', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px' }}>CRM</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {visible.map(item => {
          const active = isActive(item.path);
          return (
            <div key={item.path} onClick={() => navigate(item.path)} title={collapsed ? item.label : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', marginBottom: '2px', background: active ? `${theme.burgundy}18` : 'transparent', color: active ? theme.burgundy : theme.steel, borderRadius: '4px', fontSize: '13px', fontWeight: active ? '600' : '400', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden' }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = theme.smoke; e.currentTarget.style.color = theme.nero; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.steel; } }}
            >
              <div style={{ flexShrink: 0 }}><item.icon /></div>
              {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '12px 8px', borderTop: `1px solid ${theme.fog}` }}>
        <div onClick={onToggle}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', color: theme.steel, borderRadius: '4px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = theme.smoke; e.currentTarget.style.color = theme.nero; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.steel; }}
        >
          <Icon.Menu />
          {!collapsed && <span>Collapse</span>}
        </div>
      </div>
    </div>
  );
}
