import { useEffect, useRef } from "react";
import MyceliumWorld from "../three/MyceliumWorld";
import { gameState } from "../state/gameState";

export default function MyceliumLayer() {
  const ref = useRef(null);
  const worldRef = useRef(null);

  useEffect(() => {
    worldRef.current = new MyceliumWorld(
      ref.current,
      () => gameState
    );
    return () => worldRef.current?.destroy();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none"
      }}
    />
  );
}
