import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import MyceliumWorld from "../three/MyceliumWorld";
import { gameState } from "../state/gameState";

const MyceliumLayer = forwardRef(function MyceliumLayer(props, ref) {
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
        pointerEvents: "none"
      }}
    />
  );
});

export default MyceliumLayer;
