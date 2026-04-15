import { useParams, useLocation } from "wouter";
import {
  useGetContract,
  getGetContractQueryKey,
  useGetAuditResult,
  getGetAuditResultQueryKey,
  useAuditAction,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, AlertTriangle, ShieldAlert, Scale, PenTool, CheckCircle, MessageSquare, Send, Bot, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  loading?: boolean;
}

export function DecisionRoom() {
  const params = useParams();
  const id = params.id as string;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSuccessOverlayOpen, setIsSuccessOverlayOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "مرحباً، أنا مساعدك القانوني لهذا العقد. يمكنك سؤالي عن أي بند أو مخاطرة وردت في التحليل.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const { data: contract, isLoading: isContractLoading } = useGetContract(id, {
    query: {
      enabled: !!id,
      queryKey: getGetContractQueryKey(id),
      refetchInterval: (query) => {
        return query.state.data?.status === "Analyzing" ? 5000 : false;
      },
    },
  });

  const { data: auditResult } = useGetAuditResult(id, {
    query: {
      enabled: !!id && contract?.status === "Completed",
      queryKey: getGetAuditResultQueryKey(id),
    },
  });

  const auditAction = useAuditAction();

  const handleApprove = () => {
    auditAction.mutate(
      { data: { action: "Approve" } },
      {
        onSuccess: () => {
          setIsSuccessOverlayOpen(true);
          queryClient.invalidateQueries({ queryKey: getGetContractQueryKey(id) });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "خطأ",
            description: error.error || "حدث خطأ أثناء الموافقة على العقد",
          });
        },
      }
    );
  };

  const handleSendMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || isSending) return;

    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { role: "user", text: msg },
      { role: "assistant", text: "", loading: true },
    ]);
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contractId: id, message: msg }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "فشل الاتصال بالمساعد");
      }

      setChatMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { role: "assistant", text: data.reply, loading: false } : m
        )
      );
    } catch (err: any) {
      setChatMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { role: "assistant", text: err.message || "حدث خطأ، يرجى المحاولة مرة أخرى.", loading: false }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  if (isContractLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-lg font-medium">جاري تحميل بيانات العقد...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-lg font-medium">لم يتم العثور على العقد</p>
          <Button onClick={() => setLocation("/dashboard")} variant="outline">
            العودة للوحة القيادة
          </Button>
        </div>
      </div>
    );
  }

  const isAnalyzing = contract.status === "Analyzing" || contract.status === "Paid";
  const riskScore = auditResult?.riskScore || 0;
  const riskPercentage = riskScore * 10;

  const getRiskColor = (score: number) => {
    if (score >= 7) return "bg-destructive";
    if (score >= 4) return "bg-orange-500";
    return "bg-green-500";
  };

  const getRiskTextColor = (score: number) => {
    if (score >= 7) return "text-destructive";
    if (score >= 4) return "text-orange-500";
    return "text-green-500";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="font-mono">{contract.id.substring(0, 8)}</Badge>
            {isAnalyzing ? (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">جاري التحليل</Badge>
            ) : contract.status === "Completed" ? (
              <Badge className="bg-green-600 hover:bg-green-700">مكتمل</Badge>
            ) : (
              <Badge variant="outline">{contract.status}</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{contract.contractName || "عقد بدون عنوان"}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            غرفة القرار: عرض شامل لنتائج الفحص والتحليل القانوني المستخلص من وكلاء الذكاء الاصطناعي.
          </p>
        </div>

        {!isAnalyzing && contract.status === "Completed" && (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="border-primary/20 hover:bg-primary/5"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageSquare className="ml-2 h-4 w-4" />
              استشارة
            </Button>

            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              onClick={handleApprove}
              disabled={auditAction.isPending}
            >
              {auditAction.isPending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="ml-2 h-4 w-4" />
              )}
              موافقة (Approved)
            </Button>
          </div>
        )}
      </div>

      {/* Body */}
      {isAnalyzing ? (
        <Card className="border-dashed border-2 bg-muted/10 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="bg-background rounded-full p-6 border shadow-sm relative z-10">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3">وكلاء الذكاء الاصطناعي يعملون...</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
              يقوم المفتش المالي، والباحث القانوني، والمصيغ حالياً بقراءة وتحليل بنود العقد لتحديد المخاطر والفرص.
            </p>
            <div className="w-full max-w-md mt-8 space-y-2 text-right">
              <Progress value={45} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ) : auditResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-green-500 via-orange-500 to-destructive" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">مؤشر المخاطر الإجمالي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6">
                  <div className={`text-6xl font-black mb-2 ${getRiskTextColor(riskScore)}`}>
                    {riskScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground mb-6">من 10.0</div>
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>مستوى الخطر</span>
                      <span className={getRiskTextColor(riskScore)}>
                        {auditResult.severity === "High" ? "عالي" : auditResult.severity === "Medium" ? "متوسط" : "منخفض"}
                      </span>
                    </div>
                    <Progress value={riskPercentage} className="h-3" indicatorClassName={getRiskColor(riskScore)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معلومات التدقيق</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">تاريخ التحليل</span>
                  <span className="font-medium" dir="ltr">{new Date(auditResult.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">معرف التدقيق</span>
                  <span className="font-mono text-xs truncate max-w-[120px]">{auditResult.id}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Tabs */}
          <div className="lg:col-span-2">
            <Card className="h-full border-border shadow-sm">
              <Tabs defaultValue="inspector" className="w-full flex flex-col h-full">
                <div className="border-b border-border px-4 py-2 bg-muted/20">
                  <TabsList className="w-full grid grid-cols-3 bg-muted/50 p-1">
                    <TabsTrigger value="inspector" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      المفتش
                    </TabsTrigger>
                    <TabsTrigger value="lawfinder" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <Scale className="mr-2 h-4 w-4" />
                      الباحث
                    </TabsTrigger>
                    <TabsTrigger value="drafter" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <PenTool className="mr-2 h-4 w-4" />
                      المصيغ
                    </TabsTrigger>
                  </TabsList>
                </div>
                <CardContent className="p-6 flex-1 bg-background">
                  <TabsContent value="inspector" className="m-0 h-full">
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                      <h3 className="text-xl font-bold flex items-center text-primary mb-4">
                        <ShieldAlert className="mr-2 h-5 w-5" />
                        تحليل المخاطر الشامل
                      </h3>
                      <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                        {auditResult.inspectorOutput || "لا توجد مخرجات متوفرة من المفتش."}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="lawfinder" className="m-0 h-full">
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                      <h3 className="text-xl font-bold flex items-center text-primary mb-4">
                        <Scale className="mr-2 h-5 w-5" />
                        المراجع والسوابق القانونية
                      </h3>
                      <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                        {auditResult.lawFinderOutput || "لا توجد مخرجات متوفرة من الباحث القانوني."}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="drafter" className="m-0 h-full">
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                      <h3 className="text-xl font-bold flex items-center text-primary mb-4">
                        <PenTool className="mr-2 h-5 w-5" />
                        اقتراحات إعادة الصياغة
                      </h3>
                      <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                        {auditResult.drafterOutput || "لا توجد مخرجات متوفرة من المصيغ."}
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">لا توجد نتائج تدقيق متوفرة لهذا العقد.</p>
        </div>
      )}

      {/* Chat Side Panel */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent side="left" className="w-full sm:w-[420px] flex flex-col p-0" dir="rtl">
          <SheetHeader className="px-4 py-4 border-b border-border bg-muted/30">
            <SheetTitle className="flex items-center gap-2 text-base">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              استشارة قانونية — رقيب
            </SheetTitle>
            <p className="text-xs text-muted-foreground mt-1">
              اسأل عن أي بند أو مخاطرة وردت في تحليل هذا العقد
            </p>
          </SheetHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.loading ? (
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border bg-background">
            <div className="flex gap-2 items-end">
              <textarea
                className="flex-1 resize-none rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground min-h-[42px] max-h-[120px]"
                placeholder="اكتب سؤالك هنا..."
                value={chatInput}
                rows={1}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isSending}
              />
              <Button
                size="icon"
                className="shrink-0 rounded-xl h-[42px] w-[42px]"
                onClick={handleSendMessage}
                disabled={isSending || !chatInput.trim()}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              اضغط Enter للإرسال • Shift+Enter لسطر جديد
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Success Overlay */}
      {isSuccessOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-green-500/30 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">تمت الموافقة</h2>
              <p className="text-muted-foreground text-lg mb-1">العقد جاهز، لا يحتاج إلى تعديلات</p>
              <p className="text-muted-foreground/70 text-sm mb-8" dir="ltr">Contract is ready, no changes needed</p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  setIsSuccessOverlayOpen(false);
                  setLocation("/dashboard");
                }}
              >
                العودة للوحة القيادة
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
