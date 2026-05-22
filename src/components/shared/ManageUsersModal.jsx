import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth, USERS } from '../../context/AuthContext';
import Modal from './Modal';

const REQS = [
  { label: '8+ chars', test: p => p.length >= 8 },
  { label: 'A–Z',      test: p => /[A-Z]/.test(p) },
  { label: 'a–z',      test: p => /[a-z]/.test(p) },
  { label: '0–9',      test: p => /\d/.test(p) },
  { label: '!@#…',     test: p => /[^A-Za-z0-9]/.test(p) },
];

const empColor = (theme, role) => role === 'admin' ? theme.burgundy : theme.info;

export default function ManageUsersModal({ onClose }) {
  const theme = useTheme();
  const { adminResetPassword } = useAuth();

  // Per-user state: null = collapsed, otherwise { pwd, confirm, loading, error, done }
  const [expanded, setExpanded] = useState(null);
  const [forms, setForms] = useState({});

  const toggle = (uname) => {
    setExpanded(e => e === uname ? null : uname);
    setForms(f => ({ ...f, [uname]: { pwd: '', confirm: '', loading: false, error: '', done: false } }));
  };

  const update = (uname, patch) => setForms(f => ({ ...f, [uname]: { ...f[uname], ...patch } }));

  const handleReset = async (uname) => {
    const { pwd, confirm } = forms[uname];
    const metReqs = REQS.map(r => r.test(pwd));
    if (metReqs.filter(Boolean).length < 5) { update(uname, { error: 'Password does not meet all requirements' }); return; }
    if (pwd !== confirm) { update(uname, { error: 'Passwords do not match' }); return; }
    update(uname, { loading: true, error: '' });
    const result = await adminResetPassword(uname, pwd);
    if (!result.ok) { update(uname, { loading: false, error: result.error }); return; }
    update(uname, { loading: false, done: true });
  };

  const inputStyle = (theme) => ({
    width: '100%', padding: '9px 12px',
    border: `1px solid ${theme.fog}`, borderRadius: '6px',
    fontSize: '13px', fontFamily: 'inherit',
    background: theme.smoke, color: theme.nero,
    outline: 'none', boxSizing: 'border-box',
  });

  return (
    <Modal title="Manage Users" onClose={onClose} width="500px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {USERS.map(u => {
          const isOpen = expanded === u.username;
          const form   = forms[u.username] || {};
          const metReqs = REQS.map(r => r.test(form.pwd || ''));
          const score   = metReqs.filter(Boolean).length;
          const barColor = score < 2 ? theme.error : score < 4 ? theme.warning : theme.success;
          const isValid = score === 5 && form.pwd === form.confirm;

          return (
            <div key={u.username} style={{ border: `1px solid ${isOpen ? theme.burgundy + '60' : theme.fog}`, borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.15s' }}>
              {/* User row */}
              <div
                onClick={() => toggle(u.username)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer', background: isOpen ? `${theme.burgundy}08` : theme.white }}
                onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = theme.smoke; }}
                onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = theme.white; }}
              >
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: empColor(theme, u.role), color: '#fff', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{u.initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.nero }}>{u.name}</div>
                  <div style={{ fontSize: '12px', color: theme.steel }}>@{u.username}</div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: `${empColor(theme, u.role)}18`, color: empColor(theme, u.role), textTransform: 'uppercase', letterSpacing: '0.3px' }}>{u.role}</span>
                <span style={{ fontSize: '18px', color: theme.steel, lineHeight: 1, marginLeft: '4px', transition: 'transform 0.2s', transform: isOpen ? 'rotate(45deg)' : 'none' }}>+</span>
              </div>

              {/* Expand: reset password form */}
              {isOpen && (
                <div style={{ padding: '16px', borderTop: `1px solid ${theme.fog}`, background: theme.smoke }}>
                  {form.done ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.success, fontSize: '13px', fontWeight: '500' }}>
                      <span style={{ fontSize: '16px' }}>✓</span> Password reset for {u.name}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>Reset Password for {u.name}</div>

                      <input
                        type="password"
                        placeholder="New password"
                        value={form.pwd || ''}
                        onChange={e => update(u.username, { pwd: e.target.value, error: '' })}
                        style={inputStyle(theme)}
                        onFocus={e => e.target.style.borderColor = theme.burgundy}
                        onBlur={e => e.target.style.borderColor = theme.fog}
                      />

                      {form.pwd ? (
                        <>
                          <div style={{ height: '3px', background: theme.fog, borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(score / 5) * 100}%`, background: barColor, borderRadius: '2px', transition: 'width 0.2s, background 0.2s' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {REQS.map((r, i) => (
                              <span key={i} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', fontWeight: '500', background: metReqs[i] ? `${theme.success}20` : theme.white, color: metReqs[i] ? theme.success : theme.steel, border: `1px solid ${metReqs[i] ? theme.success + '40' : theme.fog}` }}>
                                {metReqs[i] ? '✓ ' : ''}{r.label}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : null}

                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={form.confirm || ''}
                        onChange={e => update(u.username, { confirm: e.target.value, error: '' })}
                        style={{ ...inputStyle(theme), borderColor: form.confirm && form.pwd !== form.confirm ? theme.error : theme.fog }}
                        onFocus={e => e.target.style.borderColor = theme.burgundy}
                        onBlur={e => e.target.style.borderColor = form.confirm && form.pwd !== form.confirm ? theme.error : theme.fog}
                      />

                      {form.error && (
                        <div style={{ fontSize: '12px', color: theme.error, background: `${theme.error}12`, borderRadius: '5px', padding: '8px 12px' }}>{form.error}</div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => toggle(u.username)} style={{ padding: '8px 16px', background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '5px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: theme.nero }}>Cancel</button>
                        <button onClick={() => handleReset(u.username)} disabled={!isValid || form.loading}
                          style={{ padding: '8px 16px', background: theme.burgundy, border: 'none', borderRadius: '5px', color: '#fff', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit', cursor: isValid && !form.loading ? 'pointer' : 'not-allowed', opacity: isValid && !form.loading ? 1 : 0.5 }}>
                          {form.loading ? 'Saving…' : 'Reset Password'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
