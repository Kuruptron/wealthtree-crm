import { useState } from 'react';
import { useTheme, useToggleTheme, useIsDark } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components/shared/Icons';

export default function Login() {
  const theme = useTheme();
  const toggleTheme = useToggleTheme();
  const isDark = useIsDark();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(username.trim(), password);
    if (!ok) {
      setError('Incorrect username or password');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    border: `1px solid ${theme.fog}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    background: theme.smoke,
    color: theme.nero,
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.pageBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      padding: '20px',
      position: 'relative',
    }}>

      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{ position: 'absolute', top: '20px', right: '20px', width: '34px', height: '34px', background: theme.white, border: `1px solid ${theme.fog}`, borderRadius: '6px', color: theme.nero, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isDark ? <Icon.Sun /> : <Icon.Moon />}
      </button>

      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: theme.burgundy,
            borderRadius: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path d="M15 4L6 9.5v7c0 5.5 3.8 10 9 11 5.2-1 9-5.5 9-11v-7L15 4z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M11 15.5l3 3 5.5-5.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: theme.nero, margin: '0 0 5px' }}>WealthTree CRM</h1>
          <p style={{ fontSize: '13px', color: theme.steel, margin: 0 }}>Sign in to your workspace</p>
        </div>

        <div style={{
          background: theme.white,
          border: `1px solid ${theme.fog}`,
          borderRadius: '10px',
          padding: '30px 28px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '7px' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter your username"
                style={{ ...inputStyle, borderColor: error ? theme.error : theme.fog }}
                onFocus={e => { e.target.style.borderColor = theme.burgundy; e.target.style.background = theme.white; }}
                onBlur={e => { e.target.style.borderColor = error ? theme.error : theme.fog; e.target.style.background = theme.smoke; }}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: theme.steel, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '7px' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your password"
                style={{ ...inputStyle, borderColor: error ? theme.error : theme.fog }}
                onFocus={e => { e.target.style.borderColor = theme.burgundy; e.target.style.background = theme.white; }}
                onBlur={e => { e.target.style.borderColor = error ? theme.error : theme.fog; e.target.style.background = theme.smoke; }}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{ fontSize: '13px', color: theme.error, background: `${theme.error}15`, border: `1px solid ${theme.error}35`, borderRadius: '6px', padding: '10px 14px', lineHeight: '1.4' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!username.trim() || !password || loading}
              style={{
                width: '100%',
                padding: '12px',
                background: theme.burgundy,
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'inherit',
                cursor: !username.trim() || !password || loading ? 'not-allowed' : 'pointer',
                opacity: !username.trim() || !password || loading ? 0.55 : 1,
                transition: 'opacity 0.15s',
                marginTop: '2px',
                letterSpacing: '0.2px',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: theme.steel, marginTop: '22px' }}>
          WealthTree · Member access only
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}
