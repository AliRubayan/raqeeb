import { useState } from "react";
import { useGetContractHistory, getGetContractHistoryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, FileText, AlertTriangle, CheckCircle,
  Clock, Trash2, FilePlus, ChevronLeft,
  Activity, TrendingUp, Shield,
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

export function Dashboard() {
  const { data, isLoading } = useGetContractHistory();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (contractId: string) => {
    setDeletingId(contractId);
    try {
      const res = await fetch(`/api/contracts/${contractId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "فشل حذف العقد");
      }
      await queryClient.invalidateQueries({ queryKey: getGetContractHistoryQueryKey() });
      toast({ title: "تم حذف العقد بنجاح" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل الحذف", description: error.message });
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-sm text-[#94A3B8]">جاري تحميل العقود...</span>
        </div>
      </div>
    );
  }

  const contracts = data?.contracts || [];
  const completedContracts = contracts.filter((c) => c.status === "Completed" || c.status === "Ready");
  const highRiskCount = completedContracts.filter((c) => c.auditResult?.severity === "High").length;
  const avgRisk =
    completedContracts.length > 0
      ? (completedContracts.reduce((s, c) => s + Number(c.auditResult?.riskScore ?? 0), 0) /
          completedContracts.length).toFixed(1)
      : "—";

  const confirmContract = contracts.find((c) => c.id === confirmId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            مكتمل
          </span>
        );
      case "Ready":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            بانتظار القرار
          </span>
        );
      case "Analyzing":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-1 h-1 rounded-full bg-blue-400 rq-pulse-dot" />
            قيد التحليل
          </span>
        );
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            <span className="w-1 h-1 rounded-full bg-primary" />
            بانتظار البدء
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="w-1 h-1 rounded-full bg-red-400" />
            مرفوض
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 text-[#94A3B8] border border-border/40">
            {status}
          </span>
        );
    }
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    if (severity === "High")
      return <span className="rq-pill-high text-xs px-2 py-0.5 rounded-full font-medium">عالي المخاطر</span>;
    if (severity === "Medium")
      return <span className="rq-pill-medium text-xs px-2 py-0.5 rounded-full font-medium">متوسط المخاطر</span>;
    return <span className="rq-pill-low text-xs px-2 py-0.5 rounded-full font-medium">منخفض المخاطر</span>;
  };

  const getRiskBarColor = (score: number) => {
    if (score >= 7) return "bg-red-500";
    if (score >= 4) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">سجل العقود</h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            {contracts.length > 0
              ? `${contracts.length} عقد · ${completedContracts.length} مكتمل`
              : "ابدأ بتحليل أول عقد لك"}
          </p>
        </div>
        <Link href="/upload">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20">
            <FilePlus className="h-4 w-4" />
            تحليل عقد جديد
          </Button>
        </Link>
      </div>

      {/* ── Summary stats (only when there's data) ── */}
      {completedContracts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: Activity,
              label: "إجمالي العقود",
              value: contracts.length,
              sub: "كامل السجل",
            },
            {
              icon: TrendingUp,
              label: "متوسط المخاطر",
              value: `${avgRisk}/10`,
              sub: "العقود المكتملة",
            },
            {
              icon: Shield,
              label: "عالي المخاطر",
              value: highRiskCount,
              sub: "تحتاج مراجعة",
              accent: highRiskCount > 0,
            },
          ].map(({ icon: Icon, label, value, sub, accent }) => (
            <div
              key={label}
              className="rq-card rounded-xl p-5 rq-top-accent"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${accent ? "bg-red-500/10" : "bg-primary/10"}`}>
                  <Icon className={`h-4 w-4 ${accent ? "text-red-400" : "text-primary"}`} />
                </div>
              </div>
              <div className={`text-2xl font-black ${accent && Number(value) > 0 ? "text-red-400" : "text-white"}`}>
                {value}
              </div>
              <div className="text-sm font-medium text-white mt-1">{label}</div>
              <div className="text-xs text-[#94A3B8] mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Contract list ── */}
      {contracts.length === 0 ? (
        <div className="rq-card rounded-2xl border-dashed border-2 border-border/40 p-16 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <FileText className="h-8 w-8 text-primary/70" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">لا توجد عقود بعد</h3>
          <p className="text-[#94A3B8] text-sm mb-6 max-w-xs mx-auto">
            قم برفع أول عقد لتبدأ في الحصول على تحليل قانوني دقيق من رقيب
          </p>
          <Link href="/upload">
            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 gap-2">
              <FilePlus className="h-4 w-4" />
              رفع عقد الآن
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => {
            const riskScore = Number(contract.auditResult?.riskScore ?? 0);
            const riskPct = Math.min(100, riskScore * 10);

            return (
              <div key={contract.id} className="relative group">
                <Link href={`/contracts/${contract.id}`}>
                  <div className="rq-card rounded-xl p-5 hover:border-primary/30 hover:rq-glow-teal transition-all duration-200 cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: name + meta */}
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-[#1E2D45] border border-border/40 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="h-5 w-5 text-[#94A3B8]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-white truncate max-w-[300px]">
                              {contract.contractName}
                            </h3>
                            {getStatusBadge(contract.status)}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                            <span dir="ltr">
                              {format(new Date(contract.createdAt), "dd MMM yyyy", { locale: arSA })}
                            </span>
                            <span className="text-border">·</span>
                            <span className="font-mono">{contract.id.substring(0, 8)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: risk score + severity */}
                      <div className="flex items-center gap-4 shrink-0">
                        {contract.auditResult ? (
                          <div className="text-left min-w-[100px]">
                            <div className="flex items-baseline gap-1 mb-1.5">
                              <span className={`text-xl font-black ${
                                riskScore >= 7 ? "text-red-400" : riskScore >= 4 ? "text-amber-400" : "text-emerald-400"
                              }`}>
                                {riskScore.toFixed(1)}
                              </span>
                              <span className="text-xs text-[#94A3B8]">/10</span>
                            </div>
                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                              <div
                                className={`h-full rounded-full transition-all ${getRiskBarColor(riskScore)}`}
                                style={{ width: `${riskPct}%` }}
                              />
                            </div>
                            {getSeverityBadge(contract.auditResult.severity)}
                          </div>
                        ) : contract.status === "Analyzing" ? (
                          <div className="flex items-center gap-1.5 text-xs text-blue-400">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            جاري التحليل
                          </div>
                        ) : (
                          <span className="text-xs text-[#94A3B8]">—</span>
                        )}

                        <ChevronLeft className="h-4 w-4 text-[#94A3B8]/40 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Delete button */}
                <button
                  className="absolute top-4 left-4 h-7 w-7 rounded-lg bg-[#111827] border border-border/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:border-red-500/30 text-[#94A3B8] hover:text-red-400 z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmId(contract.id);
                  }}
                  disabled={deletingId === contract.id}
                >
                  {deletingId === contract.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete confirm dialog ── */}
      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent className="bg-[#111827] border-[#1E2D45]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">حذف العقد</AlertDialogTitle>
            <AlertDialogDescription className="text-[#94A3B8]">
              هل أنت متأكد من حذف عقد «{confirmContract?.contractName}»؟
              <br />
              لا يمكن التراجع عن هذا الإجراء وستُحذف جميع نتائج التحليل.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="border-border/40 text-[#94A3B8] hover:text-white hover:bg-white/5">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => confirmId && handleDelete(confirmId)}
            >
              حذف العقد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
