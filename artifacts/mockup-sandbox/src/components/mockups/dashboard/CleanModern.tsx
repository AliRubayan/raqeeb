const contracts = [
  { name: "Service Agreement — Al-Nour Holding", date: "Apr 12, 2026", value: "SAR 500,000", status: "Completed", risk: "HIGH" },
  { name: "Lease Contract — Riyadh Tower", date: "Mar 28, 2026", value: "SAR 1,200,000", status: "Completed", risk: "MEDIUM" },
  { name: "Supply Agreement — Gulf Logistics", date: "Mar 10, 2026", value: "SAR 320,000", status: "Completed", risk: "LOW" },
  { name: "Partnership MOU — Horizon Group", date: "Feb 22, 2026", value: "SAR 2,000,000", status: "Pending Payment", risk: "-" },
];

const riskStyle: Record<string, { bg: string; color: string }> = {
  HIGH: { bg: "#fee2e2", color: "#dc2626" },
  MEDIUM: { bg: "#fef3c7", color: "#d97706" },
  LOW: { bg: "#dcfce7", color: "#16a34a" },
  "-": { bg: "#f3f4f6", color: "#6b7280" },
};

export default function CleanModernDashboard() {
  return (
    <div className="min-h-screen" style={{ background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>⚖️</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#1e3a5f" }}>Raqeeb</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <button style={{ padding: "8px 18px", background: "#2563eb", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Upload Contract</button>
          <div style={{ width: 32, height: 32, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", fontSize: 13, fontWeight: 700 }}>A</div>
        </div>
      </nav>
      <div style={{ padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Welcome back, Ahmad</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Here's an overview of your contract portfolio</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Contracts", value: "12", icon: "📋", color: "#eff6ff", iconColor: "#2563eb" },
            { label: "Completed", value: "9", icon: "✅", color: "#f0fdf4", iconColor: "#16a34a" },
            { label: "Days Saved", value: "124", icon: "⚡", color: "#fffbeb", iconColor: "#d97706" },
            { label: "Avg Risk Score", value: "5.2", icon: "🛡️", color: "#fef2f2", iconColor: "#dc2626" },
          ].map(card => (
            <div key={card.label} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 40, height: 40, background: card.color, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{card.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 2 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{card.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Contract History</span>
            <input placeholder="Search..." style={{ padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, color: "#374151", outline: "none", background: "#f9fafb" }} />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Contract", "Date", "Value", "Risk", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map((c, i) => (
                <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "#111827", fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: "13px 16px", fontSize: 12, color: "#6b7280" }}>{c.date}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151" }}>{c.value}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ padding: "3px 10px", background: riskStyle[c.risk].bg, color: riskStyle[c.risk].color, borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{c.risk}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ padding: "3px 10px", background: c.status === "Completed" ? "#dcfce7" : "#fef3c7", color: c.status === "Completed" ? "#16a34a" : "#d97706", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{c.status}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    {c.status === "Completed" && <button style={{ padding: "5px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, color: "#2563eb", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>View →</button>}
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
