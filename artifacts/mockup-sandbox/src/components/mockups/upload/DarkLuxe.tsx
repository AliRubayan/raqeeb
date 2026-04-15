export default function DarkLuxeUpload() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0f1e", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ borderBottom: "1px solid rgba(245,158,11,0.15)", padding: "16px 32px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>⚖️</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b" }}>Raqeeb</span>
        <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b" }}>ahmad@example.com</span>
      </nav>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px" }}>Upload Contract</h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Our AI agents will analyze your contract and deliver results in under 14 days.</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, padding: "36px 32px" }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>Contract Name *</label>
            <input placeholder="e.g. Service Agreement — Al-Nour Holding" style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>Contract Value (SAR) *</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: 14 }}>﷼</span>
              <input type="number" placeholder="500,000" style={{ width: "100%", padding: "12px 14px 12px 32px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>Contract PDF *</label>
            <div style={{ border: "2px dashed rgba(245,158,11,0.3)", borderRadius: 12, padding: "32px 20px", textAlign: "center", background: "rgba(245,158,11,0.03)", cursor: "pointer" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
              <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 8px" }}>Drag & drop your PDF here</p>
              <p style={{ color: "#475569", fontSize: 12, margin: "0 0 16px" }}>or</p>
              <button type="button" style={{ padding: "8px 20px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 8, color: "#f59e0b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Browse Files</button>
              <p style={{ color: "#475569", fontSize: 12, margin: "12px 0 0" }}>PDF only · Max 20MB</p>
            </div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <div>
              <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>What happens next?</p>
              <p style={{ color: "#94a3b8", fontSize: 12, margin: 0, lineHeight: 1.5 }}>After payment, 3 AI agents (Inspector, Oracle, Lawyer) will review your contract and post findings directly in the Decision Room.</p>
            </div>
          </div>
          <button type="submit" style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", border: "none", borderRadius: 10, color: "#0a0f1e", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}>
            Proceed to Payment →
          </button>
        </div>
      </div>
    </div>
  );
}
