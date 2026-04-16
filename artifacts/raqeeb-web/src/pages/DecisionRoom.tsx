import { useParams, useLocation } from "wouter";
import {
  useGetContract,
  getGetContractQueryKey,
  useGetAuditResult,
  getGetAuditResultQueryKey,
  useAuditAction,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Loader2, AlertTriangle, ShieldAlert, Scale, PenTool,
  CheckCircle, MessageSquare, Send, Bot, User, XCircle,
  ArrowRight, Calendar, Check,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseN8nOutput } from "@/lib/parseN8nOutput";

// ── Analyzing progress view ───────────────────────────────────────────────

const AGENTS = [
  {
    id: "inspector",
    icon: ShieldAlert,
    label: "المفتش",
    color: "#0D9488",
    messages: [
      "يقرأ بنود العقد...",
      "يحلل المواد المالية...",
      "يرصد المخاطر والثغرات...",
      "يدقق في شروط الإنهاء...",
    ],
  },
  {
    id: "lawfinder",
    icon: Scale,
    label: "الباحث القانوني",
    color: "#6366F1",
    messages: [
      "يبحث في المنظومة التشريعية...",
      "يراجع لوائح هيئة السوق...",
      "يقيّم مدى الامتثال النظامي...",
      "يوثّق المراجع القانونية...",
    ],
  },
  {
    id: "drafter",
    icon: PenTool,
    label: "المحامي",
    color: "#F59E0B",
    messages: [
      "يصيغ التوصيات القانونية...",
      "يعدّ مسودة التعديلات...",
      "يراجع صياغة البنود...",
      "ينهي التقرير النهائي...",
    ],
  },
];

const TOTAL_MS = 180_000; // 3 min — normal fill target
const COMPLETE_MS = 5_000; // 5 s — sprint to 100% when n8n finishes

