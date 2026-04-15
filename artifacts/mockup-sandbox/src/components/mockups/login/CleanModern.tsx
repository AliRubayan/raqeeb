export default function CleanModernLogin() {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div style={{ flex: 1, background: "linear-gradient(160deg, #1e3a5f 0%, #2563eb 60%, #1d4ed8 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, background: "rgba(255,255,255,0.15)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 24px", backdropFilter: "blur(10px)" }}>⚖️</div>
          <h2 style={{ color: "white", fontSize: 28, fontWeight: 700, margin: "0 0 12px" }}>AI Contract Analysis</h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.6, maxWidth: 280, margin: "0 auto 32px" }}>Three expert AI agents review your contracts in minutes, not days.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["🔍 Inspector AI — Risk detection", "⚖️ Oracle AI — Legal analysis", "💼 Lawyer AI — Plain-language summary"].map(item => (
              <div key={item} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 16px", color: "rgba(255,255,255,0.9)", fontSize: 13, backdropFilter: "blur(4px)", textAlign: "left" }}>{item}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ width: 480, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#1e3a5f" }}>Raqeeb</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Sign in</h1>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Welcome back. Let's review your contracts.</p>
          </div>
          <form onSubmit={e => e.preventDefault()}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email</label>
              <input type="email" placeholder="you@company.com" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box", background: "#f9fafb" }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="••••••••" style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box", background: "#f9fafb" }} />
            </div>
            <div style={{ textAlign: "right", marginBottom: 24 }}>
              <a href="#" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none" }}>Forgot password?</a>
            </div>
            <button type="submit" style={{ width: "100%", padding: 13, background: "#2563eb", border: "none", borderRadius: 8, color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Continue
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 24 }}>
            No account? <a href="#" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Sign up free</a>
          </p>
        </div>
      </div>
    </div>
  );
}
