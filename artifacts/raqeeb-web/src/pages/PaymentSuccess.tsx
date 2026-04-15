import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"verifying" | "dispatching" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  const contractId = new URLSearchParams(window.location.search).get("contractId");

  useEffect(() => {
    if (!contractId) {
      setStatus("error");
      setErrorMsg("لم يتم العثور على رقم العقد في الرابط");
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    async function verifyAndDispatch() {
      try {
        const verifyRes = await fetch(`/api/payments/verify/${contractId}`, {
          credentials: "include",
        });

        if (!verifyRes.ok) throw new Error("فشل التحقق من الدفع");

        const verifyData = await verifyRes.json();

        if (verifyData.paid) {
          setStatus("dispatching");

          const startRes = await fetch("/api/audits/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ contractId }),
          });

          if (!startRes.ok) {
            const err = await startRes.json().catch(() => null);
            throw new Error(err?.error || "فشل بدء التحليل");
          }

          setLocation(`/contracts/${contractId}`);
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          setStatus("error");
          setErrorMsg("تعذّر التحقق من الدفع. يرجى التواصل مع الدعم.");
          return;
        }

        setTimeout(verifyAndDispatch, 2000);
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "حدث خطأ غير متوقع");
      }
    }

    verifyAndDispatch();
  }, [contractId, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "verifying" && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">جاري التحقق من الدفع</h1>
              <p className="text-muted-foreground mt-2">
                يرجى الانتظار بينما نتحقق من اكتمال عملية الدفع...
              </p>
            </div>
          </>
        )}

        {status === "dispatching" && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">تم الدفع بنجاح</h1>
              <p className="text-muted-foreground mt-2">
                جاري إرسال عقدك إلى وكلاء الذكاء الاصطناعي للتحليل...
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">تعذّر التحقق</h1>
              <p className="text-muted-foreground mt-2">{errorMsg}</p>
            </div>
            <div className="flex flex-col gap-3">
              {contractId && (
                <Button onClick={() => setLocation(`/contracts/${contractId}`)}>
                  الانتقال إلى غرفة القرار
                </Button>
              )}
              <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                العودة إلى لوحة القيادة
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
