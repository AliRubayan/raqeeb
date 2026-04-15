export default function DarkLuxeLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #0d1b2a 100%)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 300, height: 300, background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", borderRadius: "50%" }} />
      </div>
      <div style={{ width: 440, padding: "48px 40px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, backdropFilter: "blur(20px)", boxShadow: "0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚖️</div>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#f59e0b", letterSpacing: "-0.5px", fontFamily: "system-ui" }}>Raqeeb</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px", fontFamily: "system-ui" }}>Welcome Back</h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0, fontFamily: "system-ui" }}>Sign in to your AI contract analysis platform</p>
        </div>
        <form onSubmit={e => e.preventDefault()}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "system-ui" }}>Email Address</label>
            <input type="email" placeholder="you@example.com" style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "system-ui" }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "system-ui" }}>Password</label>
            <input type="password" placeholder="••••••••" style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "system-ui" }} />
          </div>
          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <a href="#" style={{ fontSize: 13, color: "#f59e0b", textDecoration: "none", fontFamily: "system-ui" }}>Forgot password?</a>
          </div>
          <button type="submit" style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", border: "none", borderRadius: 10, color: "#0a0f1e", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em", fontFamily: "system-ui", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}>
            Sign In →
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 13, color: "#64748b", fontFamily: "system-ui" }}>Don't have an account? </span>
          <a href="#" style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600, textDecoration: "none", fontFamily: "system-ui" }}>Create one free</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: 11, color: "#475569", fontFamily: "system-ui" }}>256-bit encrypted  •  SOC 2 compliant</span>
        </div>
      </div>
    </div>
  );
}
