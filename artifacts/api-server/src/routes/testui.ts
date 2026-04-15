import { Router } from "express";

const router = Router();

router.get("/test", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Raqeeb — Test Panel</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;background:#0f1117;color:#e2e8f0;min-height:100vh;padding:24px}
  h1{color:#6366f1;font-size:1.6rem;margin-bottom:4px}
  .sub{color:#64748b;font-size:.85rem;margin-bottom:28px}
  .grid{display:grid;grid-template-columns:360px 1fr;gap:20px;align-items:start}
  .card{background:#1e2130;border:1px solid #2d3148;border-radius:12px;padding:20px}
  .card h2{font-size:.95rem;color:#94a3b8;margin-bottom:14px;text-transform:uppercase;letter-spacing:.05em}
  label{display:block;font-size:.8rem;color:#94a3b8;margin-bottom:4px;margin-top:10px}
  input[type=text],input[type=email],input[type=password],input[type=file]{
    width:100%;padding:8px 10px;background:#111827;border:1px solid #374151;border-radius:7px;
    color:#e2e8f0;font-size:.875rem}
  input[type=file]{padding:6px}
  button{margin-top:12px;padding:9px 16px;border:none;border-radius:7px;cursor:pointer;
    font-size:.85rem;font-weight:600;width:100%;transition:.15s}
  .btn-primary{background:#6366f1;color:#fff}
  .btn-primary:hover{background:#4f46e5}
  .btn-green{background:#10b981;color:#fff}
  .btn-green:hover{background:#059669}
  .btn-outline{background:transparent;border:1px solid #374151;color:#94a3b8;margin-top:6px}
  .btn-outline:hover{border-color:#6366f1;color:#6366f1}
  .msg{margin-top:10px;padding:8px 12px;border-radius:7px;font-size:.8rem;display:none}
  .msg.ok{background:#064e3b;color:#6ee7b7;display:block}
  .msg.err{background:#7f1d1d;color:#fca5a5;display:block}
  .status-badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:.72rem;font-weight:700}
  .Analyzing{background:#1e3a5f;color:#60a5fa}
  .Completed{background:#064e3b;color:#6ee7b7}
  .Paid{background:#2d1b69;color:#a78bfa}
  .Rejected{background:#7f1d1d;color:#fca5a5}
  .contract-row{padding:12px;border:1px solid #2d3148;border-radius:8px;margin-bottom:8px;cursor:pointer;transition:.15s}
  .contract-row:hover{border-color:#6366f1;background:#161929}
  .contract-row.active{border-color:#6366f1;background:#1a1d35}
  .contract-name{font-size:.9rem;font-weight:600;margin-bottom:4px}
  .contract-meta{font-size:.75rem;color:#64748b}
  .result-section{margin-bottom:16px}
  .result-section h3{font-size:.8rem;text-transform:uppercase;color:#64748b;margin-bottom:6px;letter-spacing:.05em}
  .result-text{background:#111827;border:1px solid #1f2937;border-radius:7px;padding:10px;
    font-size:.82rem;line-height:1.5;color:#d1d5db;max-height:160px;overflow-y:auto;white-space:pre-wrap}
  .risk-bar-wrap{height:8px;background:#1f2937;border-radius:4px;margin:6px 0 2px}
  .risk-bar{height:100%;border-radius:4px;background:#6366f1;transition:width .5s}
  .actions{display:flex;gap:8px;margin-top:14px}
  .actions button{margin-top:0;flex:1}
  .score-big{font-size:2.5rem;font-weight:800;line-height:1}
  .severity-tag{font-size:.75rem;padding:2px 8px;border-radius:4px;display:inline-block;margin-top:4px}
  .High .severity-tag{background:#7f1d1d;color:#fca5a5}
  .Medium .severity-tag{background:#78350f;color:#fcd34d}
  .Low .severity-tag{background:#064e3b;color:#6ee7b7}
  .poll-indicator{font-size:.7rem;color:#64748b;margin-top:6px}
  .empty{text-align:center;padding:32px;color:#374151;font-size:.85rem}
  .tab-bar{display:flex;gap:8px;margin-bottom:16px}
  .tab{padding:6px 14px;border-radius:6px;border:1px solid #374151;background:transparent;
    color:#64748b;cursor:pointer;font-size:.82rem}
  .tab.active{background:#6366f1;border-color:#6366f1;color:#fff}
  .spinner{display:inline-block;width:14px;height:14px;border:2px solid #374151;
    border-top-color:#6366f1;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle}
  @keyframes spin{to{transform:rotate(360deg)}}
  #overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;
    justify-content:center;z-index:999;display:none}
  #overlay.show{display:flex}
  .overlay-box{background:#1e2130;border:1px solid #6366f1;border-radius:14px;padding:32px;
    max-width:400px;text-align:center}
  .overlay-box .icon{font-size:3rem;margin-bottom:12px}
  .overlay-box h2{color:#6ee7b7;margin-bottom:8px}
  .overlay-box p{color:#94a3b8;font-size:.85rem;margin-bottom:16px}
</style>
</head>
<body>
<h1>🛡️ Raqeeb — لوحة الاختبار</h1>
<p class="sub">Test Panel — Full API Flow</p>

<div class="grid">
  <!-- LEFT: Auth + Upload -->
  <div>
    <div class="card" id="authCard">
      <h2>المصادقة</h2>
      <div class="tab-bar">
        <button class="tab active" onclick="switchTab('login')">تسجيل الدخول</button>
        <button class="tab" onclick="switchTab('register')">حساب جديد</button>
      </div>
      <label>البريد الإلكتروني</label>
      <input type="email" id="email" placeholder="user@example.com">
      <label>كلمة المرور</label>
      <input type="password" id="password" placeholder="••••••••">
      <button class="btn-primary" onclick="doAuth()">دخول</button>
      <div id="authMsg" class="msg"></div>
      <div id="userInfo" style="margin-top:10px;font-size:.8rem;color:#6ee7b7;display:none"></div>
    </div>

    <div class="card" style="margin-top:16px">
      <h2>رفع العقد</h2>
      <label>اسم العقد (اختياري)</label>
      <input type="text" id="contractName" placeholder="مثال: عقد إيجار شقة">
      <label>ملف PDF</label>
      <input type="file" id="pdfFile" accept="application/pdf">
      <button class="btn-green" onclick="uploadPDF()">📤 رفع وتحليل</button>
      <div id="uploadMsg" class="msg"></div>
    </div>

    <div class="card" style="margin-top:16px">
      <h2>محاكاة نتيجة n8n <span style="font-size:.7rem;color:#f59e0b">(DEV)</span></h2>
      <label>Contract ID</label>
      <input type="text" id="simContractId" placeholder="الصق contract id هنا">
      <label>Risk Score (0-10)</label>
      <input type="text" id="simRisk" value="7.5">
      <label>Severity</label>
      <input type="text" id="simSeverity" value="High">
      <label>Inspector Result</label>
      <input type="text" id="simInspector" value="تم اكتشاف بنود مخاطرة عالية في العقد.">
      <label>Law Result</label>
      <input type="text" id="simLaw" value="البند الثالث يتعارض مع نظام العمل السعودي.">
      <label>Drafter Result</label>
      <input type="text" id="simDrafter" value="يُنصح بمراجعة بنود الفسخ والتعويض.">
      <button class="btn-outline" onclick="simulateN8n()">⚡ إرسال نتيجة تجريبية</button>
      <div id="simMsg" class="msg"></div>
    </div>
  </div>

  <!-- RIGHT: Contracts + Decision Room -->
  <div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h2 style="margin:0">العقود</h2>
        <span id="pollIndicator" class="poll-indicator"></span>
        <button class="btn-outline" style="width:auto;margin:0;padding:5px 12px" onclick="loadHistory()">🔄 تحديث</button>
      </div>
      <div id="contractList"><div class="empty">سجّل دخولك وارفع عقداً للبدء</div></div>
    </div>

    <div class="card" id="decisionRoom" style="margin-top:16px;display:none">
      <h2>غرفة القرار <span id="drContractName" style="color:#a78bfa;font-weight:400"></span></h2>

      <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:16px">
        <div id="riskSection" class="Low">
          <div class="score-big" id="riskScore">—</div>
          <div style="font-size:.72rem;color:#64748b">Risk Score / 10</div>
          <span class="severity-tag" id="severityTag">—</span>
        </div>
        <div style="flex:1">
          <div class="risk-bar-wrap"><div class="risk-bar" id="riskBar" style="width:0%"></div></div>
          <div style="font-size:.72rem;color:#64748b;margin-top:2px" id="riskLabel"></div>
        </div>
      </div>

      <div class="result-section">
        <h3>🔍 Inspector</h3>
        <div class="result-text" id="inspectorOut">جارٍ التحليل...</div>
      </div>
      <div class="result-section">
        <h3>⚖️ Law Finder</h3>
        <div class="result-text" id="lawOut">جارٍ التحليل...</div>
      </div>
      <div class="result-section">
        <h3>✍️ Drafter</h3>
        <div class="result-text" id="drafterOut">جارٍ التحليل...</div>
      </div>

      <div class="actions">
        <button class="btn-primary" onclick="openConsultation()">💬 استشارة</button>
        <button class="btn-green" onclick="approveContract()">✅ Approved</button>
      </div>
    </div>
  </div>
</div>

<!-- Approve Overlay -->
<div id="overlay">
  <div class="overlay-box">
    <div class="icon">✅</div>
    <h2>تمت الموافقة</h2>
    <p>العقد جاهز ولا يحتاج إلى تعديلات.<br>Contract is ready, no changes needed.</p>
    <button class="btn-green" onclick="closeOverlay()">إغلاق</button>
  </div>
</div>

<script>
let authMode = 'login';
let selectedContractId = null;
let pollTimer = null;
let isLoggedIn = false;

function switchTab(mode) {
  authMode = mode;
  document.querySelectorAll('.tab').forEach((t,i) => t.classList.toggle('active', i === (mode==='login'?0:1)));
}

async function api(method, path, body, isForm) {
  const opts = { method, credentials: 'include' };
  if (isForm) {
    opts.body = body;
  } else if (body) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  const r = await fetch('/api' + path, opts);
  return [r.status, await r.json()];
}

function showMsg(id, text, isOk) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'msg ' + (isOk ? 'ok' : 'err');
}

async function doAuth() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!email || !password) return showMsg('authMsg', 'أدخل البريد وكلمة المرور', false);
  const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
  const [status, data] = await api('POST', endpoint, { email, password });
  if (status === 200 || status === 201) {
    showMsg('authMsg', data.message || 'تم', true);
    isLoggedIn = true;
    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('userInfo').textContent = '✅ مسجّل: ' + email;
    loadHistory();
    startPolling();
  } else {
    showMsg('authMsg', data.error || 'خطأ', false);
  }
}

async function uploadPDF() {
  const file = document.getElementById('pdfFile').files[0];
  if (!file) return showMsg('uploadMsg', 'اختر ملف PDF أولاً', false);
  if (!isLoggedIn) return showMsg('uploadMsg', 'سجّل دخولك أولاً', false);
  showMsg('uploadMsg', '⏳ جارٍ الرفع...', true);
  const fd = new FormData();
  fd.append('file', file);
  const name = document.getElementById('contractName').value.trim();
  if (name) fd.append('contractName', name);
  const [status, data] = await api('POST', '/contracts/upload', fd, true);
  if (status === 201) {
    showMsg('uploadMsg', '✅ ' + (data.message || 'تم رفع العقد'), true);
    document.getElementById('simContractId').value = data.id;
    loadHistory();
  } else {
    showMsg('uploadMsg', data.error || 'فشل الرفع', false);
  }
}

async function simulateN8n() {
  const contractId = document.getElementById('simContractId').value.trim();
  if (!contractId) return showMsg('simMsg', 'أدخل Contract ID', false);
  const body = {
    contractId,
    risk_score: parseFloat(document.getElementById('simRisk').value) || 7.5,
    severity: document.getElementById('simSeverity').value || 'High',
    inspector_result: document.getElementById('simInspector').value,
    law_result: document.getElementById('simLaw').value,
    drafter_result: document.getElementById('simDrafter').value,
  };
  const [status, data] = await api('POST', '/dev/simulate-n8n/' + contractId, body);
  if (status === 200 || status === 201) {
    showMsg('simMsg', '✅ ' + (data.message || 'تم'), true);
    if (selectedContractId === contractId) loadAudit(contractId);
    loadHistory();
  } else {
    showMsg('simMsg', data.error || 'خطأ', false);
  }
}

async function loadHistory() {
  const [status, data] = await api('GET', '/contracts/history');
  if (status !== 200) return;
  const list = document.getElementById('contractList');
  if (!data.contracts || !data.contracts.length) {
    list.innerHTML = '<div class="empty">لا توجد عقود بعد</div>';
    return;
  }
  list.innerHTML = data.contracts.map(c => \`
    <div class="contract-row \${selectedContractId===c.id?'active':''}" onclick="selectContract('\${c.id}','\${escHtml(c.contractName)}')">
      <div class="contract-name">\${escHtml(c.contractName)}</div>
      <div class="contract-meta">
        <span class="status-badge \${c.status}">\${c.status}</span>
        &nbsp; \${new Date(c.createdAt).toLocaleString('ar-SA')}
        \${c.auditResult ? '&nbsp; 🎯 ' + c.auditResult.riskScore + '/10' : ''}
      </div>
    </div>
  \`).join('');
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function selectContract(id, name) {
  selectedContractId = id;
  document.getElementById('simContractId').value = id;
  document.getElementById('decisionRoom').style.display = 'block';
  document.getElementById('drContractName').textContent = name;
  document.getElementById('riskScore').textContent = '—';
  document.getElementById('severityTag').textContent = '—';
  document.getElementById('inspectorOut').textContent = 'جارٍ التحليل...';
  document.getElementById('lawOut').textContent = 'جارٍ التحليل...';
  document.getElementById('drafterOut').textContent = 'جارٍ التحليل...';
  document.getElementById('riskBar').style.width = '0%';
  await loadAudit(id);
  loadHistory();
}

async function loadAudit(id) {
  const [status, data] = await api('GET', '/audits/' + id);
  if (status !== 200) return;
  const score = data.riskScore ?? 0;
  const sev = data.severity || 'Low';
  document.getElementById('riskScore').textContent = score;
  document.getElementById('severityTag').textContent = sev;
  document.getElementById('riskSection').className = sev;
  document.getElementById('riskBar').style.width = (score * 10) + '%';
  const colors = { High:'#ef4444', Medium:'#f59e0b', Low:'#10b981' };
  document.getElementById('riskBar').style.background = colors[sev] || '#6366f1';
  document.getElementById('riskLabel').textContent = 'مستوى المخاطر: ' + sev;
  document.getElementById('inspectorOut').textContent = data.inspectorOutput || '—';
  document.getElementById('lawOut').textContent = data.lawFinderOutput || '—';
  document.getElementById('drafterOut').textContent = data.drafterOutput || '—';
}

function startPolling() {
  if (pollTimer) return;
  pollTimer = setInterval(async () => {
    if (!isLoggedIn) return;
    document.getElementById('pollIndicator').innerHTML = '<span class="spinner"></span> يتحقق...';
    await loadHistory();
    if (selectedContractId) await loadAudit(selectedContractId);
    document.getElementById('pollIndicator').textContent = 'آخر تحديث: ' + new Date().toLocaleTimeString('ar-SA');
  }, 5000);
}

async function openConsultation() {
  if (!selectedContractId) return;
  const [s, data] = await api('POST', '/stream/channel/' + selectedContractId);
  if (s === 200) {
    alert('✅ قناة الاستشارة جاهزة\\nChannel ID: ' + data.channelId + '\\n\\nيمكنك الاتصال بها عبر Stream Chat SDK في الواجهة الأمامية.');
  } else {
    alert('خطأ: ' + (data.error || 'فشل إنشاء القناة'));
  }
}

async function approveContract() {
  if (!selectedContractId) return;
  const [s] = await api('POST', '/audits/' + selectedContractId + '/action', { action: 'Approve' });
  if (s === 200) {
    document.getElementById('overlay').classList.add('show');
    loadHistory();
  }
}

function closeOverlay() {
  document.getElementById('overlay').classList.remove('show');
}
</script>
</body>
</html>`);
});

export default router;
