const agents = [
  { id: "inspector", icon: "🔍", name: "Inspector AI", role: "Risk Detection", bg: "#fef2f2", border: "#fecaca", nameColor: "#dc2626", msg: "I've completed a full clause-by-clause scan. The indemnification clause in Section 7.3 is heavily one-sided — the counterparty bears zero liability for consequential damages. This is a critical risk flag. Recommend renegotiation before signing.", time: "2 mins ago" },
  { id: "oracle", icon: "⚖️", name: "Oracle AI", role: "Legal Analysis", bg: "#fffbeb", border: "#fde68a", nameColor: "#d97706", msg: "Cross-referencing with Saudi commercial law (Royal Decree M/3). The payment terms in Section 4.1 conflict with Article 112 of the Commercial Court Law. The arbitration clause designates a foreign jurisdiction — unenforceable under Saudi law.", time: "4 mins ago" },
  { id: "lawyer", icon: "💼", name: "Lawyer AI", role: "Plain Language Summary", bg: "#f0fdf4", border: "#bbf7d0", nameColor: "#16a34a", msg: "Bottom line: 3 high-risk clauses need attention before signing. You could be liable for all damages with no recourse. Payment schedule starts 30 days later than standard. Request amendments on sections 4.1, 7.3, and 11.2.", time: "6 mins ago" },
];

export default function CleanModernDecisionRoom() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>⚖️</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#1e3a5f" }}>Raqeeb</span>
        <span style={{ color: "#9ca3af", margin: "0 4px" }}>/</span>
        <span style={{ fontSize: 14, color: "#6b7280" }}>Decision Room</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ padding: "4px 12px", background: "#dcfce7", borderRadius: 20, fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ Analysis Complete</div>
        </div>
      </nav>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", flex: 1 }}>
        <div style={{ background: "white", borderRight: "1px solid #e5e7eb", padding: "20px 16px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>Contract Info</p>
          <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "0 0 10px" }}>Service Agreement — Al-Nour</p>
            {[["Value", "SAR 500,000"], ["Status", "Completed"], ["Date", "Apr 12, 2026"], ["Pages", "24"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{k}</span>
                <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>Risk Score</p>
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#92400e", fontWeight: 600 }}>HIGH RISK</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#ea580c" }}>7.4</span>
            </div>
            <div style={{ background: "#e5e7eb", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ width: "74%", height: "100%", background: "linear-gradient(90deg, #f59e0b, #ef4444)", borderRadius: 4 }} />
            </div>
            <p style={{ fontSize: 11, color: "#92400e", margin: "6px 0 0" }}>3 critical clauses flagged</p>
          </div>
          <button style={{ width: "100%", padding: "10px 0", background: "#2563eb", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 10 }}>
            📥 Download Report
          </button>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 12px" }}>
            <p style={{ fontSize: 12, color: "#166534", margin: 0 }}>⚡ Saved <strong>13.9 days</strong> vs traditional review</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 24px", background: "white", borderBottom: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>AI Agent Analysis — Service Agreement — Al-Nour Holding</p>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {agents.map(agent => (
              <div key={agent.id} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: agent.bg, border: `1px solid ${agent.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{agent.icon}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: agent.nameColor, margin: "0 0 2px" }}>{agent.name}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{agent.role}</p>
                  </div>
                  <span style={{ fontSize: 11, color: "#d1d5db", marginLeft: "auto" }}>{agent.time}</span>
                </div>
                <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.7 }}>{agent.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
