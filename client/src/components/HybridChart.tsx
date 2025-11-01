/**
 * HybridChart - Intelligent chart renderer that chooses between ECharts and Plotly
 * Uses ECharts for standard charts and Plotly for advanced visualizations
 */
import type { ChartDataSet } from '@shared/schema';
import InteractiveChart from './InteractiveChart';
import PlotlyChart from './PlotlyChart';

interface HybridChartProps {
  chart: ChartDataSet;
  onDataClick?: (params: any) => void;
  height?: string;
  className?: string;
  enableCrossFilter?: boolean;
  preferPlotly?: boolean;
}

/**
 * Determines which charting library to use based on chart type
 * ECharts: bar, line, pie, area, scatter, treemap, funnel, gauge
 * Plotly: 3D charts, statistical plots, heatmap, box, violin, sunburst, waterfall
 */
export default function HybridChart({
  chart,
  onDataClick,
  height = '400px',
  className = '',
  enableCrossFilter = true,
  preferPlotly = false
}: HybridChartProps) {
  
  // Advanced chart types that benefit from Plotly
  const plotlyChartTypes = [
    'heatmap', 
    'box', 
    'violin', 
    'sunburst', 
    'waterfall',
    'contour',
    'surface',
    'mesh3d',
    'scatter3d',
    'histogram2d'
  ];

  const usePlotly = preferPlotly || plotlyChartTypes.includes(chart.type);

  if (usePlotly) {
    return (
      <PlotlyChart
        chart={chart}
        onDataClick={onDataClick}
        height={height}
        className={className}
        enableCrossFilter={enableCrossFilter}
      />
    );
  }

  return (
    <InteractiveChart
      chart={chart}
      onDataClick={onDataClick}
      height={height}
      className={className}
      enableCrossFilter={enableCrossFilter}
    />
  );
}
