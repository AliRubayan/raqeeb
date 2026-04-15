import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File, Loader2, CreditCard, CheckCircle, Infinity } from "lucide-react";

export function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [contractName, setContractName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<"idle" | "uploading" | "dispatching" | "payment">("idle");
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setHasSubscription(data?.hasActiveSubscription ?? false))
      .catch(() => setHasSubscription(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "خطأ في نوع الملف",
          description: "يرجى رفع ملف بصيغة PDF فقط",
        });
        return;
      }
      setFile(selectedFile);
      if (!contractName) {
        setContractName(selectedFile.name.replace(/\.pdf$/i, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: "destructive",
        title: "الملف مطلوب",
        description: "يرجى اختيار ملف العقد للتحليل",
      });
      return;
    }

    setIsUploading(true);
    setUploadStep("uploading");

    const formData = new FormData();
    formData.append("file", file);
    if (contractName) {
      formData.append("contractName", contractName);
    }

    let contractId: string;

    try {
      const uploadRes = await fetch("/api/contracts/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => null);
        throw new Error(err?.error || "حدث خطأ أثناء رفع العقد");
      }

      const uploadData = await uploadRes.json();
      contractId = uploadData.id;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل الرفع",
        description: error.message || "حدث خطأ غير متوقع",
      });
      setIsUploading(false);
      setUploadStep("idle");
      return;
    }

    if (hasSubscription) {
      setUploadStep("dispatching");
      try {
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

        toast({
          title: "جاري التحليل",
          description: "تم إرسال العقد إلى وكلاء الذكاء الاصطناعي",
        });

        setLocation(`/contracts/${contractId}`);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "فشل بدء التحليل",
          description: error.message || "حدث خطأ غير متوقع",
        });
        setLocation(`/contracts/${contractId!}`);
      } finally {
        setIsUploading(false);
      }
    } else {
      setUploadStep("payment");

      try {
        const payRes = await fetch("/api/payments/create-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ contractId, contractName: contractName || file.name }),
        });

        if (!payRes.ok) {
          const err = await payRes.json().catch(() => null);
          throw new Error(err?.error || "تعذّر إنشاء رابط الدفع");
        }

        const payData = await payRes.json();

        toast({
          title: "جاري التوجيه إلى بوابة الدفع...",
          description: "سيتم تفعيل اشتراكك فور اكتمال الدفع",
        });

        window.location.href = payData.paymentUrl;
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "فشل إنشاء رابط الدفع",
          description: error.message || "حدث خطأ غير متوقع",
        });
        setLocation(`/contracts/${contractId!}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">تحليل عقد جديد</h1>
        <p className="text-muted-foreground mt-2">
          قم برفع العقد بصيغة PDF ليتم تحليله بواسطة وكلاء الذكاء الاصطناعي الخاصين برقيب.
        </p>
      </div>

      {hasSubscription && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">اشتراك فعّال</p>
            <p className="text-xs text-green-700 mt-0.5">
              يمكنك رفع عقود غير محدودة دون أي رسوم إضافية
            </p>
          </div>
          <Infinity className="h-5 w-5 text-green-600 mr-auto shrink-0" />
        </div>
      )}

      {uploadStep === "payment" && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-foreground">
            تم رفع الملف بنجاح. جاري تحضير بوابة الدفع...
          </p>
        </div>
      )}

      {uploadStep === "dispatching" && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-primary shrink-0 animate-spin" />
          <p className="text-sm text-foreground">
            جاري إرسال العقد إلى وكلاء الذكاء الاصطناعي...
          </p>
        </div>
      )}

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">تفاصيل العقد</CardTitle>
          <CardDescription>
            {hasSubscription
              ? "أدخل اسم العقد وقم برفع الملف — سيبدأ التحليل فوراً بفضل اشتراكك الفعّال"
              : "أدخل اسم العقد وقم برفع الملف — يتطلب اشتراكاً لمرة واحدة (1 ريال) لتفعيل التحليل غير المحدود"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contractName">اسم العقد (اختياري)</Label>
              <Input
                id="contractName"
                data-testid="input-contract-name"
                placeholder="مثال: عقد تأسيس شركة ذات مسؤولية محدودة"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>ملف العقد (PDF)</Label>
              <div
                data-testid="upload-dropzone"
                className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${
                  file
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="application/pdf"
                  data-testid="input-file"
                  onChange={handleFileChange}
                />

                {file ? (
                  <div className="flex flex-col items-center">
                    <File className="h-10 w-10 text-primary mb-3" />
                    <span className="font-medium text-foreground mb-1" dir="ltr">
                      {file.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      variant="link"
                      className="mt-2 h-auto p-0 text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      تغيير الملف
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <UploadCloud className="h-10 w-10 mb-3 text-muted-foreground/60" />
                    <span className="font-medium text-foreground mb-1">انقر هنا لرفع الملف</span>
                    <span className="text-sm">أو قم بسحب وإفلات الملف هنا</span>
                    <span className="text-xs mt-2 text-muted-foreground/70">
                      الحد الأقصى 10 ميجابايت. PDF فقط.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              {!hasSubscription && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <CreditCard className="h-4 w-4 shrink-0" />
                  <span>اشتراك لمرة واحدة بـ 1 ريال — بعده تحليل عقود غير محدود</span>
                </div>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                data-testid="button-submit"
                disabled={isUploading || !file || hasSubscription === null}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    {uploadStep === "payment"
                      ? "جاري التحويل للدفع..."
                      : uploadStep === "dispatching"
                      ? "جاري بدء التحليل..."
                      : "جاري الرفع..."}
                  </>
                ) : hasSubscription ? (
                  "رفع العقد وبدء التحليل فوراً"
                ) : (
                  "رفع العقد والاشتراك (1 ريال)"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
