import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CloudRain, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [username,    setUsername]    = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.token, res.data.username);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page" id="main-content">
      <div className="login-card">
        {/* Logo */}
        <Link to="/" className="login-logo">
          <CloudRain size={22} className="login-logo-icon" />
          <span>ambientbytes</span>
        </Link>

        <p className="login-subtitle">Sign in to manage your blog</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="form-field">
            <label className="form-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="form-input"
              type="text"
              placeholder=""
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </div>

          {/* Password */}
          <div className="form-field">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="password-wrap">
              <input
                id="login-password"
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading || !username || !password}
          >
            {loading
              ? <span className="login-spinner" />
              : <LogIn size={16} />
            }
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="login-back" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <Link to="/signup" className="login-back-link">Don't have an account? Sign up</Link>
          <Link to="/" className="login-back-link">← Back to blog</Link>
        </p>
      </div>
    </main>
  );
}
