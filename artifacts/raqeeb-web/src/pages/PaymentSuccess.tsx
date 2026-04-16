import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Stage = "verifying" | "dispatching" | "done" | "error";

export function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState<Stage>("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  const params = new URLSearchParams(window.location.search);
  const contractId = params.get("contractId");
  const isSubscriptionFlow = params.get("type") === "subscription";
  const subscriptionLinkId = params.get("linkId");

  useEffect(() => {
    // ── Subscription-only flow (no contract) ──
    if (isSubscriptionFlow) {
      if (!subscriptionLinkId) {
        setStage("error");
        setErrorMsg("رابط الدفع مفقود. يرجى التواصل مع الدعم.");
        return;
      }

      let attempts = 0;
      const maxAttempts = 10;

      async function verifySubscription() {
        try {
          const res = await fetch("/api/payments/verify-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ linkId: subscriptionLinkId }),
          });

          if (!res.ok) throw new Error("فشل التحقق من الدفع");
          const data = await res.json();

          if (data.subscribed) {
            setStage("done");
            // Hard redirect so ProtectedLayout re-fetches the updated user state
            setTimeout(() => {
              window.location.replace(import.meta.env.BASE_URL + "dashboard");
            }, 1200);
            return;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            setStage("error");
            setErrorMsg("تعذّر التحقق من الدفع. يرجى التواصل مع الدعم.");
            return;
          }
          setTimeout(verifySubscription, 2000);
        } catch (err: unknown) {
          setStage("error");
          setErrorMsg(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
        }
      }

      verifySubscription();
      return;
    }

    // ── Contract-payment flow ──
    if (!contractId) {
      setStage("error");
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
          setStage("dispatching");

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

          setStage("done");
          setTimeout(() => setLocation(`/contracts/${contractId}`), 1200);
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          setStage("error");
          setErrorMsg("تعذّر التحقق من الدفع. يرجى التواصل مع الدعم.");
          return;
        }

        setTimeout(verifyAndDispatch, 2000);
      } catch (err: unknown) {
        setStage("error");
        setErrorMsg(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
      }
    }

    verifyAndDispatch();
  }, [contractId, isSubscriptionFlow, setLocation]);

  const stageIndex = { verifying: 0, dispatching: 1, done: 2, error: -1 }[stage];

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-sm text-center space-y-7">
        {/* Logo */}
        <img
          src="/rqeeb-logo.png"
          alt="رقيب"
          className="w-12 h-12 object-contain mx-auto opacity-75"
        />

        {stage === "error" ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">تعذّر التحقق من الدفع</h2>
              <p className="text-sm text-[#94A3B8]">{errorMsg}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                className="border-[#1E2D45] text-[#94A3B8] hover:text-white hover:bg-white/5 rounded-xl"
              >
                لوحة القيادة
              </Button>
              {contractId && (
                <Button
                  onClick={() => setLocation(`/contracts/${contractId}`)}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl"
                >
                  عرض العقد
                </Button>
              )}
            </div>
          </>
        ) : stage === "done" ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">تمّ الدفع بنجاح</h2>
              <p className="text-sm text-[#94A3B8]">
                {isSubscriptionFlow ? "جاري تحويلك إلى لوحة القيادة..." : "جاري تحويلك إلى غرفة القرار..."}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">
                {stage === "verifying" ? "جاري التحقق من الدفع..." : "جاري بدء التحليل..."}
              </h2>
              <p className="text-sm text-[#94A3B8]">
                {stage === "verifying"
                  ? "يرجى الانتظار بينما نتحقق من عملية الدفع"
                  : "يتم إرسال العقد إلى وكلاء الذكاء الاصطناعي"}
              </p>
            </div>
            {/* Progress track */}
            <div className="flex justify-center gap-2 pt-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    stageIndex >= i ? "bg-primary w-8" : "bg-[#1E2D45] w-2"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
