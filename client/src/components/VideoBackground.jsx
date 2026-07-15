export default function VideoBackground() {
  return (
    <div className="video-bg-wrap" aria-hidden="true">
      <video
        className="video-bg"
        src="/backgrounds/background-scene.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      {/* Dark overlay to keep text readable */}
      <div className="video-bg-overlay" />
    </div>
  );
}
