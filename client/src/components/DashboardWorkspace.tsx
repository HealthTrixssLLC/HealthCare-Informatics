import { useState, useMemo, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { ReportData } from '@shared/schema';
import { useFilterStore } from '@/stores/filterStore';
import { applyFiltersToDataset, recalculateAllMetrics, recalculateAllCharts } from '@/lib/reportTransform';
import InteractiveChart from './InteractiveChart';
import FilterPanel from './FilterPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Activity, AlertCircle } from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWorkspaceProps {
  report: ReportData;
  className?: string;
}

export default function DashboardWorkspace({ report, className = '' }: DashboardWorkspaceProps) {
  const { sourceData, activeFilters, setSourceData, setFilterDefinitions } = useFilterStore();
  const [layouts, setLayouts] = useState<Layout[]>([]);

  // Initialize filter store with report data
  useEffect(() => {
    if (report.sourceData) {
      setSourceData(report.sourceData);
    }
    if (report.filters) {
      setFilterDefinitions(report.filters);
    }
  }, [report.id, report.sourceData, report.filters, setSourceData, setFilterDefinitions]);

  // Calculate filtered data based on active filters
  const filteredData = useMemo(() => {
    if (!sourceData || !report.sourceData) return report.sourceData;
    return applyFiltersToDataset(sourceData, activeFilters);
  }, [sourceData, activeFilters, report.sourceData]);

  // Recalculate all metrics from filtered data using comprehensive transformation
  const filteredMetrics = useMemo(() => {
    if (!filteredData || !report.metrics) return report.metrics;
    return recalculateAllMetrics(filteredData, report.metrics);
  }, [filteredData, report.metrics]);

  // Recalculate all chart data from filtered dataset using comprehensive transformation
  const filteredChartData = useMemo(() => {
    if (!filteredData || !report.chartData) return report.chartData;
    return recalculateAllCharts(filteredData, report.chartData);
  }, [filteredData, report.chartData]);

  // Initialize layout from report or use defaults
  useEffect(() => {
    if (report.layout?.tiles) {
      setLayouts(report.layout.tiles);
    } else {
      // Generate default layout
      const defaultLayouts: Layout[] = [];
      let yPos = 0;

      // Narrative tile
      defaultLayouts.push({
        i: 'narrative',
        x: 0,
        y: yPos,
        w: 12,
        h: 2,
        minW: 6,
        minH: 1,
      });
      yPos += 2;

      // Metrics tiles
      if (filteredMetrics && filteredMetrics.length > 0) {
        filteredMetrics.forEach((_, idx) => {
          const metricsPerRow = 4;
          defaultLayouts.push({
            i: `metric-${idx}`,
            x: (idx % metricsPerRow) * 3,
            y: yPos + Math.floor(idx / metricsPerRow),
            w: 3,
            h: 1,
            minW: 2,
            minH: 1,
          });
        });
        yPos += Math.ceil(filteredMetrics.length / 4);
      }

      // Chart tiles
      if (filteredChartData && filteredChartData.length > 0) {
        filteredChartData.forEach((_, idx) => {
          const chartsPerRow = 2;
          defaultLayouts.push({
            i: `chart-${idx}`,
            x: (idx % chartsPerRow) * 6,
            y: yPos + Math.floor(idx / chartsPerRow) * 4,
            w: 6,
            h: 4,
            minW: 4,
            minH: 3,
          });
        });
      }

      setLayouts(defaultLayouts);
    }
  }, [report.id, report.layout, filteredMetrics, filteredChartData]);

  const handleLayoutChange = (newLayouts: Layout[]) => {
    setLayouts(newLayouts);
  };

  const getMetricIcon = (icon?: string) => {
    switch (icon) {
      case 'users':
        return <Users className="h-4 w-4" />;
      case 'activity':
        return <Activity className="h-4 w-4" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-4 ${className}`}>
      {/* Filter Panel - Left Side */}
      {report.filters && report.filters.length > 0 && (
        <div className="lg:w-80 flex-shrink-0">
          <FilterPanel />
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="flex-1 min-w-0">
        {filteredData?.metadata && Object.keys(activeFilters).length > 0 && (
          <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredData.metadata.patientCount}</span> patients
              {sourceData?.metadata && sourceData.metadata.patientCount !== filteredData.metadata.patientCount && (
                <span className="ml-1">
                  (filtered from {sourceData.metadata.patientCount})
                </span>
              )}
            </p>
          </div>
        )}

        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layouts }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={report.layout?.rowHeight || 80}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          compactType="vertical"
          preventCollision={false}
          margin={[16, 16]}
        >
          {/* Narrative Tile */}
          <div key="narrative" data-testid="tile-narrative">
            <Card className="h-full overflow-auto">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{report.title}</CardTitle>
                {report.summary && (
                  <CardDescription>{report.summary}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm leading-relaxed">{report.content}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metric Tiles */}
          {filteredMetrics?.map((metric, idx) => (
            <div key={`metric-${idx}`} data-testid={`tile-metric-${idx}`}>
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardDescription className="text-xs font-medium">
                    {metric.label}
                  </CardDescription>
                  <div className="text-muted-foreground">
                    {getMetricIcon(metric.icon)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid={`metric-value-${idx}`}>
                    {metric.value}
                    {metric.unit && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {metric.unit}
                      </span>
                    )}
                  </div>
                  {metric.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {metric.description}
                    </p>
                  )}
                  {metric.trend && (
                    <div className="flex items-center mt-2">
                      <Badge variant={metric.trend.direction === 'up' ? 'default' : 'secondary'}>
                        {metric.trend.direction === 'up' ? '↑' : '↓'} {metric.trend.percentage}%
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Chart Tiles */}
          {filteredChartData?.map((chart, idx) => (
            <div key={`chart-${idx}`} data-testid={`tile-chart-${idx}`}>
              <Card className="h-full overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{chart.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <InteractiveChart
                    chart={chart}
                    height="100%"
                  />
                </CardContent>
              </Card>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
