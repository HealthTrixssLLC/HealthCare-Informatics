import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ChatPanel } from '@/components/ChatPanel';
import { ReportDisplay } from '@/components/ReportDisplay';
import { ChatMessage, ReportData } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const generateReportMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest(
        'POST',
        '/api/generate-report',
        { message }
      );
      const data = await response.json();
      return data as { report: ReportData; assistantMessage: string };
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.assistantMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentReport(data.report);
    },
    onError: (error: any) => {
      const errorType = error.response?.data?.errorType;
      let title = 'Error generating report';
      let description = error.message;

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

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I encountered an error: ${description}. Please try again or rephrase your request.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    generateReportMutation.mutate(content);
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
      {/* Chat Panel */}
      <ChatPanel
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={generateReportMutation.isPending}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b bg-gradient-to-r from-card/80 via-card to-card/80 backdrop-blur-sm shadow-sm">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">FHIR Report Generator</h1>
            <p className="text-sm text-muted-foreground mt-0.5">AI-Powered Healthcare Analytics</p>
          </div>
          <div className="flex items-center gap-2">
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
