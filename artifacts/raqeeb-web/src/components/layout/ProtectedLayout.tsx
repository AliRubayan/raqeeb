import { useGetMe, useLogoutUser } from "@workspace/api-client-react";
import { useLocation, Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, LayoutDashboard, FilePlus, BadgeCheck, Sparkles, CheckCircle } from "lucide-react";
import { ReactNode, useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error } = useGetMe();
  const [location, setLocation] = useLocation();
  const logoutUser = useLogoutUser();
  const queryClient = useQueryClient();

  const [subscribing, setSubscribing] = useState(false);
  const [polling, setPolling] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const pollLinkId = useRef<string | null>(null);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
    setPolling(false);
    pollLinkId.current = null;
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src="/rqeeb-logo.png" alt="رقيب" className="w-16 h-16 object-contain opacity-70" />
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return <Redirect to="/login" />;
  }

  const handleLogout = () => {
    logoutUser.mutate(undefined, {
      onSuccess: () => setLocation("/login"),
    });
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const res = await fetch("/api/payments/create-subscription-link", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل إنشاء رابط الدفع");
      const data = await res.json();

      // Open StreamPay in a new tab — user stays on this page
      window.open(data.paymentUrl, "_blank", "noopener,noreferrer");
      pollLinkId.current = data.linkId;
      setSubscribing(false);
      setPolling(true);

      // Poll every 3 s until the payment is confirmed
      pollInterval.current = setInterval(async () => {
        try {
          const vRes = await fetch("/api/payments/verify-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ linkId: pollLinkId.current }),
          });
          if (!vRes.ok) return;
          const vData = await vRes.json();
          if (vData.subscribed) {
            stopPolling();
            setSubscribeSuccess(true);
            // Re-fetch user so the badge appears and button disappears
            await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
          }
        } catch {
          // transient error — keep polling
        }
      }, 3000);
    } catch {
      setSubscribing(false);
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "لوحة القيادة", icon: LayoutDashboard },
    { href: "/upload",    label: "تحليل عقد",    icon: FilePlus },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-[#0A0E1A]/90 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">

          {/* ── Start: Logo + Nav ── */}
          <div className="flex items-center gap-1">
            <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 ml-4">
              <img src="/rqeeb-logo.png" alt="رقيب" className="h-8 w-8 object-contain" />
              <span className="text-base font-bold text-white tracking-wide hidden sm:block">
                رقيب
              </span>
            </Link>

            {/* Divider */}
            <div className="h-5 w-px bg-[#1E2D45] mx-2" />

            {/* Nav links beside logo */}
            <nav className="flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = location === href || location.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── End: Email + subscription badge + Logout ── */}
          <div className="flex items-center gap-2">
            {/* Subscribe CTA — shown only when no active subscription */}
            {!(user as any).hasActiveSubscription && !subscribeSuccess && (
              polling ? (
                /* Waiting for payment state */
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 text-xs text-primary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                  <span>بانتظار تأكيد الدفع...</span>
                  <button
                    onClick={stopPolling}
                    className="text-[#94A3B8] hover:text-white text-xs underline-offset-2 hover:underline ml-1"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <Button
                  size="sm"
                  disabled={subscribing}
                  onClick={handleSubscribe}
                  className="h-8 px-3 gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  {subscribing
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Sparkles className="h-3.5 w-3.5" />
                  }
                  اشتراك في الخدمة
                </Button>
              )
            )}

            {/* Brief success flash */}
            {subscribeSuccess && !(user as any).hasActiveSubscription && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" />
                تم الاشتراك بنجاح
              </div>
            )}

            {/* Email + subscription icon */}
            <div className="hidden md:flex items-center gap-1.5">
              {(user as any).hasActiveSubscription && (
                <div className="relative group">
                  <BadgeCheck className="h-4 w-4 text-primary cursor-default" />
                  {/* Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1E2D45] text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-lg z-50">
                    اشتراك فعّال
                    <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-[#111827] border-t border-l border-[#1E2D45] rotate-45" />
                  </div>
                </div>
              )}
              <span className="text-xs text-[#94A3B8] truncate max-w-[180px]">
                {user.email}
              </span>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
              className="text-[#94A3B8] hover:text-white hover:bg-white/5 gap-1.5 h-8 px-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-xs hidden sm:block">خروج</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
