export default function Avatar({ name, size = 28, color = "#4f46e5" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg,${color},${color}bb)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {(name || "?")[0]}
    </div>
  );
}
