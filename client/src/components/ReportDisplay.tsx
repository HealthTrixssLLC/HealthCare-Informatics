import { Download, FileJson, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReportData } from '@shared/schema';
import { MetricCards } from './MetricCards';
import { ChartDisplay } from './ChartDisplay';

interface ReportDisplayProps {
  report: ReportData | null;
  onExportPDF?: () => void;
  onExportJSON?: () => void;
}

export function ReportDisplay({ report, onExportPDF, onExportJSON }: ReportDisplayProps) {
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-3">Welcome to FHIR Report Generator</h2>
        <p className="text-base text-muted-foreground max-w-md mb-8">
          Use the chat interface to request healthcare reports. Our AI will analyze FHIR data and create comprehensive visualizations.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
          <Card className="p-6 text-left">
            <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-chart-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2">Natural Language</h3>
            <p className="text-sm text-muted-foreground">Simply describe what you need in plain English</p>
          </Card>
          <Card className="p-6 text-left">
            <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-chart-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2">Smart Analysis</h3>
            <p className="text-sm text-muted-foreground">AI analyzes FHIR data to extract insights</p>
          </Card>
          <Card className="p-6 text-left">
            <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2">Visual Reports</h3>
            <p className="text-sm text-muted-foreground">Beautiful charts and comprehensive analytics</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-8">
        <Card className="rounded-xl p-8 shadow-lg" data-testid="card-report">
          {/* Report Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2" data-testid="text-report-title">{report.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(report.generatedAt).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    FHIR Server
                  </span>
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

          {/* Key Metrics */}
          {report.metrics && report.metrics.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Key Metrics</h2>
              <MetricCards metrics={report.metrics} />
            </div>
          )}

          {/* Report Content */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Analysis</h2>
            <div className="prose prose-sm max-w-none">
              <div className="text-base leading-relaxed whitespace-pre-wrap" data-testid="text-report-content">
                {report.content}
              </div>
            </div>
          </div>

          {/* Charts */}
          {report.chartData && report.chartData.length > 0 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold">Visualizations</h2>
              {report.chartData.map((chartSet) => (
                <ChartDisplay key={chartSet.id} chartData={chartSet} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
