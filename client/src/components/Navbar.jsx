import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CloudRain, PenLine, Volume2, VolumeX, Music, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MUSIC_SRC = '/music/Rainy Lofi Vibes 🌧️ Chill Balcony Beats for Study & Sleep [gUK83B2Po8A].mp3';

export default function Navbar({ musicPlaying, onToggleMusic }) {
  const navigate      = useNavigate();
  const { user, logout } = useAuth();

  const audioRef      = useRef(null);
  const wrapRef       = useRef(null);
  const userMenuRef   = useRef(null);

  const [volume,      setVolume]      = useState(0.45);
  const [showVol,     setShowVol]     = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop   = true;
    audio.volume = volume;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  // Sync play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [musicPlaying]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Close volume panel when clicking outside
  useEffect(() => {
    if (!showVol) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowVol(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showVol]);

  // Close user menu when clicking outside
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu]);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <Link to="/" className="navbar-logo">
        <CloudRain size={20} className="rain-icon" />
        <span>ambientbytes</span>
      </Link>

      <div className="navbar-actions">
        {/* Sound control */}
        <div className="sound-control-wrap" ref={wrapRef}>
          <button
            className={`icon-btn sound-btn ${musicPlaying ? 'active' : ''}`}
            onClick={() => { onToggleMusic(); setShowVol(v => !v); }}
            aria-label={musicPlaying ? 'Pause lofi music' : 'Play lofi music'}
            aria-expanded={showVol}
          >
            {musicPlaying ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>

          <div className={`volume-panel ${showVol ? 'visible' : ''}`} role="region" aria-label="Volume control">
            <Music size={11} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span className="vol-label">Rain Lofi</span>
            <input
              type="range"
              className="vol-slider"
              min="0" max="1" step="0.01"
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              aria-label="Music volume"
            />
            <span className="vol-pct">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {user ? (
          <>
            {/* New Post — only when logged in */}
            <button
              className="navbar-new-btn"
              onClick={() => navigate('/new')}
              aria-label="Write a new post"
            >
              <PenLine size={15} />
              New Post
            </button>

            {/* User avatar / logout dropdown */}
            <div className="user-menu-wrap" ref={userMenuRef}>
              <button
                className="icon-btn user-avatar-btn"
                onClick={() => setShowUserMenu(v => !v)}
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                <User size={16} />
              </button>

              <div className={`user-dropdown ${showUserMenu ? 'visible' : ''}`} role="menu">
                <div className="user-dropdown-name">
                  <User size={12} />
                  <span>{user.username}</span>
                </div>
                <hr className="user-dropdown-divider" />
                <button className="user-dropdown-item logout-item" onClick={handleLogout} role="menuitem">
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Login button — when logged out */
          <button
            className="navbar-login-btn"
            onClick={() => navigate('/login')}
            aria-label="Sign in"
          >
            <LogIn size={15} />
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