function AnalyzingView({ isReady, onComplete }: { isReady: boolean; onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0); // agents appear 1-by-1
  const [msgIdx, setMsgIdx] = useState([0, 0, 0]);
  const startRef = useRef(Date.now());
  const completingRef = useRef(false);
  const progressRef = useRef(0); // shadow ref so sprint closure can read latest

  // ── Agents appear one at a time ──
  useEffect(() => {
    const t1 = setTimeout(() => setVisibleCount(1), 200);
    const t2 = setTimeout(() => setVisibleCount(2), 2400);
    const t3 = setTimeout(() => setVisibleCount(3), 4600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // ── Slow fill: 0 → 95% over 3 minutes ──
  useEffect(() => {
    if (isReady) return;
    const id = setInterval(() => {
      const pct = Math.min(95, ((Date.now() - startRef.current) / TOTAL_MS) * 100);
      progressRef.current = pct;
      setProgress(Math.round(pct));
    }, 300);
    return () => clearInterval(id);
  }, [isReady]);

  // ── Sprint: remaining → 100% over 5 s when n8n done ──
  useEffect(() => {
    if (!isReady || completingRef.current) return;
    completingRef.current = true;
    const sprintStart = Date.now();
    const startPct = progressRef.current;
    const remaining = 100 - startPct;
    const id = setInterval(() => {
      const elapsed = Date.now() - sprintStart;
      const pct = Math.min(100, startPct + remaining * (elapsed / COMPLETE_MS));
      progressRef.current = pct;
      setProgress(Math.round(pct));
      if (pct >= 100) {
        clearInterval(id);
        setTimeout(onComplete, 600);
      }
    }, 30);
    return () => clearInterval(id);
  }, [isReady, onComplete]);

  // ── Message rotation ──
  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx((prev) => prev.map((v, i) => (v + 1) % AGENTS[i].messages.length));
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const isComplete = progress >= 100;

  const getAgentState = (i: number): "waiting" | "active" | "done" => {
    if (isComplete) return "done";
    // each agent spans 1/3 of the 0-95 range
    const lo = (i / 3) * 95;
    const hi = ((i + 1) / 3) * 95;
    if (progress < lo) return "waiting";
    if (progress >= hi) return "done";
    return "active";
  };

  return (
    <div className="rq-card rounded-2xl p-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white">
          {isComplete ? "اكتمل التحليل" : "وكلاء الذكاء الاصطناعي يعملون"}
        </h3>
        <p className="text-sm text-[#94A3B8]">
          {isComplete
            ? "تم تحليل العقد — جاري تحميل النتائج..."
            : "يقوم المفتش والباحث القانوني والمحامي بقراءة وتحليل بنود العقد"}
        </p>
      </div>

      {/* Agent cards — appear one by one */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {AGENTS.map((agent, i) => {
          const state = getAgentState(i);
          const Icon = agent.icon;
          const visible = visibleCount > i;
          return (
            <div
              key={agent.id}
              className={`rounded-xl border p-4 transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
              } ${
                state === "active"
                  ? "bg-white/[0.04] border-primary/30"
                  : state === "done"
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-white/[0.02] border-[#1E2D45]"
              }`}
              style={{ transitionDelay: visible ? `${i * 80}ms` : "0ms" }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-700 ${
                    state === "active"
                      ? "bg-primary/15 border border-primary/30"
                      : state === "done"
                      ? "bg-emerald-500/15 border border-emerald-500/30"
                      : "bg-white/5 border border-[#1E2D45]"
                  }`}
                >
                  {state === "done" ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Icon className={`h-4 w-4 ${state === "active" ? "text-primary" : "text-[#94A3B8]"}`} />
                  )}
                </div>
                <span
                  className={`text-sm font-semibold transition-colors duration-700 ${
                    state === "active" ? "text-white" : state === "done" ? "text-emerald-400" : "text-[#94A3B8]"
                  }`}
                >
                  {agent.label}
                </span>
                {state === "active" && (
                  <div className="mr-auto flex gap-0.5">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-1 h-1 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <p
                className={`text-xs leading-relaxed transition-colors duration-700 ${
                  state === "active" ? "text-[#94A3B8]" : state === "done" ? "text-emerald-500/70" : "text-[#94A3B8]/40"
                }`}
              >
                {state === "waiting" ? "في الانتظار..." : state === "done" ? "اكتمل التحليل ✓" : agent.messages[msgIdx[i]]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5 max-w-xs mx-auto w-full">
        <div className="flex justify-between items-center text-[11px] text-[#94A3B8]">
          <span>{isComplete ? "بانتظار القرار" : "التقدم"}</span>
          <span className="font-mono">{progress}%</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-[#1E2D45]">
          <div
            className={`h-full rounded-full ${isComplete ? "bg-emerald-500" : "bg-primary"}`}
            style={{ width: `${progress}%`, transition: "width 0.3s linear" }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Sanitize display text (replace em-dashes with commas) ──────────────────

function sanitize(text: string): string {
  return text.replace(/\s*—\s*/g, "، ").replace(/\s*-{2,}\s*/g, "، ");
}

// ── Field component (right-border accent card) ──────────────────────────────

const ACCENT = {
  red:    { bar: "bg-red-500",    bg: "bg-red-500/6",    label: "text-red-400",     icon: "🔴" },
  green:  { bar: "bg-emerald-500",bg: "bg-emerald-500/6",label: "text-emerald-400", icon: "🟢" },
  orange: { bar: "bg-amber-500",  bg: "bg-amber-500/6",  label: "text-amber-400",   icon: "🟡" },
  teal:   { bar: "bg-primary",    bg: "bg-primary/6",    label: "text-primary",     icon: "🔵" },
  none:   { bar: "bg-[#1E2D45]",  bg: "bg-white/3",      label: "text-[#64748B]",   icon: "" },
};

function Field({
  label, value, mono = false,
  highlight,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  highlight?: "red" | "green" | "orange" | "teal";
}) {
  if (!value || value.trim() === "" || value.toLowerCase() === "n/a" || value.toLowerCase() === "not found") return null;
  const accent = ACCENT[highlight ?? "none"];
  const clean = sanitize(value);

  return (
    <div className={`relative flex rounded-xl overflow-hidden ${accent.bg}`} dir="rtl">
      {/* Right accent bar */}
      <div className={`w-1 shrink-0 ${accent.bar} opacity-70`} />
      <div className="flex-1 px-4 py-3.5 space-y-1.5 min-w-0 text-right">
        <p className={`text-[10px] font-extrabold uppercase tracking-[0.15em] ${accent.label}`}>
          {label}
        </p>
        <p className={`text-sm leading-7 whitespace-pre-wrap text-white/90 ${mono ? "font-mono text-xs" : ""}`}>
          {clean}
        </p>
      </div>
    </div>
  );
}

// ── Inspector panel ──────────────────────────────────────────────────────────

function InspectorPanel({ raw }: { raw?: string }) {
  const d = parseN8nOutput(raw ?? "");
  const violationVal = d["VIOLATION_FOUND"] ?? "";
  const violated = /yes|نعم|true|1/i.test(violationVal);

  if (!raw || Object.keys(d).length === 0) {
    return <p className="text-[#94A3B8] text-sm">لا توجد مخرجات متوفرة من المفتش.</p>;
  }

  return (
    <div className="space-y-2.5">
      {/* ── Verdict banner ── */}
      <div dir="rtl" className={`flex items-center gap-4 rounded-xl px-5 py-4 text-right ${
        violated ? "bg-red-500/8" : "bg-emerald-500/8"
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          violated ? "bg-red-500/15" : "bg-emerald-500/15"
        }`}>
          {violated
            ? <XCircle className="h-5 w-5 text-red-400" />
            : <CheckCircle className="h-5 w-5 text-emerald-400" />
          }
        </div>
        <div className="flex-1">
          <p className={`font-bold text-sm ${violated ? "text-red-300" : "text-emerald-300"}`}>
            {violated ? "تم رصد انتهاك في هذا العقد" : "لم تُرصد انتهاكات في هذا العقد"}
          </p>
          {d["SEVERITY"] && (
            <p className="text-xs text-[#94A3B8] mt-1">
              درجة الخطورة:{" "}
              <span className={`font-bold ${violated ? "text-red-300" : "text-emerald-300"}`}>
                {sanitize(d["SEVERITY"])}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* ── Detail fields ── */}
      <Field label="البند المخالف" value={d["CLAUSE"]} highlight={violated ? "red" : undefined} />
      <Field label="المشكلة والانتهاك" value={d["ISSUE"]} highlight={violated ? "orange" : undefined} />
      <Field label="المرجع القانوني" value={d["LAW"]} highlight="teal" />
      <Field label="تقدير المخاطر" value={d["RISK"]} />
    </div>
  );
}

// ── Law Finder panel ─────────────────────────────────────────────────────────

function LawFinderPanel({ raw }: { raw?: string }) {
  const d = parseN8nOutput(raw ?? "");
  if (!raw || Object.keys(d).length === 0) {
    return <p className="text-[#94A3B8] text-sm">لا توجد مخرجات متوفرة من الباحث القانوني.</p>;
  }
  const fixable = /yes|نعم/i.test(d["FIXABLE"] ?? "");
  const confirmed = /confirmed|مؤكد/i.test(d["CONFIRMATION"] ?? "");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 mb-1">
        {d["LAW_CODE"] && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 border border-[#1E2D45] text-[#94A3B8]">
            {d["LAW_CODE"]}
          </span>
        )}
        {d["AUTHORITY"] && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
            {d["AUTHORITY"]}
          </span>
        )}
        {fixable && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            قابل للإصلاح
          </span>
        )}
        {confirmed && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
            مؤكد
          </span>
        )}
      </div>
      <Field label="اسم النظام / القانون" value={d["LAW_NAME"]} highlight="teal" />
      <Field label="النص القانوني" value={d["LEGAL_TEXT"]} mono />
      <Field label="العقوبة / الجزاء" value={d["PENALTY"]} highlight="red" />
      <Field label="الأثر التجاري" value={d["BUSINESS_IMPACT"]} highlight="orange" />
      <Field label="احتمالية التطبيق" value={d["ENFORCEMENT_LIKELIHOOD"]} />
    </div>
  );
}

// ── Drafter panel ────────────────────────────────────────────────────────────

function DrafterPanel({ raw }: { raw?: string }) {
  const d = parseN8nOutput(raw ?? "");
  if (!raw || Object.keys(d).length === 0) {
    return <p className="text-[#94A3B8] text-sm">لا توجد مخرجات متوفرة من المحامي.</p>;
  }

  return (
    <div className="space-y-3">
      <Field label="البند الأصلي" value={d["ORIGINAL_CLAUSE"]} highlight="red" />
      <Field label="ملخص المخالفة" value={d["VIOLATION_SUMMARY"]} highlight="orange" />

      {(d["REPLACEMENT_CLAUSE_AR"] || d["REPLACEMENT_CLAUSE_EN"]) && (
        <div className="relative flex rounded-xl overflow-hidden bg-emerald-500/6">
          <div className="w-1.5 shrink-0 bg-emerald-500 opacity-70" />
          <div className="flex-1 px-4 py-3.5 space-y-3 min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-emerald-400 flex items-center gap-2">
              <PenTool className="h-3 w-3" />
              البند البديل المقترح
            </p>
            {d["REPLACEMENT_CLAUSE_AR"] && (
              <div>
                <p className="text-[10px] font-bold text-[#94A3B8] mb-1.5 uppercase tracking-wider">عربي</p>
                <p className="text-sm leading-7 whitespace-pre-wrap text-white/90">{sanitize(d["REPLACEMENT_CLAUSE_AR"])}</p>
              </div>
            )}
            {d["REPLACEMENT_CLAUSE_EN"] && (
              <div>
                <p className="text-[10px] font-bold text-[#94A3B8] mb-1.5 uppercase tracking-wider">English</p>
                <p className="text-sm leading-7 whitespace-pre-wrap text-white/90" dir="ltr">{sanitize(d["REPLACEMENT_CLAUSE_EN"])}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Field label="المرجع القانوني" value={d["LAW_REFERENCE"]} highlight="teal" />
      <Field label="ملاحظات الامتثال" value={d["COMPLIANCE_NOTES"]} highlight="green" />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  loading?: boolean;
  isError?: boolean;
  retryable?: boolean;
}

export function DecisionRoom() {
  const params = useParams();
  const id = params.id as string;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSuccessOverlayOpen, setIsSuccessOverlayOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const everAnalyzed = useRef(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "مرحباً، أنا مساعدك القانوني لهذا العقد. يمكنك سؤالي عن أي بند أو مخاطرة وردت في التحليل.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: contract, isLoading: isContractLoading } = useGetContract(id, {
    query: {
      enabled: !!id,
      queryKey: getGetContractQueryKey(id),
      refetchInterval: (query) =>
        query.state.data?.status === "Analyzing" ? 5000 : false,
    },
  });

  const { data: auditResult } = useGetAuditResult(id, {
    query: {
      enabled: !!id && (contract?.status === "Ready" || contract?.status === "Completed"),
      queryKey: getGetAuditResultQueryKey(id),
    },
  });

  const auditAction = useAuditAction();

  const handleApprove = () => {
    auditAction.mutate(
      { contractId: id, data: { action: "Approve" } },
      {
        onSuccess: () => {
          setIsSuccessOverlayOpen(true);
          queryClient.invalidateQueries({ queryKey: getGetContractQueryKey(id) });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "خطأ",
            description: error.error || "حدث خطأ أثناء الموافقة على العقد",
          });
        },
      }
    );
  };

  const sendChatMessage = async (msg: string) => {
    setChatMessages((prev) => [
      ...prev,
      { role: "user", text: msg },
      { role: "assistant", text: "", loading: true },
    ]);
    setIsSending(true);
    setLastFailedMessage(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contractId: id, message: msg }),
      });

      const data = await res.json();

      if (!res.ok) {
        const retryable = !!data?.retryable;
        const errorText = data?.error || "فشل الاتصال بالمساعد، يرجى المحاولة مرة أخرى.";
        if (retryable) setLastFailedMessage(msg);
        setChatMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1
              ? { role: "assistant", text: errorText, loading: false, isError: true, retryable }
              : m
          )
        );
        return;
      }

      setChatMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { role: "assistant", text: data.reply, loading: false } : m
        )
      );
    } catch {
      setChatMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { role: "assistant", text: "تعذّر الاتصال بالمساعد.", loading: false, isError: true, retryable: true }
            : m
        )
      );
      setLastFailedMessage(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || isSending) return;
    setChatInput("");
    await sendChatMessage(msg);
  };

  const handleRetry = async () => {
    if (!lastFailedMessage || isSending) return;
    const msg = lastFailedMessage;
    setChatMessages((prev) => prev.slice(0, -1));
    await sendChatMessage(msg);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (isContractLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-[#94A3B8] text-sm">جاري تحميل بيانات العقد...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-white text-lg font-medium">لم يتم العثور على العقد</p>
          <Button onClick={() => setLocation("/dashboard")} variant="outline"
            className="border-[#1E2D45] text-[#94A3B8] hover:text-white hover:bg-white/5">
            العودة للوحة القيادة
          </Button>
        </div>
      </div>
    );
  }

  const isAnalyzing = contract.status === "Analyzing" || contract.status === "Paid";

  // Track whether we ever saw an Analyzing state this session.
  // Also auto-show results immediately if contract is already Ready/Completed on load.
  useEffect(() => {
    if (isAnalyzing) {
      everAnalyzed.current = true;
    } else if (!everAnalyzed.current) {
      // Contract was already done when page loaded — skip the animation
      setShowResults(true);
    }
  }, [isAnalyzing]);
  const riskScore = Number(auditResult?.riskScore ?? 0);
  const riskPercentage = Math.min(100, Math.max(0, riskScore * 10));

  const riskColor = riskScore >= 7 ? "#EF4444" : riskScore >= 4 ? "#F59E0B" : "#10B981";
  const riskLabel =
    auditResult?.severity === "High" ? "عالي" : auditResult?.severity === "Medium" ? "متوسط" : "منخفض";
  const riskPillClass =
    auditResult?.severity === "High"
      ? "rq-pill-high"
      : auditResult?.severity === "Medium"
      ? "rq-pill-medium"
      : "rq-pill-low";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="rq-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 border border-[#1E2D45] text-[#94A3B8]">
                {contract.id.substring(0, 8)}
              </span>
              {isAnalyzing ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  جاري التحليل
                </span>
              ) : contract.status === "Completed" ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  مكتمل
                </span>
              ) : contract.status === "Ready" ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  بانتظار القرار
                </span>
              ) : (
                <span className="text-xs text-[#94A3B8]">{contract.status}</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight truncate">
              {contract.contractName || "عقد بدون عنوان"}
            </h1>
            <p className="text-[#94A3B8] text-sm mt-1.5">
              غرفة القرار — تحليل شامل من ثلاثة وكلاء متخصصين
            </p>
          </div>

          {showResults && (contract.status === "Ready" || contract.status === "Completed") && (
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                className="border-[#1E2D45] text-[#94A3B8] hover:text-white hover:bg-white/5 hover:border-primary/30 gap-2"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageSquare className="h-4 w-4" />
                استشارة
              </Button>
              {contract.status === "Ready" && (
                <Button
                  className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20"
                  onClick={handleApprove}
                  disabled={auditAction.isPending}
                >
                  {auditAction.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  موافقة على العقد
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      {!showResults ? (
        <AnalyzingView
          isReady={!isAnalyzing}
          onComplete={() => setShowResults(true)}
        />
      ) : auditResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── AI Agent Tabs (RIGHT in RTL — first in DOM) ── */}
          <div className="lg:col-span-2">
            <div className="rq-card rounded-2xl overflow-hidden h-full flex flex-col">
              <Tabs defaultValue="inspector" className="w-full flex flex-col flex-1">
                {/* Tab bar */}
                <div className="border-b border-[#1E2D45] px-4 pt-3 bg-[#0A0E1A]/50" dir="rtl">
                  <TabsList className="w-full grid grid-cols-3 bg-transparent gap-1 h-auto p-0">
                    {[
                      { value: "inspector", icon: ShieldAlert, label: "المفتش" },
                      { value: "lawfinder", icon: Scale, label: "الباحث" },
                      { value: "drafter", icon: PenTool, label: "المحامي" },
                    ].map(({ value, icon: Icon, label }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="flex items-center gap-2 rounded-none rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-[#94A3B8] hover:text-white pb-2.5 transition-all"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="text-sm font-medium">{label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto max-h-[600px]">
                  <TabsContent value="inspector" className="m-0 p-5">
                    <InspectorPanel raw={auditResult.inspectorOutput} />
                  </TabsContent>
                  <TabsContent value="lawfinder" className="m-0 p-5">
                    <LawFinderPanel raw={auditResult.lawFinderOutput} />
                  </TabsContent>
                  <TabsContent value="drafter" className="m-0 p-5">
                    <DrafterPanel raw={auditResult.drafterOutput} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>

          {/* ── Risk sidebar (LEFT in RTL — second in DOM) ── */}
          <div className="space-y-4">
            {/* Risk score card */}
            <div className="rq-card rounded-2xl overflow-hidden">
              <div className="h-1 w-full" style={{
                background: `linear-gradient(90deg, ${riskColor} 0%, ${riskColor}40 100%)`
              }} />
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-5">
                  مؤشر المخاطر الإجمالي
                </p>
                <div className="flex flex-col items-center py-2">
                  <div
                    className="text-6xl font-black mb-1 tabular-nums"
                    style={{ color: riskColor }}
                  >
                    {riskScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-[#94A3B8] mb-6">من 10.0</div>

                  <div className="w-full">
                    <div className="flex justify-between text-xs font-medium mb-2">
                      <span className="text-[#94A3B8]">مستوى الخطر</span>
                      <span className={riskPillClass + " px-2 py-0.5 rounded-full text-xs"}>
                        {riskLabel}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${riskPercentage}%`, background: riskColor }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta card */}
            <div className="rq-card rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4">
                معلومات التدقيق
              </p>
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-4 w-4 text-[#94A3B8] shrink-0" />
                <span className="text-[#94A3B8] text-xs">تاريخ التحليل</span>
                <span className="font-medium text-white text-xs mr-auto" dir="ltr">
                  {new Date(auditResult.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>
            </div>
          </div>
        </div>

      ) : (
        <div className="rq-card rounded-2xl flex h-64 items-center justify-center">
          <p className="text-[#94A3B8]">لا توجد نتائج تدقيق متوفرة لهذا العقد.</p>
        </div>
      )}

      {/* ── Legal Chat Sheet ─────────────────────────────────────────────── */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent side="right" className="w-full sm:w-[440px] flex flex-col p-0 bg-[#0A0E1A] border-[#1E2D45]" dir="rtl">
          <SheetHeader className="px-5 py-4 border-b border-[#1E2D45] bg-[#111827]">
            <SheetTitle className="flex items-center gap-2.5 text-sm text-white">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              استشارة قانونية — رقيب
            </SheetTitle>
            <p className="text-xs text-[#94A3B8] mt-1">اسأل عن أي بند أو مخاطرة وردت في تحليل هذا العقد</p>
          </SheetHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-[#1E2D45] border border-[#1E2D45]"
                }`}>
                  {msg.role === "user"
                    ? <User className="h-3.5 w-3.5" />
                    : <Bot className="h-3.5 w-3.5 text-primary" />
                  }
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : msg.isError
                    ? "bg-amber-500/8 border border-amber-500/20 text-amber-300 rounded-tl-sm"
                    : "bg-[#111827] border border-[#1E2D45] text-white/90 rounded-tl-sm"
                }`}>
                  {msg.loading ? (
                    <div className="flex items-center gap-1.5 py-0.5">
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                    </div>
                  ) : msg.isError ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                        <span className="whitespace-pre-wrap">{msg.text}</span>
                      </div>
                      {msg.retryable && lastFailedMessage && (
                        <button
                          onClick={handleRetry}
                          disabled={isSending}
                          className="text-xs font-semibold underline underline-offset-2 text-amber-400 hover:opacity-80 disabled:opacity-50"
                        >
                          إعادة المحاولة
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-[#1E2D45] bg-[#111827]">
            <div className="flex gap-2 items-end">
              <textarea
                className="flex-1 resize-none rounded-xl border border-[#1E2D45] bg-[#0A0E1A] px-3.5 py-2.5 text-sm text-white placeholder:text-[#94A3B8]/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 min-h-[42px] max-h-[120px] transition-colors"
                placeholder="اكتب سؤالك هنا..."
                value={chatInput}
                rows={1}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isSending}
              />
              <Button
                size="icon"
                className="shrink-0 rounded-xl h-[42px] w-[42px] bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
                onClick={handleSendMessage}
                disabled={isSending || !chatInput.trim()}
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-[#94A3B8]/60 mt-1.5 text-center">Enter للإرسال · Shift+Enter لسطر جديد</p>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Success overlay ──────────────────────────────────────────────── */}
      {isSuccessOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0E1A]/90 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rq-card rounded-2xl p-8 flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-300 border-emerald-500/20">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">تمت الموافقة</h2>
            <p className="text-[#94A3B8] mb-1">العقد جاهز، لا يحتاج إلى تعديلات</p>
            <p className="text-[#94A3B8]/60 text-sm mb-8" dir="ltr">Contract is ready, no changes needed</p>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-11"
              onClick={() => {
                setIsSuccessOverlayOpen(false);
                setLocation("/dashboard");
              }}
            >
              <ArrowRight className="h-4 w-4" />
              العودة للوحة القيادة
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
