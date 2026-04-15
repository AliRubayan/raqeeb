export default function CleanModernRegister() {
  return (
    <div className="min-h-screen" style={{ background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520, background: "white", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)", padding: "32px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>⚖️</span>
            <span style={{ color: "white", fontWeight: 700, fontSize: 20 }}>Raqeeb</span>
          </div>
          <h1 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Create your account</h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: 0 }}>Join thousands analyzing contracts smarter</p>
        </div>
        <div style={{ padding: "36px 40px" }}>
          <form onSubmit={e => e.preventDefault()}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>First Name</label>
                <input placeholder="Ahmad" style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fafb" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Last Name</label>
                <input placeholder="Al-Rashid" style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fafb" }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email</label>
              <input type="email" placeholder="you@company.com" style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fafb" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Password</label>
                <input type="password" placeholder="••••••••" style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fafb" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Confirm</label>
                <input type="password" placeholder="••••••••" style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fafb" }} />
              </div>
            </div>
            <button type="submit" style={{ width: "100%", padding: 13, background: "#2563eb", border: "none", borderRadius: 8, color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Create Account
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 20 }}>
            Already have an account? <a href="#" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
