import { useParams, useLocation } from "wouter";
import { 
  useGetContract, 
  getGetContractQueryKey, 
  useGetAuditResult, 
  getGetAuditResultQueryKey,
  useAuditAction 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, AlertTriangle, ShieldAlert, Scale, PenTool, CheckCircle, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function DecisionRoom() {
  const params = useParams();
  const id = params.id as string;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSuccessOverlayOpen, setIsSuccessOverlayOpen] = useState(false);

  // Queries
  const { data: contract, isLoading: isContractLoading } = useGetContract(id, {
    query: {
      enabled: !!id,
      queryKey: getGetContractQueryKey(id),
      refetchInterval: (query) => {
        return query.state.data?.status === "Analyzing" ? 5000 : false;
      }
    }
  });

  const { data: auditResult, isLoading: isAuditLoading } = useGetAuditResult(id, {
    query: {
      enabled: !!id && contract?.status === "Completed",
      queryKey: getGetAuditResultQueryKey(id),
      refetchInterval: () => {
        return contract?.status === "Analyzing" ? 5000 : false;
      }
    }
  });

  // Mutation
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
        }
      }
    );
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
  const riskPercentage = riskScore * 10; // Assuming riskScore is 0-10

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
      {/* Header Area */}
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

        {/* Action Buttons */}
        {!isAnalyzing && contract.status === "Completed" && (
          <div className="flex flex-wrap items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="border-primary/20 hover:bg-primary/5">
                  <MessageSquare className="ml-2 h-4 w-4" />
                  استشارة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>استشارة قانونية</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-lg font-medium text-center">جارٍ تحميل قناة الاستشارة...</p>
                  <p className="text-sm text-muted-foreground text-center">سيتم ربطك بخبير قانوني قريباً</p>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              onClick={handleApprove}
              disabled={auditAction.isPending}
            >
              {auditAction.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <CheckCircle className="ml-2 h-4 w-4" />}
              موافقة (Approved)
            </Button>
          </div>
        )}
      </div>

      {isAnalyzing ? (
        <Card className="border-dashed border-2 bg-muted/10 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="bg-background rounded-full p-6 border shadow-sm relative z-10">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3">وكلاء الذكاء الاصطناعي يعملون...</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
              يقوم المفتش المالي، والباحث القانوني، والمصيغ حالياً بقراءة وتحليل بنود العقد لتحديد المخاطر والفرص.
            </p>
            <div className="w-full max-w-md mt-8 space-y-2 text-right">
              <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                <span>التقدم...</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ) : auditResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Score Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-green-500 via-orange-500 to-destructive"></div>
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
                      <span className={getRiskTextColor(riskScore)}>{auditResult.severity === "High" ? "عالي" : auditResult.severity === "Medium" ? "متوسط" : "منخفض"}</span>
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

          {/* AI Agents Output Tabs */}
          <div className="lg:col-span-2">
            <Card className="h-full border-border shadow-sm">
              <Tabs defaultValue="inspector" className="w-full flex flex-col h-full">
                <div className="border-b border-border px-4 py-2 bg-muted/20">
                  <TabsList className="w-full grid grid-cols-3 bg-muted/50 p-1">
                    <TabsTrigger value="inspector" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      المفتش (Inspector)
                    </TabsTrigger>
                    <TabsTrigger value="lawfinder" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <Scale className="mr-2 h-4 w-4" />
                      الباحث (Law Finder)
                    </TabsTrigger>
                    <TabsTrigger value="drafter" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <PenTool className="mr-2 h-4 w-4" />
                      المصيغ (Drafter)
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

      {/* Success Overlay */}
      {isSuccessOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-green-500/30 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
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
