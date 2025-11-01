import { Download, FileJson, FileText, LayoutDashboard, FileText as FileTextIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportData } from '@shared/schema';
import { MetricCards } from './MetricCards';
import { ChartDisplay } from './ChartDisplay';
import DashboardWorkspace from './DashboardWorkspace';

interface ReportDisplayProps {
  report: ReportData | null;
  onExportPDF?: () => void;
  onExportJSON?: () => void;
}

export function ReportDisplay({ report, onExportPDF, onExportJSON }: ReportDisplayProps) {
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center animate-in fade-in duration-700">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-chart-2/20 to-chart-3/20 blur-2xl"></div>
          <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center shadow-2xl border border-primary/20">
            <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Welcome to Healthcare Informatics</h2>
        <p className="text-lg text-muted-foreground max-w-lg mb-12 leading-relaxed">
          Use the chat interface to request healthcare reports. Our AI will analyze FHIR data and create comprehensive visualizations.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <Card className="p-7 text-left hover-elevate transition-all duration-200 border-primary/10 bg-gradient-to-br from-card to-card/50">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-chart-1/20 to-chart-1/5 flex items-center justify-center mb-5 shadow-md">
              <svg className="w-6 h-6 text-chart-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Natural Language</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Simply describe what you need in plain English</p>
          </Card>
          <Card className="p-7 text-left hover-elevate transition-all duration-200 border-chart-2/10 bg-gradient-to-br from-card to-card/50">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-2/5 flex items-center justify-center mb-5 shadow-md">
              <svg className="w-6 h-6 text-chart-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Smart Analysis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">AI analyzes FHIR data to extract insights</p>
          </Card>
          <Card className="p-7 text-left hover-elevate transition-all duration-200 border-chart-3/10 bg-gradient-to-br from-card to-card/50">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-3/5 flex items-center justify-center mb-5 shadow-md">
              <svg className="w-6 h-6 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Visual Reports</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Beautiful charts and comprehensive analytics</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Report Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-xs font-semibold mb-3 border border-primary/20">
                AI-Generated Report
              </div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent" data-testid="text-report-title">{report.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(report.generatedAt).toLocaleString()}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  <span className="font-medium">FHIR Server</span>
                </span>
                {report.dataFetchedAt && (
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50" data-testid="text-data-source">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z M16 2v4M8 2v4M4 10h16" />
                    </svg>
                    <span className="text-xs font-medium">
                      Data {report.dataSource === 'cached' ? 'from cache' : 'refreshed'}: {new Date(report.dataFetchedAt).toLocaleString()}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onExportJSON}
                className="gap-2"
                data-testid="button-export-json"
              >
                <FileJson className="w-4 h-4" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExportPDF}
                className="gap-2"
                data-testid="button-export-pdf"
              >
                <FileText className="w-4 h-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Interactive Dashboard / Traditional View Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard" className="gap-2" data-testid="tab-dashboard">
              <LayoutDashboard className="w-4 h-4" />
              Interactive Dashboard
            </TabsTrigger>
            <TabsTrigger value="traditional" className="gap-2" data-testid="tab-traditional">
              <FileTextIcon className="w-4 h-4" />
              Traditional View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <DashboardWorkspace report={report} />
          </TabsContent>

          <TabsContent value="traditional" className="mt-0">
            <Card className="rounded-2xl p-10 shadow-2xl border-primary/10 bg-gradient-to-br from-card via-card to-card/90 animate-in fade-in duration-300" data-testid="card-report">
              {/* Key Metrics */}
              {report.metrics && report.metrics.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full"></span>
                    Key Metrics
                  </h2>
                  <MetricCards metrics={report.metrics} />
                </div>
              )}

              {/* Report Content */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-gradient-to-b from-chart-2 to-chart-2/50 rounded-full"></span>
                  Analysis
                </h2>
                <div className="prose prose-sm max-w-none">
                  <div className="text-base leading-loose whitespace-pre-wrap p-6 rounded-xl bg-muted/30 border border-border/50" data-testid="text-report-content">
                    {report.content}
                  </div>
                </div>
              </div>

              {/* Charts */}
              {report.chartData && report.chartData.length > 0 && (
                <div className="space-y-10">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <span className="w-1 h-8 bg-gradient-to-b from-chart-3 to-chart-3/50 rounded-full"></span>
                    Visualizations
                  </h2>
                  {report.chartData.map((chartSet) => (
                    <ChartDisplay key={chartSet.id} chartData={chartSet} />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
