import Silk from "../components/Silk/Silk";

export default function Background() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
    >
      <Silk speed={5} scale={1} color="#1f1c1c" noiseIntensity={1.1} rotation={0} />
    </div>
  );
}
