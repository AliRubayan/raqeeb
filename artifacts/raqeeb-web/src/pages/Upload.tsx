import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File, Loader2, CreditCard, CheckCircle, Infinity, ShieldCheck, Cpu, FileSearch } from "lucide-react";

const steps = [
  { icon: FileSearch, label: "المفتش المالي", desc: "يفحص بنود العقد" },
  { icon: ShieldCheck, label: "الباحث القانوني", desc: "يحدد المراجع والعقوبات" },
  { icon: Cpu, label: "المصيغ القانوني", desc: "يقترح البدائل" },
];

export function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [contractName, setContractName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<"idle" | "uploading" | "dispatching" | "payment">("idle");
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);

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
        toast({ variant: "destructive", title: "نوع الملف غير مدعوم", description: "يرجى رفع ملف بصيغة PDF فقط" });
        return;
      }
      setFile(selectedFile);
      if (!contractName) setContractName(selectedFile.name.replace(/\.pdf$/i, ""));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      if (dropped.type !== "application/pdf") {
        toast({ variant: "destructive", title: "نوع الملف غير مدعوم", description: "يرجى رفع ملف بصيغة PDF فقط" });
        return;
      }
      setFile(dropped);
      if (!contractName) setContractName(dropped.name.replace(/\.pdf$/i, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ variant: "destructive", title: "الملف مطلوب", description: "يرجى اختيار ملف العقد للتحليل" });
      return;
    }

    setIsUploading(true);
    setUploadStep("uploading");

    const formData = new FormData();
    formData.append("file", file);
    if (contractName) formData.append("contractName", contractName);

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
      toast({ variant: "destructive", title: "فشل الرفع", description: error.message || "حدث خطأ غير متوقع" });
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
        toast({ title: "جاري التحليل", description: "تم إرسال العقد إلى وكلاء الذكاء الاصطناعي" });
        setLocation(`/contracts/${contractId}`);
      } catch (error: any) {
        toast({ variant: "destructive", title: "فشل بدء التحليل", description: error.message });
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
        toast({ title: "جاري التوجيه لبوابة الدفع..." });
        window.location.href = payData.paymentUrl;
      } catch (error: any) {
        toast({ variant: "destructive", title: "فشل إنشاء رابط الدفع", description: error.message });
        setLocation(`/contracts/${contractId!}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">تحليل عقد جديد</h1>
        <p className="text-[#94A3B8] text-sm mt-1.5">
          ارفع ملف PDF — سيبدأ ثلاثة وكلاء من الذكاء الاصطناعي فحصه فوراً
        </p>
      </div>

      {/* ── Agent pipeline preview ── */}
      <div className="grid grid-cols-3 gap-3">
        {steps.map(({ icon: Icon, label, desc }, idx) => (
          <div key={label} className="rq-card rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-full" />
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xs font-bold text-[#94A3B8] mb-0.5">وكيل {idx + 1}</div>
            <div className="text-sm font-semibold text-white">{label}</div>
            <div className="text-xs text-[#94A3B8]/70 mt-0.5">{desc}</div>
          </div>
        ))}
      </div>

      {/* ── Subscription banner ── */}
      {hasSubscription && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Infinity className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-300">اشتراك فعّال</p>
            <p className="text-xs text-emerald-400/70 mt-0.5">تحليل عقود غير محدود بدون رسوم إضافية</p>
          </div>
        </div>
      )}

      {/* ── Upload form ── */}
      <div className="rq-card rounded-2xl p-6 rq-top-accent">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contract name */}
          <div className="space-y-2">
            <Label htmlFor="contractName" className="text-sm text-[#94A3B8]">
              اسم العقد
              <span className="text-[#94A3B8]/50 text-xs mr-1">(اختياري)</span>
            </Label>
            <Input
              id="contractName"
              data-testid="input-contract-name"
              placeholder="مثال: عقد تأسيس شركة ذات مسؤولية محدودة"
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              className="bg-[#0A0E1A] border-[#1E2D45] text-white placeholder:text-[#94A3B8]/40 focus:border-primary h-11"
            />
          </div>

          {/* File dropzone */}
          <div className="space-y-2">
            <Label className="text-sm text-[#94A3B8]">ملف العقد (PDF)</Label>
            <div
              data-testid="upload-dropzone"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer ${
                dragOver
                  ? "border-primary bg-primary/8 scale-[1.01]"
                  : file
                  ? "border-primary/40 bg-primary/5"
                  : "border-[#1E2D45] hover:border-primary/40 hover:bg-white/2"
              }`}
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
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                    <File className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-semibold text-white mb-1" dir="ltr">{file.name}</span>
                  <span className="text-sm text-[#94A3B8]">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <button
                    type="button"
                    className="mt-3 text-xs text-primary hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    تغيير الملف
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-[#1E2D45] flex items-center justify-center mb-4">
                    <UploadCloud className="h-6 w-6 text-[#94A3B8]" />
                  </div>
                  <span className="font-semibold text-white mb-1">اسحب الملف هنا أو انقر للاختيار</span>
                  <span className="text-sm text-[#94A3B8]">PDF · الحد الأقصى 10 ميجابايت</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment notice */}
          {!hasSubscription && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-primary/8 border border-primary/15">
              <CreditCard className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm text-[#94A3B8]">
                اشتراك لمرة واحدة بـ <span className="text-white font-semibold">1 ريال</span> — بعدها تحليل عقود غير محدود
              </span>
            </div>
          )}

          {/* Status messages */}
          {uploadStep === "payment" && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/8 border border-primary/15">
              <CreditCard className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm text-white">تم رفع الملف · جاري تحضير بوابة الدفع...</span>
            </div>
          )}
          {uploadStep === "dispatching" && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/8 border border-primary/15">
              <Loader2 className="h-4 w-4 text-primary shrink-0 animate-spin" />
              <span className="text-sm text-white">جاري إرسال العقد إلى وكلاء الذكاء الاصطناعي...</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20"
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
                  : "جاري رفع الملف..."}
              </>
            ) : hasSubscription ? (
              <>
                <CheckCircle className="ml-2 h-4 w-4" />
                رفع العقد وبدء التحليل فوراً
              </>
            ) : (
              <>
                <CreditCard className="ml-2 h-4 w-4" />
                رفع العقد والاشتراك (1 ريال)
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
