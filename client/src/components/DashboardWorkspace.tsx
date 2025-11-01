import { useState, useMemo, useEffect, useRef } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { ReportData } from '@shared/schema';
import { useFilterStore } from '@/stores/filterStore';
import { useCrossFilterStore } from '@/stores/crossFilterStore';
import { applyFiltersToDataset, recalculateAllMetrics, recalculateAllCharts } from '@/lib/reportTransform';
import HybridChart from './HybridChart';
import FilterPanel from './FilterPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Activity, AlertCircle, X } from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWorkspaceProps {
  report: ReportData;
  className?: string;
}

export default function DashboardWorkspace({ report, className = '' }: DashboardWorkspaceProps) {
  const { sourceData, activeFilters, setSourceData, setFilterDefinitions, updateFilter } = useFilterStore();
  const { crossFilters, addCrossFilter, removeCrossFilter, clearAllCrossFilters, getCombinedFilters } = useCrossFilterStore();
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Initialize filter store with report data
  useEffect(() => {
    if (report.sourceData) {
      setSourceData(report.sourceData);
    }
    if (report.filters) {
      setFilterDefinitions(report.filters);
    }
  }, [report.id, report.sourceData, report.filters, setSourceData, setFilterDefinitions]);

  // Handle chart click events for cross-filtering
  useEffect(() => {
    const handleChartClick = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { chartId, chartTitle, dataPoint } = customEvent.detail;
      
      // Determine filter field from chart context
      let filterField = '';
      let filterValue = dataPoint.name;
      
      // Map chart titles to filter fields (you can enhance this logic)
      const chartTitleLower = chartTitle?.toLowerCase() || '';
      if (chartTitleLower.includes('gender') || chartTitleLower.includes('sex')) {
        filterField = 'gender';
      } else if (chartTitleLower.includes('age')) {
        filterField = 'ageGroup';
      } else if (chartTitleLower.includes('condition')) {
        filterField = 'condition';
      } else if (chartTitleLower.includes('observation')) {
        filterField = 'observationType';
      }
      
      if (filterField && filterValue) {
        // Check if this filter already exists
        const existingFilter = crossFilters.find(
          f => f.sourceChartId === chartId && f.filterField === filterField && f.filterValue === filterValue
        );
        
        if (existingFilter) {
          // Remove filter if clicking the same data point again
          removeCrossFilter(chartId);
        } else {
          // Add new cross-filter
          addCrossFilter({
            sourceChartId: chartId,
            filterField,
            filterValue,
            timestamp: Date.now()
          });
        }
      }
    };
    
    const dashboard = dashboardRef.current;
    if (dashboard) {
      dashboard.addEventListener('chartClick', handleChartClick as EventListener);
      return () => {
        dashboard.removeEventListener('chartClick', handleChartClick as EventListener);
      };
    }
  }, [crossFilters, addCrossFilter, removeCrossFilter]);

  // Combine manual filters with cross-filters
  const combinedFilters = useMemo(() => {
    return getCombinedFilters(activeFilters);
  }, [activeFilters, crossFilters, getCombinedFilters]);

  // Calculate filtered data based on combined filters (manual + cross-filters)
  const filteredData = useMemo(() => {
    if (!sourceData || !report.sourceData) return report.sourceData;
    return applyFiltersToDataset(sourceData, combinedFilters);
  }, [sourceData, combinedFilters, report.sourceData]);

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
    <div className={`flex flex-col lg:flex-row gap-4 ${className}`} ref={dashboardRef}>
      {/* Filter Panel - Left Side */}
      {report.filters && report.filters.length > 0 && (
        <div className="lg:w-80 flex-shrink-0">
          <FilterPanel />
          
          {/* Cross-Filter Badges */}
          {crossFilters.length > 0 && (
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Active Cross-Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllCrossFilters}
                    className="h-6 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {crossFilters.map((filter) => (
                  <div
                    key={filter.sourceChartId}
                    className="flex items-center justify-between gap-2 p-2 bg-primary/5 rounded-md border border-primary/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {filter.filterField}: {filter.filterValue}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCrossFilter(filter.sourceChartId)}
                      className="h-5 w-5 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="flex-1 min-w-0">
        {filteredData?.metadata && (Object.keys(activeFilters).length > 0 || crossFilters.length > 0) && (
          <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredData.metadata.patientCount}</span> patients
              {sourceData?.metadata && sourceData.metadata.patientCount !== filteredData.metadata.patientCount && (
                <span className="ml-1">
                  (filtered from {sourceData.metadata.patientCount})
                </span>
              )}
              {crossFilters.length > 0 && (
                <span className="ml-2 text-xs text-primary">
                  • {crossFilters.length} cross-filter{crossFilters.length > 1 ? 's' : ''} active
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
                  <HybridChart
                    chart={chart}
                    height="100%"
                    enableCrossFilter={true}
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
