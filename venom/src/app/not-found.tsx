import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Poppins', sans-serif", padding: "2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: 64, fontWeight: 800, color: "#9c6b3c", margin: 0 }}>404</h1>
      <h2 style={{ fontSize: 24, fontWeight: 600, color: "#111827", margin: "12px 0 8px" }}>Page not found</h2>
      <p style={{ color: "#6b7280", maxWidth: 420, marginBottom: 32 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" style={{ background: "#9c6b3c", color: "#fff", padding: "12px 28px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>
        Back to homepage
      </Link>
    </div>
  );
}
