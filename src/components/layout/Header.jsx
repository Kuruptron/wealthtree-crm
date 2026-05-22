import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, useToggleTheme, useIsDark } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../shared/Icons';
import { clients, interactions, knowledgeEntries } from '../../data/mockData';
import ChangePasswordModal from '../shared/ChangePasswordModal';
import ManageUsersModal from '../shared/ManageUsersModal';

export default function Header() {
  const theme = useTheme();
  const toggleTheme = useToggleTheme();
  const isDark = useIsDark();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [showManageUsers, setShowManageUsers] = useState(false);

  const results = search.length > 1 ? [
    ...clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.pan.toLowerCase().includes(search.toLowerCase())).slice(0, 3).map(c => ({ type: 'Client', label: c.name, sub: c.pan, path: `/clients/${c.id}` })),
    ...interactions.filter(i => i.summary.toLowerCase().includes(search.toLowerCase())).slice(0, 2).map(i => ({ type: 'Interaction', label: i.clientName, sub: i.summary.substring(0, 50) + '...', path: `/clients/${i.clientId}` })),
    ...knowledgeEntries.filter(e => e.title.toLowerCase().includes(search.toLowerCase())).slice(0, 2).map(e => ({ type: 'Knowledge', label: e.title, sub: e.type, path: '/knowledge' })),
  ] : [];

  const typeColor = { Client: theme.burgundy, Interaction: theme.info, Knowledge: theme.success };

  const menuItemStyle = {
    width: '100%', padding: '10px 16px', background: 'none', border: 'none',
    display: 'flex', alignItems: 'center', gap: '10px',
    fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
    textAlign: 'left', color: theme.nero,
  };

  return (
    <>
      <div style={{ height: '60px', background: theme.white, borderBottom: `1px solid ${theme.fog}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: '16px', flexShrink: 0, position: 'relative', zIndex: 100 }}>
        {/* Search */}
        <div style={{ flex: 1, maxWidth: '480px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.steel }}><Icon.Search /></div>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="Search clients, interactions, knowledge..."
            style={{ width: '100%', padding: '8px 12px 8px 40px', border: `1px solid ${theme.fog}`, borderRadius: '4px', fontSize: '13px', background: theme.smoke, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: theme.nero }}
          />
          {showResults && results.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', marginTop: '4px', zIndex: 200, overflow: 'hidden' }}>
              {results.map((r, i) => (
                <div key={i} onClick={() => { navigate(r.path); setSearch(''); setShowResults(false); }}
                  style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', borderBottom: i < results.length - 1 ? `1px solid ${theme.fog}` : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.smoke}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '10px', fontWeight: '700', color: typeColor[r.type], background: `${typeColor[r.type]}20`, padding: '2px 6px', borderRadius: '3px', flexShrink: 0 }}>{r.type}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: theme.nero }}>{r.label}</div>
                    <div style={{ fontSize: '11px', color: theme.steel }}>{r.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
          {/* Dark mode toggle */}
          <button onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ width: '34px', height: '34px', background: theme.smoke, border: `1px solid ${theme.fog}`, borderRadius: '4px', color: theme.nero, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = theme.fog}
            onMouseLeave={e => e.currentTarget.style.background = theme.smoke}
          >
            {isDark ? <Icon.Sun /> : <Icon.Moon />}
          </button>

          <button style={{ width: '34px', height: '34px', background: theme.smoke, border: 'none', borderRadius: '4px', color: theme.steel, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Icon.Bell />
            <div style={{ position: 'absolute', top: '7px', right: '7px', width: '5px', height: '5px', borderRadius: '50%', background: theme.error }} />
          </button>

          {/* User avatar + dropdown */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowUserMenu(m => !m)}
              tabIndex={0}
              onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px 4px 4px', borderRadius: '20px', background: showUserMenu ? theme.smoke : 'transparent', border: `1px solid ${showUserMenu ? theme.fog : 'transparent'}`, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = theme.smoke; e.currentTarget.style.borderColor = theme.fog; }}
              onMouseLeave={e => { if (!showUserMenu) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
            >
              <div style={{ width: '30px', height: '30px', background: theme.burgundy, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
                {user?.initials || '?'}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '500', color: theme.nero, whiteSpace: 'nowrap' }}>{user?.name}</span>
              {isAdmin && (
                <span style={{ fontSize: '9px', fontWeight: '700', background: `${theme.burgundy}20`, color: theme.burgundy, padding: '2px 6px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Admin</span>
              )}
            </div>

            {showUserMenu && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden', minWidth: '210px', zIndex: 300 }}>
                {/* User info header */}
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.fog}` }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: theme.nero }}>{user?.name}</div>
                  <div style={{ fontSize: '11px', color: theme.steel, marginTop: '2px', textTransform: 'capitalize' }}>{user?.role} · @{user?.username}</div>
                </div>

                {/* Change Password */}
                <button
                  onClick={() => { setShowUserMenu(false); setShowChangePwd(true); }}
                  style={menuItemStyle}
                  onMouseEnter={e => e.currentTarget.style.background = theme.smoke}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="13.5" r="1.5" fill="currentColor"/></svg>
                  Change Password
                </button>

                {/* Manage Users — admin only */}
                {isAdmin && (
                  <button
                    onClick={() => { setShowUserMenu(false); setShowManageUsers(true); }}
                    style={menuItemStyle}
                    onMouseEnter={e => e.currentTarget.style.background = theme.smoke}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Icon.Users />
                    Manage Users
                  </button>
                )}

                <div style={{ borderTop: `1px solid ${theme.fog}`, marginTop: '2px' }} />

                {/* Sign out */}
                <button
                  onClick={logout}
                  style={{ ...menuItemStyle, color: theme.error }}
                  onMouseEnter={e => e.currentTarget.style.background = `${theme.error}10`}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Icon.LogOut />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showChangePwd  && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}
      {showManageUsers && <ManageUsersModal   onClose={() => setShowManageUsers(false)} />}
    </>
  );
}
