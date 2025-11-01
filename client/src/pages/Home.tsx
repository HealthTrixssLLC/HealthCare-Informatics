import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChatPanel } from '@/components/ChatPanel';
import { ReportDisplay } from '@/components/ReportDisplay';
import { SessionSidebar } from '@/components/SessionSidebar';
import { ChatMessage, ReportData, ChatSessionData } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import { useLocation } from 'wouter';

export default function Home() {
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [useCache, setUseCache] = useState(false);
  const hasCreatedInitialSession = useRef(false);
  const lastLoadedReportId = useRef<string | null>(null);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [location, navigate] = useLocation();

  // Fetch all sessions
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery<ChatSessionData[]>({
    queryKey: ['/api/sessions'],
  });

  // Fetch messages for active session
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: [`/api/sessions/${activeSessionId}/messages`],
    enabled: !!activeSessionId,
  });

  // Load report from URL parameters (when navigating from dashboard)
  useEffect(() => {
    // wouter doesn't include query params in location, use window.location.search
    const searchParams = new URLSearchParams(window.location.search);
    const reportId = searchParams.get('reportId');
    const sessionId = searchParams.get('sessionId');
    
    // Only process if we have params and haven't already loaded this report
    if (reportId && sessionId && reportId !== lastLoadedReportId.current) {
      console.log('[Home] Loading report from URL:', reportId, sessionId);
      lastLoadedReportId.current = reportId;
      setActiveSessionId(sessionId);
      
      // Fetch the specific report
      fetch(`/api/reports`)
        .then(res => res.json())
        .then((reports: ReportData[]) => {
          const report = reports.find(r => r.id === reportId);
          if (report) {
            console.log('[Home] Report loaded, clearing URL');
            setCurrentReport(report);
            // Clear URL parameters after report is loaded
            setTimeout(() => {
              window.history.replaceState({}, '', '/');
              // Reset the ref so this report can be loaded again in the future
              lastLoadedReportId.current = null;
            }, 100);
          } else {
            console.log('[Home] Report not found, clearing URL');
            window.history.replaceState({}, '', '/');
            lastLoadedReportId.current = null;
          }
        })
        .catch(err => {
          console.error('Failed to load report:', err);
          // Clear URL even on error
          window.history.replaceState({}, '', '/');
          lastLoadedReportId.current = null;
        });
    }
  }, [location]);

  // Create a new session on mount if none exists
  useEffect(() => {
    if (isLoadingSessions) return;
    
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    } else if (sessions.length === 0 && !activeSessionId && !hasCreatedInitialSession.current) {
      hasCreatedInitialSession.current = true;
      createSessionMutation.mutate({ title: 'New Chat' });
    }
  }, [sessions.length, activeSessionId, isLoadingSessions]);

  const createSessionMutation = useMutation({
    mutationFn: async (data: { title: string }) => {
      const response = await apiRequest('POST', '/api/sessions', data);
      return await response.json();
    },
    onSuccess: async (newSession: ChatSessionData) => {
      await queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      setActiveSessionId(newSession.id);
      setCurrentReport(null);
      toast({
        title: 'New Chat Created',
        description: 'Started a new conversation',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create new chat session',
        variant: 'destructive',
      });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async ({ message, sessionId, useCache }: { message: string; sessionId: string; useCache?: boolean }) => {
      const response = await apiRequest(
        'POST',
        '/api/generate-report',
        { message, sessionId, useCache }
      );
      const data = await response.json();
      return data as { report: ReportData; assistantMessage: string };
    },
    onSuccess: (data) => {
      setCurrentReport(data.report);
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${activeSessionId}/messages`] });
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
    },
    onError: (error: any) => {
      const errorType = error.response?.data?.errorType;
      let title = 'Error generating report';
      let description = error.message || 'An unknown error occurred';

      if (errorType === 'FHIR_ERROR') {
        title = 'FHIR Server Error';
        description = 'Failed to fetch data from FHIR server. Please try again.';
      } else if (errorType === 'AI_ERROR') {
        title = 'AI Processing Error';
        description = 'Failed to generate AI analysis. Please try again in a moment.';
      }

      toast({
        title,
        description,
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = (content: string) => {
    if (!activeSessionId) {
      toast({
        title: 'No Active Session',
        description: 'Please create a new chat to continue',
        variant: 'destructive',
      });
      return;
    }

    generateReportMutation.mutate({ 
      message: content, 
      sessionId: activeSessionId,
      useCache 
    });
  };

  const handleNewSession = () => {
    const now = new Date();
    const title = `Chat - ${now.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    createSessionMutation.mutate({ title });
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentReport(null);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleExportPDF = () => {
    if (!currentReport) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 20;

      doc.setFontSize(20);
      doc.text(currentReport.title, margin, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date(currentReport.generatedAt).toLocaleString()}`, margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      const splitContent = doc.splitTextToSize(currentReport.content, pageWidth - 2 * margin);
      doc.text(splitContent, margin, yPosition);
      yPosition += splitContent.length * 7;

      if (currentReport.metrics && currentReport.metrics.length > 0) {
        yPosition += 10;
        doc.setFontSize(14);
        doc.text('Key Metrics:', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        currentReport.metrics.forEach(metric => {
          doc.text(`${metric.label}: ${metric.value}`, margin, yPosition);
          yPosition += 7;
        });
      }

      doc.save(`report-${currentReport.id}.pdf`);
      
      toast({
        title: 'Export Successful',
        description: 'Report downloaded as PDF',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };

  const handleExportJSON = () => {
    if (currentReport) {
      const dataStr = JSON.stringify(currentReport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `report-${currentReport.id}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: 'Export Successful',
        description: 'Report downloaded as JSON',
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Session Sidebar */}
      <SessionSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        isCreatingSession={createSessionMutation.isPending}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Chat Panel */}
      <ChatPanel
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={generateReportMutation.isPending}
        useCache={useCache}
        onUseCacheChange={setUseCache}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b bg-gradient-to-r from-card/80 via-card to-card/80 backdrop-blur-sm shadow-sm">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Healthcare Informatics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">AI-Powered Healthcare Analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              data-testid="button-view-dashboard"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover-elevate"
              data-testid="button-theme-toggle"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Report Display Area */}
        <main className="flex-1 overflow-hidden">
          <ReportDisplay
            report={currentReport}
            onExportPDF={handleExportPDF}
            onExportJSON={handleExportJSON}
          />
        </main>
      </div>
    </div>
  );
}
