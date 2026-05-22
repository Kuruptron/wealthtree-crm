import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Modal from './Modal';

const REQS = [
  { label: '8+ chars',  test: p => p.length >= 8 },
  { label: 'A–Z',       test: p => /[A-Z]/.test(p) },
  { label: 'a–z',       test: p => /[a-z]/.test(p) },
  { label: '0–9',       test: p => /\d/.test(p) },
  { label: '!@#…',      test: p => /[^A-Za-z0-9]/.test(p) },
];

function strengthColor(score, theme) {
  if (score < 2) return theme.error;
  if (score < 4) return theme.warning;
  return theme.success;
}
function strengthLabel(score) {
  if (score < 2) return 'Weak';
  if (score < 4) return 'Fair';
  return 'Strong';
}

export default function ChangePasswordModal({ onClose }) {
  const theme = useTheme();
  const { user, changePassword } = useAuth();
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  const metReqs = REQS.map(r => r.test(next));
  const score   = metReqs.filter(Boolean).length;
  const color   = strengthColor(score, theme);
  const isValid = score === 5 && next === confirm && current.length > 0;

  const handleSubmit = async e => {
    e.preventDefault();
    if (next !== confirm) { setError('New passwords do not match'); return; }
    if (score < 5) { setError('Password does not meet all requirements'); return; }
    setError(''); setLoading(true);
    const result = await changePassword(user.username, current, next);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    setDone(true);
  };

  const inputStyle = {
    width: '100%', padding: '10px 13px',
    border: `1px solid ${theme.fog}`, borderRadius: '6px',
    fontSize: '14px', fontFamily: 'inherit',
    background: theme.smoke, color: theme.nero,
    outline: 'none', boxSizing: 'border-box',
  };
  const Label = ({ children }) => (
    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
      {children}
    </label>
  );

  return (
    <Modal title="Change Password" onClose={onClose} width="440px">
      {done ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>✓</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: theme.nero, marginBottom: '6px' }}>Password updated</div>
          <div style={{ fontSize: '13px', color: theme.steel, marginBottom: '24px' }}>Your new password is active.</div>
          <button onClick={onClose} style={{ padding: '10px 28px', background: theme.burgundy, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit', cursor: 'pointer' }}>Done</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Label>Current Password</Label>
            <input type="password" value={current} onChange={e => { setCurrent(e.target.value); setError(''); }}
              style={{ ...inputStyle, borderColor: error.includes('Current') ? theme.error : theme.fog }}
              onFocus={e => e.target.style.borderColor = theme.burgundy}
              onBlur={e => e.target.style.borderColor = error.includes('Current') ? theme.error : theme.fog}
              autoFocus />
          </div>

          <div>
            <Label>New Password</Label>
            <input type="password" value={next} onChange={e => { setNext(e.target.value); setError(''); }}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = theme.burgundy}
              onBlur={e => e.target.style.borderColor = theme.fog} />

            {next && (
              <>
                {/* Strength bar */}
                <div style={{ marginTop: '8px', height: '4px', background: theme.fog, borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(score / 5) * 100}%`, background: color, borderRadius: '2px', transition: 'width 0.2s, background 0.2s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color }}>{strengthLabel(score)}</span>
                  <span style={{ fontSize: '11px', color: theme.steel }}>{score}/5</span>
                </div>
                {/* Requirements */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {REQS.map((r, i) => (
                    <span key={i} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: '500', background: metReqs[i] ? `${theme.success}20` : theme.smoke, color: metReqs[i] ? theme.success : theme.steel, border: `1px solid ${metReqs[i] ? theme.success + '40' : theme.fog}`, transition: 'all 0.15s' }}>
                      {metReqs[i] ? '✓ ' : ''}{r.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            <Label>Confirm New Password</Label>
            <input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }}
              style={{ ...inputStyle, borderColor: confirm && next !== confirm ? theme.error : theme.fog }}
              onFocus={e => e.target.style.borderColor = theme.burgundy}
              onBlur={e => e.target.style.borderColor = confirm && next !== confirm ? theme.error : theme.fog} />
            {confirm && next !== confirm && (
              <div style={{ fontSize: '12px', color: theme.error, marginTop: '4px' }}>Passwords do not match</div>
            )}
          </div>

          {error && (
            <div style={{ fontSize: '13px', color: theme.error, background: `${theme.error}12`, border: `1px solid ${theme.error}30`, borderRadius: '6px', padding: '10px 14px' }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: theme.smoke, border: `1px solid ${theme.fog}`, borderRadius: '6px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: theme.nero }}>Cancel</button>
            <button type="submit" disabled={!isValid || loading}
              style={{ padding: '10px 24px', background: theme.burgundy, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit', cursor: isValid && !loading ? 'pointer' : 'not-allowed', opacity: isValid && !loading ? 1 : 0.5 }}>
              {loading ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
