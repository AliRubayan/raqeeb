import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File, Loader2 } from "lucide-react";

export function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [contractName, setContractName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
        // Remove .pdf extension for default name
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

    const formData = new FormData();
    formData.append("file", file);
    if (contractName) {
      formData.append("contractName", contractName);
    }

    try {
      const response = await fetch("/api/contracts/upload", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "حدث خطأ أثناء رفع العقد");
      }

      const data = await response.json();
      
      toast({
        title: "تم رفع العقد بنجاح",
        description: "جاري تحويلك إلى غرفة القرار...",
      });
      
      setLocation(`/contracts/${data.id}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل الرفع",
        description: error.message || "حدث خطأ غير متوقع",
      });
    } finally {
      setIsUploading(false);
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

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">تفاصيل العقد</CardTitle>
          <CardDescription>أدخل اسم العقد وقم برفع الملف</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contractName">اسم العقد (اختياري)</Label>
              <Input
                id="contractName"
                placeholder="مثال: عقد تأسيس شركة ذات مسؤولية محدودة"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>ملف العقد (PDF)</Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <File className="h-10 w-10 text-primary mb-3" />
                    <span className="font-medium text-foreground mb-1" dir="ltr">{file.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button variant="link" className="mt-2 h-auto p-0 text-primary" onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}>
                      تغيير الملف
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <UploadCloud className="h-10 w-10 mb-3 text-muted-foreground/60" />
                    <span className="font-medium text-foreground mb-1">انقر هنا لرفع الملف</span>
                    <span className="text-sm">أو قم بسحب وإفلات الملف هنا</span>
                    <span className="text-xs mt-2 text-muted-foreground/70">الحد الأقصى 10 ميجابايت. PDF فقط.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isUploading || !file}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  "بدء التحليل"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
