export default function InfoPage({ onStart, onHome, onProject }) {
  return (
    <div className="info-page">
      <nav className="home-nav">
        <button className="home-logo home-logo-btn" onClick={onHome}>The Loop</button>
        <div className="home-nav-links">
          <span className="home-nav-current">Info</span>
          <button className="home-nav-start" onClick={onProject}>Project</button>
        </div>
      </nav>

      <div className="info-content">
        <h1 className="info-title">What is this?</h1>

        <p className="info-text">
          This is an interactive narrative about the way we scroll.
        </p>
        <p className="info-text">
          It follows the shape of a familiar loop — the moment you reach for your
          phone, the pull of another video, the minutes that slip by without notice.
        </p>
        <p className="info-text">
          There are no scores, no right answers. The experience reacts to your
          choices, and the way you move through it shapes what you see.
        </p>
        <p className="info-text">
          It takes about five minutes.
        </p>

        <button className="hero-btn" onClick={onStart}>
          Begin
        </button>
      </div>
    </div>
  );
}
