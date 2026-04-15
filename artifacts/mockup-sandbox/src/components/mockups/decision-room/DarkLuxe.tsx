const agents = [
  { id: "inspector_ai", icon: "🔍", name: "Inspector AI", role: "Risk Detection", color: "#ef4444", msg: "I've completed a full clause-by-clause scan. The indemnification clause in Section 7.3 is heavily one-sided — the counterparty bears zero liability for consequential damages. This is a critical risk flag. Recommend renegotiation before signing.", time: "2 mins ago" },
  { id: "oracle_ai", icon: "⚖️", name: "Oracle AI", role: "Legal Analysis", color: "#f59e0b", msg: "Cross-referencing with Saudi commercial law (Royal Decree M/3). The payment terms in Section 4.1 conflict with Article 112 of the Commercial Court Law. Additionally, the arbitration clause designates a foreign jurisdiction — this is unenforceable under Saudi law without bilateral agreements.", time: "4 mins ago" },
  { id: "lawyer_ai", icon: "💼", name: "Lawyer AI", role: "Plain Language Summary", color: "#22c55e", msg: "Bottom line: This contract has 3 high-risk clauses that need immediate attention before signing. You could be responsible for all damages with no recourse. The payment schedule also starts 30 days later than standard. I recommend requesting amendments on sections 4.1, 7.3, and 11.2.", time: "6 mins ago" },
];

export default function DarkLuxeDecisionRoom() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0f1e", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ borderBottom: "1px solid rgba(245,158,11,0.15)", padding: "14px 24px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>⚖️</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#f59e0b" }}>Raqeeb</span>
        <span style={{ marginLeft: 16, fontSize: 13, color: "#64748b" }}>/ Decision Room</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ padding: "4px 12px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, fontSize: 12, color: "#22c55e" }}>● Analysis Complete</div>
        </div>
      </nav>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", flex: 1, overflow: "hidden" }}>
        <div style={{ borderRight: "1px solid rgba(245,158,11,0.12)", padding: "20px 16px", background: "rgba(255,255,255,0.015)" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px 4px" }}>Contract Summary</p>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", margin: "0 0 8px" }}>Service Agreement — Al-Nour</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[["Value", "SAR 500,000"], ["Status", "Completed"], ["Uploaded", "Apr 12, 2026"], ["Pages", "24"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{k}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px 4px" }}>Risk Score</p>
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600 }}>HIGH RISK</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#ef4444" }}>7.4/10</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ width: "74%", height: "100%", background: "linear-gradient(90deg, #f59e0b, #ef4444)", borderRadius: 4 }} />
            </div>
          </div>
          <button style={{ width: "100%", padding: "10px 0", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 8, color: "#f59e0b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            📥 Download Report
          </button>
          <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 8 }}>
            <p style={{ fontSize: 11, color: "#64748b", margin: 0, lineHeight: 1.5 }}>⚡ Analysis saved <strong style={{ color: "#22c55e" }}>13.9 days</strong> vs traditional review</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>AI Agents Discussion — Service Agreement — Al-Nour</p>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {agents.map(agent => (
              <div key={agent.id} style={{ display: "flex", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${agent.color}20`, border: `1px solid ${agent.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{agent.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: agent.color }}>{agent.name}</span>
                    <span style={{ fontSize: 11, color: "#475569" }}>{agent.role}</span>
                    <span style={{ fontSize: 11, color: "#334155", marginLeft: "auto" }}>{agent.time}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${agent.color}20`, borderRadius: 10, padding: "12px 16px" }}>
                    <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0, lineHeight: 1.7 }}>{agent.msg}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
