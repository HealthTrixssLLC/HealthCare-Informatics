import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReportData } from '@shared/schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, FileText, Calendar, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [, navigate] = useLocation();

  const { data: reports = [], isLoading } = useQuery<ReportData[]>({
    queryKey: ['/api/reports'],
  });

  const filteredReports = reports.filter(report => {
    const query = searchQuery.toLowerCase();
    return (
      report.title.toLowerCase().includes(query) ||
      report.summary?.toLowerCase().includes(query) ||
      report.sessionTitle?.toLowerCase().includes(query)
    );
  });

  const handleViewReport = (report: ReportData) => {
    navigate(`/?reportId=${report.id}&sessionId=${report.sessionId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b bg-gradient-to-r from-card/80 via-card to-card/80 backdrop-blur-sm shadow-sm">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Reports Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse and manage your healthcare reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            data-testid="button-back-to-chat"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-8">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search reports by title, summary, or session..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-reports"
              />
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{reports.length}</p>
                    <p className="text-sm text-muted-foreground">Total Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {reports.filter(r => r.chartData && r.chartData.length > 0).length}
                    </p>
                    <p className="text-sm text-muted-foreground">With Charts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {reports.filter(r => r.metrics && r.metrics.length > 0).length}
                    </p>
                    <p className="text-sm text-muted-foreground">With Metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <div className="flex-1 overflow-hidden">
            <h2 className="text-lg font-semibold mb-4">
              All Reports {filteredReports.length !== reports.length && `(${filteredReports.length} of ${reports.length})`}
            </h2>
            
            <ScrollArea className="h-[calc(100%-2rem)]">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading reports...</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No reports match your search' : 'No reports yet'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery ? 'Try a different search term' : 'Generate reports from the chat to see them here'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pr-4">
                  {filteredReports.map((report) => (
                    <Card
                      key={report.id}
                      className="hover-elevate cursor-pointer transition-all duration-200"
                      onClick={() => handleViewReport(report)}
                      data-testid={`card-report-${report.id}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{report.title}</CardTitle>
                            <CardDescription className="mt-1 line-clamp-2">
                              {report.summary || report.content.substring(0, 100) + '...'}
                            </CardDescription>
                          </div>
                          {(report.chartData && report.chartData.length > 0) && (
                            <div className="p-2 rounded-md bg-primary/10 flex-shrink-0">
                              <BarChart3 className="w-4 h-4 text-primary" />
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(report.generatedAt), { addSuffix: true })}
                          </div>
                          {report.sessionTitle && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1 truncate">
                                <MessageSquare className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{report.sessionTitle}</span>
                              </div>
                            </>
                          )}
                        </div>
                        {report.metrics && report.metrics.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {report.metrics.slice(0, 3).map((metric, idx) => (
                              <div
                                key={idx}
                                className="px-2 py-1 rounded-md bg-muted text-xs"
                                data-testid={`metric-preview-${idx}`}
                              >
                                <span className="font-medium">{metric.label}:</span>{' '}
                                {metric.value}
                              </div>
                            ))}
                            {report.metrics.length > 3 && (
                              <div className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                                +{report.metrics.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
}
