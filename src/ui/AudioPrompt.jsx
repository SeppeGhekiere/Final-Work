import Background from "./Background";

const HeadphoneIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cd5909" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 14c0-4.97 4.03-9 10-9s10 4.03 10 9" />
    <path d="M3 14h3v4a2 2 0 0 1-2 2H3v-6Z" />
    <path d="M23 14h-3v4a2 2 0 0 0 2 2h1v-6Z" />
  </svg>
);

const VolumeIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cd5909" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

export default function AudioPrompt({ onContinue }) {
  return (
    <div className="audio-prompt-page" style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      color: "#e0e0e0",
      padding: "2rem",
      boxSizing: "border-box",
      overflow: "hidden",
      fontFamily: "'Montserrat', sans-serif"
    }}>
      <Background />
      <div style={{ maxWidth: "600px", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        <div style={{ display: "flex", gap: "3rem", marginBottom: "2.5rem" }}>
          <HeadphoneIcon />
          <VolumeIcon />
        </div>

        <h2 style={{ 
          fontWeight: "400", 
          fontSize: "1.8rem", 
          lineHeight: "1.4", 
          marginBottom: "3rem",
          color: "#e0e0e0"
        }}>
          We recommend using headphones and turning the volume up
        </h2>
        
        <button 
          className="hero-btn" 
          onClick={onContinue}
          style={{
            padding: "12px 64px",
            fontSize: "1rem",
            cursor: "pointer",
            background: "#cd5909",
            border: "none",
            color: "#fff",
            borderRadius: "6px",
            transition: "background 0.2s",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: "600"
          }}
        >
          Begin
        </button>
      </div>
    </div>
  );
}
