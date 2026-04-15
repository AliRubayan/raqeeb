export default function DarkLuxeRegister() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #0d1b2a 100%)" }}>
      <div style={{ width: 480, padding: "48px 40px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, backdropFilter: "blur(20px)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚖️</div>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#f59e0b", fontFamily: "system-ui" }}>Raqeeb</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px", fontFamily: "system-ui" }}>Create Your Account</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0, fontFamily: "system-ui" }}>Start analyzing contracts with AI in minutes</p>
        </div>
        <form onSubmit={e => e.preventDefault()}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "system-ui" }}>First Name</label>
              <input placeholder="Ahmad" style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "system-ui" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "system-ui" }}>Last Name</label>
              <input placeholder="Al-Rashid" style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "system-ui" }} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "system-ui" }}>Email Address</label>
            <input type="email" placeholder="you@example.com" style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "system-ui" }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "system-ui" }}>Password</label>
            <input type="password" placeholder="••••••••" style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "system-ui" }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "system-ui" }}>Confirm Password</label>
            <input type="password" placeholder="••••••••" style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "system-ui" }} />
          </div>
          <button type="submit" style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", border: "none", borderRadius: 10, color: "#0a0f1e", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}>
            Create Account →
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: 13, color: "#475569", marginTop: 20, fontFamily: "system-ui" }}>
          Already have an account? <a href="#" style={{ color: "#f59e0b", fontWeight: 600, textDecoration: "none" }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}
