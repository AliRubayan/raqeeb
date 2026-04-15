import { useState } from "react";
import { useGetContractHistory, getGetContractHistoryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, FileText, AlertTriangle, CheckCircle, Clock, Trash2 } from "lucide-react";
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
      toast({
        variant: "destructive",
        title: "فشل الحذف",
        description: error.message,
      });
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const contracts = data?.contracts || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-600 hover:bg-green-700">مكتمل</Badge>;
      case "Analyzing":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">قيد التحليل</Badge>;
      case "Paid":
        return <Badge variant="outline" className="border-primary text-primary">بانتظار البدء</Badge>;
      case "Rejected":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "High":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "Medium":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "Low":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "High": return "عالي المخاطر";
      case "Medium": return "متوسط المخاطر";
      case "Low": return "منخفض المخاطر";
      default: return "-";
    }
  };

  const confirmContract = contracts.find((c) => c.id === confirmId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">سجل العقود</h1>
          <p className="text-muted-foreground mt-1">عرض جميع العقود التي تم تحليلها أو قيد التحليل</p>
        </div>
        <Link href="/upload">
          <Button>تحليل عقد جديد</Button>
        </Link>
      </div>

      {contracts.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-muted p-4 rounded-full mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">لا توجد عقود بعد</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              قم برفع أول عقد لك للبدء في استخدام قوة التحليل الآلي من رقيب
            </p>
            <Link href="/upload">
              <Button variant="outline">رفع عقد الآن</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
            <div key={contract.id} className="relative group">
              <Link href={`/contracts/${contract.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-border/60 hover:border-primary/30">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      {getStatusBadge(contract.status)}
                      <span className="text-xs text-muted-foreground" dir="ltr">
                        {format(new Date(contract.createdAt), "dd MMM yyyy", { locale: arSA })}
                      </span>
                    </div>
                    <CardTitle className="text-xl line-clamp-1 pl-8">{contract.contractName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contract.auditResult ? (
                      <div className="bg-muted/30 rounded-lg p-4 mt-2">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">مؤشر المخاطر</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold">{contract.auditResult.riskScore}/10</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(contract.auditResult.severity)}
                          <span className="text-sm font-medium">{getSeverityLabel(contract.auditResult.severity)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/30 rounded-lg p-4 mt-2 h-[88px] flex items-center justify-center text-muted-foreground text-sm">
                        {contract.status === "Analyzing" ? "جاري التحليل..." : "لا توجد نتائج بعد"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 left-3 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmId(contract.id);
                }}
                disabled={deletingId === contract.id}
              >
                {deletingId === contract.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف العقد</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف عقد «{confirmContract?.contractName}»؟
              <br />
              لا يمكن التراجع عن هذا الإجراء وستُحذف جميع نتائج التحليل المرتبطة به.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
