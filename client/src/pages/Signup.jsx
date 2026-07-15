import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CloudRain, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Signup() {
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

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', { username, password });
      login(res.data.token, res.data.username);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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

        <p className="login-subtitle">Create an account to start writing</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="form-field">
            <label className="form-label" htmlFor="signup-username">Username</label>
            <input
              id="signup-username"
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
            <label className="form-label" htmlFor="signup-password">Password (min 6 chars)</label>
            <div className="password-wrap">
              <input
                id="signup-password"
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
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
              : <UserPlus size={16} />
            }
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="login-back" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <Link to="/login" className="login-back-link">Already have an account? Sign in</Link>
          <Link to="/" className="login-back-link">← Back to blog</Link>
        </p>
      </div>
    </main>
  );
}
