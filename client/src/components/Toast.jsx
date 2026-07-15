import { useEffect, useRef } from 'react';

export default function Toast({ message, type = 'success', onHide }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!message) return;
    timerRef.current = setTimeout(() => onHide(), 3500);
    return () => clearTimeout(timerRef.current);
  }, [message, onHide]);

  const icon = type === 'success'
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

  return (
    <div
      className={`toast ${type} ${message ? 'show' : ''}`}
      role="status"
      aria-live="polite"
    >
      {icon}
      {message}
    </div>
  );
}
