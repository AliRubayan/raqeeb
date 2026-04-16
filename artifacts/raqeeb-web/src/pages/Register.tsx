import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useRegisterUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ShieldCheck, Cpu, FileSearch } from "lucide-react";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const registerMutation = useRegisterUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: () => {
          toast({ title: "مرحباً بك في رقيب", description: "تم إنشاء حسابك بنجاح" });
          setLocation("/dashboard");
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "خطأ في إنشاء الحساب",
            description: error.error || "حاول مرة أخرى",
          });
        },
      }
    );
  };

  const features = [
    { icon: FileSearch, text: "تحليل فوري لبنود العقد" },
    { icon: ShieldCheck, text: "كشف المخاطر القانونية" },
    { icon: Cpu, text: "توصيات صياغة بديلة" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#060912] border-l border-border/40 p-12">
        <div className="flex items-center gap-3">
          <img src="/rqeeb-logo.png" alt="رقيب" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-white tracking-wide">رقيب</span>
        </div>

        <div className="space-y-8">
          <div className="w-12 h-0.5 bg-primary" />
          <h1 className="text-4xl font-black text-white leading-snug">
            انضم إلى رقيب<br />
            <span className="text-primary">دائماً نراقب لأجلك</span>
          </h1>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[#94A3B8] text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#94A3B8]/50">© 2025 رقيب. دائماً نراقب لأجلك.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <img src="/rqeeb-logo.png" alt="رقيب" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-white">رقيب</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">إنشاء حساب جديد</h2>
            <p className="text-[#94A3B8] mt-1.5 text-sm">ابدأ رحلتك في تحليل العقود بذكاء</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-[#94A3B8]">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                placeholder="you@company.com"
                className="bg-[#111827] border-[#1E2D45] text-white placeholder:text-[#94A3B8]/50 focus:border-primary focus:ring-primary/20 h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm text-[#94A3B8]">
                كلمة المرور
                <span className="text-[#94A3B8]/60 text-xs mr-2">(8 أحرف على الأقل)</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  dir="ltr"
                  placeholder="••••••••"
                  className="bg-[#111827] border-[#1E2D45] text-white placeholder:text-[#94A3B8]/50 focus:border-primary focus:ring-primary/20 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold mt-2 shadow-lg shadow-primary/20"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جاري الإنشاء...</>
              ) : (
                "إنشاء الحساب"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#94A3B8]">لديك حساب بالفعل؟ </span>
            <Link href="/login" className="text-primary font-semibold hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
