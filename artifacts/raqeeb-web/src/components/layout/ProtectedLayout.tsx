import { useGetMe, useLogoutUser } from "@workspace/api-client-react";
import { useLocation, Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, LayoutDashboard, FilePlus } from "lucide-react";
import { ReactNode } from "react";

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error } = useGetMe();
  const [location, setLocation] = useLocation();
  const logoutUser = useLogoutUser();

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

  const navLinks = [
    { href: "/dashboard", label: "لوحة القيادة", icon: LayoutDashboard },
    { href: "/upload",    label: "تحليل عقد",    icon: FilePlus },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-[#0A0E1A]/90 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <img src="/rqeeb-logo.png" alt="رقيب" className="h-8 w-8 object-contain" />
            <span className="text-base font-bold text-white tracking-wide hidden sm:block">
              رقيب
            </span>
          </Link>

          {/* Nav */}
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

          {/* User */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#94A3B8] hidden md:block truncate max-w-[180px]">
              {user.email}
            </span>
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
