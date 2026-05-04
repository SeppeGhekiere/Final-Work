import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import MyceliumWorld from "../three/MyceliumWorld";
import { gameState } from "../state/gameState";

const MyceliumLayer = forwardRef(function MyceliumLayer({ blur = 0, sleepiness = 0 }, ref) {
  const containerRef = useRef(null);
  const worldRef = useRef(null);

  useEffect(() => {
    worldRef.current = new MyceliumWorld(
      containerRef.current,
      () => gameState
    );
    return () => worldRef.current?.destroy();
  }, []);

  useImperativeHandle(ref, () => ({
    triggerPulse: (color) => worldRef.current?.triggerPulse(color)
  }));

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        filter: blur > 0 ? `blur(${blur}px)` : "none",
        transform: blur > 0 ? `scale(${1 - blur * 0.002})` : "none",
      }}
    >
      {/* Darkness overlay - only affects background, not UI */}
      <div
        className="sleepiness-overlay"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: sleepiness,
        }}
      />
    </div>
  );
});

export default MyceliumLayer;
