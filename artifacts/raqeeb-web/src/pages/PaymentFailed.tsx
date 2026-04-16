import { useLocation } from "wouter";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaymentFailed() {
  const [, setLocation] = useLocation();
  const contractId = new URLSearchParams(window.location.search).get("contractId");

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-sm text-center space-y-7">
        {/* Logo */}
        <img
          src="/rqeeb-logo.jpg"
          alt="رقيب"
          className="w-12 h-12 object-contain mx-auto opacity-75"
        />

        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <XCircle className="h-8 w-8 text-red-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">فشلت عملية الدفع</h2>
          <p className="text-sm text-[#94A3B8]">
            لم تكتمل عملية الدفع. لم يتم خصم أي مبلغ من حسابك.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          {contractId && (
            <Button
              variant="outline"
              onClick={() => setLocation(`/contracts/${contractId}`)}
              className="border-[#1E2D45] text-[#94A3B8] hover:text-white hover:bg-white/5 rounded-xl"
            >
              عرض العقد
            </Button>
          )}
          <Button
            onClick={() => setLocation("/upload")}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl"
          >
            المحاولة مرة أخرى
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="text-[#94A3B8] hover:text-white text-sm w-full"
        >
          العودة إلى لوحة القيادة
        </Button>
      </div>
    </div>
  );
}
