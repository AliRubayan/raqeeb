import { useLocation } from "wouter";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaymentFailed() {
  const [, setLocation] = useLocation();
  const contractId = new URLSearchParams(window.location.search).get("contractId");

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">فشلت عملية الدفع</h1>
          <p className="text-muted-foreground mt-2">
            لم تكتمل عملية الدفع. لم يتم خصم أي مبلغ من حسابك.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => setLocation("/upload")}>
            المحاولة مرة أخرى
          </Button>
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            العودة إلى لوحة القيادة
          </Button>
        </div>
      </div>
    </div>
  );
}
