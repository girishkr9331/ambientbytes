export default function VideoBackground() {
  return (
    <div className="video-bg-wrap" aria-hidden="true">
      <img
        className="video-bg"
        src="/backgrounds/background.webp?v=2"
        alt=""
        loading="eager"
      />
      {/* Dark overlay to keep text readable */}
      <div className="video-bg-overlay" />
    </div>
  );
}
