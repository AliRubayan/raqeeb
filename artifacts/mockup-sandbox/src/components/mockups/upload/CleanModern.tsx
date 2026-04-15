export default function CleanModernUpload() {
  return (
    <div className="min-h-screen" style={{ background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>⚖️</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#1e3a5f" }}>Raqeeb</span>
        <span style={{ marginLeft: "auto", fontSize: 13, color: "#6b7280" }}>ahmad@example.com</span>
        <div style={{ width: 32, height: 32, background: "#2563eb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700 }}>A</div>
      </nav>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: "#eff6ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📋</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Upload Contract</h1>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>AI analysis delivered within 13.9 days on average</p>
          </div>
        </div>
        <div style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "32px" }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Contract Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input placeholder="e.g. Service Agreement — Al-Nour Holding" style={{ width: "100%", padding: "11px 13px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box", background: "#f9fafb" }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Contract Value <span style={{ color: "#ef4444" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14 }}>SAR</span>
              <input type="number" placeholder="500,000" style={{ width: "100%", padding: "11px 13px 11px 52px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box", background: "#f9fafb" }} />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Contract PDF <span style={{ color: "#ef4444" }}>*</span></label>
            <div style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: "28px 20px", textAlign: "center", background: "#f9fafb", cursor: "pointer" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
              <p style={{ color: "#374151", fontSize: 14, fontWeight: 500, margin: "0 0 4px" }}>Drop your PDF here</p>
              <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 14px" }}>or click to browse</p>
              <button type="button" style={{ padding: "8px 20px", background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 6, color: "#2563eb", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Choose File</button>
              <p style={{ color: "#9ca3af", fontSize: 12, margin: "10px 0 0" }}>PDF only · Max 20MB</p>
            </div>
          </div>
          <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "14px 16px", marginBottom: 24, display: "flex", gap: 10 }}>
            <span style={{ fontSize: 16 }}>ℹ️</span>
            <p style={{ color: "#0369a1", fontSize: 13, margin: 0, lineHeight: 1.5 }}>After payment, Inspector AI, Oracle AI, and Lawyer AI will begin reviewing your contract. Results appear in the Decision Room.</p>
          </div>
          <button type="submit" style={{ width: "100%", padding: 13, background: "#2563eb", border: "none", borderRadius: 8, color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Proceed to Payment →
          </button>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 20, justifyContent: "center" }}>
          {["🔒 Secure upload", "🤖 AI-powered", "📊 13.9 days avg"].map(item => (
            <span key={item} style={{ fontSize: 12, color: "#6b7280" }}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
