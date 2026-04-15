const contracts = [
  { name: "Service Agreement — Al-Nour Holding", date: "Apr 12, 2026", value: "SAR 500,000", status: "Completed", risk: "HIGH" },
  { name: "Lease Contract — Riyadh Tower", date: "Mar 28, 2026", value: "SAR 1,200,000", status: "Completed", risk: "MEDIUM" },
  { name: "Supply Agreement — Gulf Logistics", date: "Mar 10, 2026", value: "SAR 320,000", status: "Completed", risk: "LOW" },
  { name: "Partnership MOU — Horizon Group", date: "Feb 22, 2026", value: "SAR 2,000,000", status: "Pending Payment", risk: "-" },
];

const riskColors: Record<string, string> = { HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#22c55e", "-": "#475569" };
const riskBg: Record<string, string> = { HIGH: "rgba(239,68,68,0.15)", MEDIUM: "rgba(245,158,11,0.15)", LOW: "rgba(34,197,94,0.15)", "-": "rgba(71,85,105,0.2)" };

export default function DarkLuxeDashboard() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0f1e", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ borderBottom: "1px solid rgba(245,158,11,0.15)", padding: "14px 24px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>⚖️</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#f59e0b" }}>Raqeeb</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <button style={{ padding: "8px 18px", background: "linear-gradient(135deg, #f59e0b, #d97706)", border: "none", borderRadius: 8, color: "#0a0f1e", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Upload Contract</button>
          <div style={{ width: 32, height: 32, background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", fontSize: 13, fontWeight: 700 }}>A</div>
        </div>
      </nav>
      <div style={{ padding: "32px 24px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px" }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px" }}>Your contract analysis history</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Contracts", value: "12", icon: "📋", sub: "All time" },
            { label: "Completed", value: "9", icon: "✅", sub: "75% completion rate" },
            { label: "Days Saved", value: "124", icon: "⚡", sub: "vs traditional review" },
            { label: "Avg Risk Score", value: "5.2", icon: "🛡️", sub: "Moderate portfolio risk" },
          ].map(card => (
            <div key={card.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 14, padding: "20px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{card.label}</span>
                <span style={{ fontSize: 20 }}>{card.icon}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>{card.value}</div>
              <div style={{ fontSize: 11, color: "#475569" }}>{card.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Recent Contracts</span>
            <input placeholder="Search contracts..." style={{ padding: "6px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#94a3b8", fontSize: 12, outline: "none" }} />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["Contract", "Date", "Value", "Risk", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map((c, i) => (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b" }}>{c.date}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8" }}>{c.value}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "3px 10px", background: riskBg[c.risk], color: riskColors[c.risk], borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{c.risk}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "3px 10px", background: c.status === "Completed" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", color: c.status === "Completed" ? "#22c55e" : "#f59e0b", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{c.status}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {c.status === "Completed" && <button style={{ padding: "5px 12px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 6, color: "#f59e0b", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>View →</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
