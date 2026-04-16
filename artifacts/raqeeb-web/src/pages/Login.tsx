import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useLoginUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useLoginUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: () => setLocation("/dashboard"),
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "خطأ في تسجيل الدخول",
            description: error.error || "تأكد من البريد الإلكتروني وكلمة المرور",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#060912] border-l border-border/40 p-12">
        <div className="flex items-center gap-3">
          <img src="/rqeeb-logo.jpg" alt="رقيب" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-white tracking-wide">رقيب</span>
        </div>

        <div className="space-y-6">
          <div className="w-12 h-0.5 bg-primary" />
          <h1 className="text-4xl font-black text-white leading-snug">
            منصة تحليل العقود<br />
            <span className="text-primary">بالذكاء الاصطناعي</span>
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-sm">
            ثلاثة وكلاء متخصصون — المفتش، الباحث القانوني، والمصيغ — يفحصون كل بند ويرصدون كل مخاطرة في ثوانٍ.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { num: "3", label: "وكلاء AI" },
              { num: "∞", label: "عقود غير محدودة" },
              { num: "100%", label: "سرية تامة" },
            ].map(({ num, label }) => (
              <div key={label} className="bg-white/4 border border-border/40 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-primary mb-1">{num}</div>
                <div className="text-xs text-[#94A3B8]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#94A3B8]/50">
          © 2025 Rqeeb. Always watching out for you.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <img src="/rqeeb-logo.jpg" alt="رقيب" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-white">رقيب</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">مرحباً بعودتك</h2>
            <p className="text-[#94A3B8] mt-1.5 text-sm">سجّل دخولك للوصول إلى لوحة القيادة</p>
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
              <Label htmlFor="password" className="text-sm text-[#94A3B8]">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جاري التحقق...</>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#94A3B8]">ليس لديك حساب؟ </span>
            <Link href="/register" className="text-primary font-semibold hover:underline">
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
