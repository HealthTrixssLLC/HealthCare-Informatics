/**
 * PlotlyChart - Advanced visualizations using Plotly.js
 * Supports 3D charts, statistical plots, and specialized visualizations
 */
import Plot from 'react-plotly.js';
import type { ChartDataSet } from '@shared/schema';
import { useTheme } from '@/components/ThemeProvider';
import { useMemo } from 'react';

interface PlotlyChartProps {
  chart: ChartDataSet;
  onDataClick?: (params: any) => void;
  height?: string;
  className?: string;
  enableCrossFilter?: boolean;
}

export default function PlotlyChart({
  chart,
  onDataClick,
  height = '400px',
  className = '',
  enableCrossFilter = true
}: PlotlyChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Handle chart clicks for cross-filtering
  const handlePlotlyClick = (data: any) => {
    if (onDataClick) {
      onDataClick(data);
    }

    if (enableCrossFilter && data.points && data.points[0]) {
      const point = data.points[0];
      const event = new CustomEvent('chartClick', {
        detail: {
          chartId: chart.id,
          chartTitle: chart.title,
          dataPoint: {
            name: point.x || point.label || point.name,
            value: point.y || point.value,
            seriesName: point.data.name
          }
        },
        bubbles: true
      });

      if (data.event?.target) {
        data.event.target.dispatchEvent(event);
      }
    }
  };

  // Generate Plotly config based on chart type
  const plotlyData = useMemo(() => {
    const baseColors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', 
      '#10b981', '#3b82f6', '#f97316', '#06b6d4'
    ];

    switch (chart.type) {
      case 'bar':
        return [{
          type: 'bar' as const,
          x: chart.data.map(d => d.name),
          y: chart.data.map(d => d.value),
          marker: {
            color: baseColors[0],
            line: { width: 1, color: isDark ? '#ffffff20' : '#00000020' }
          },
          name: chart.title,
          hovertemplate: '<b>%{x}</b><br>%{y}<extra></extra>'
        }];

      case 'line':
        return [{
          type: 'scatter' as const,
          mode: 'lines+markers' as const,
          x: chart.data.map(d => d.name),
          y: chart.data.map(d => d.value),
          line: { 
            color: baseColors[0], 
            width: 3,
            shape: 'spline' as const
          },
          marker: { size: 8, color: baseColors[0] },
          name: chart.title,
          fill: 'tozeroy',
          fillcolor: `${baseColors[0]}20`,
          hovertemplate: '<b>%{x}</b><br>%{y}<extra></extra>'
        }];

      case 'pie':
        return [{
          type: 'pie' as const,
          labels: chart.data.map(d => d.name),
          values: chart.data.map(d => d.value),
          marker: {
            colors: baseColors,
            line: { width: 2, color: isDark ? '#1f1f1f' : '#ffffff' }
          },
          textposition: 'auto' as const,
          hovertemplate: '<b>%{label}</b><br>%{value} (%{percent})<extra></extra>'
        }];

      case 'area':
        return [{
          type: 'scatter' as const,
          mode: 'lines' as const,
          x: chart.data.map(d => d.name),
          y: chart.data.map(d => d.value),
          fill: 'tozeroy',
          fillcolor: `${baseColors[0]}40`,
          line: { color: baseColors[0], width: 2 },
          name: chart.title,
          hovertemplate: '<b>%{x}</b><br>%{y}<extra></extra>'
        }];

      case 'scatter':
        return [{
          type: 'scatter' as const,
          mode: 'markers' as const,
          x: chart.data.map(d => d.value),
          y: chart.data.map(d => d.value * Math.random()),
          marker: { 
            size: 10, 
            color: chart.data.map((_, i) => baseColors[i % baseColors.length]),
            line: { width: 1, color: isDark ? '#ffffff40' : '#00000040' }
          },
          text: chart.data.map(d => d.name),
          name: chart.title,
          hovertemplate: '<b>%{text}</b><br>X: %{x}<br>Y: %{y}<extra></extra>'
        }];

      case 'heatmap':
        // Create heatmap data
        const uniqueNames = [...new Set(chart.data.map(d => d.name))];
        const matrix = uniqueNames.map(name => 
          chart.data.filter(d => d.name === name).map(d => d.value)
        );
        
        return [{
          type: 'heatmap' as const,
          z: matrix,
          x: Array.from({ length: matrix[0]?.length || 0 }, (_, i) => `Col ${i + 1}`),
          y: uniqueNames,
          colorscale: 'Viridis' as const,
          hovertemplate: '<b>%{y}</b><br>%{x}: %{z}<extra></extra>'
        }];

      case 'box':
        return [{
          type: 'box' as const,
          y: chart.data.map(d => d.value),
          name: chart.title,
          marker: { color: baseColors[0] },
          boxmean: 'sd' as const,
          hovertemplate: '<b>%{y}</b><extra></extra>'
        }];

      case 'violin':
        return [{
          type: 'violin' as const,
          y: chart.data.map(d => d.value),
          name: chart.title,
          marker: { color: baseColors[0] },
          box: { visible: true },
          meanline: { visible: true },
          hovertemplate: '<b>%{y}</b><extra></extra>'
        }];

      case 'sunburst':
        return [{
          type: 'sunburst' as const,
          labels: chart.data.map(d => d.name),
          parents: chart.data.map(() => ''),
          values: chart.data.map(d => d.value),
          marker: { colors: baseColors },
          hovertemplate: '<b>%{label}</b><br>%{value}<extra></extra>'
        }];

      case 'treemap':
        return [{
          type: 'treemap' as const,
          labels: chart.data.map(d => d.name),
          parents: chart.data.map(() => ''),
          values: chart.data.map(d => d.value),
          marker: { colors: baseColors },
          textposition: 'middle center' as const,
          hovertemplate: '<b>%{label}</b><br>%{value}<extra></extra>'
        }];

      case 'funnel':
        return [{
          type: 'funnel' as const,
          y: chart.data.map(d => d.name),
          x: chart.data.map(d => d.value),
          marker: { color: baseColors },
          textposition: 'inside' as const,
          textinfo: 'value+percent initial' as const,
          hovertemplate: '<b>%{y}</b><br>%{x}<extra></extra>'
        }];

      case 'waterfall':
        // Calculate running totals for waterfall
        let runningTotal = 0;
        const measures = chart.data.map((d, i) => {
          if (i === 0) return 'absolute';
          if (i === chart.data.length - 1) return 'total';
          return 'relative';
        });

        return [{
          type: 'waterfall' as const,
          x: chart.data.map(d => d.name),
          y: chart.data.map(d => d.value),
          measure: measures,
          connector: { line: { color: isDark ? '#666' : '#ccc' } },
          increasing: { marker: { color: '#10b981' } },
          decreasing: { marker: { color: '#ef4444' } },
          totals: { marker: { color: '#6366f1' } },
          hovertemplate: '<b>%{x}</b><br>%{y}<extra></extra>'
        }];

      default:
        return [{
          type: 'bar' as const,
          x: chart.data.map(d => d.name),
          y: chart.data.map(d => d.value),
          marker: { color: baseColors[0] }
        }];
    }
  }, [chart, isDark]);

  const layout = useMemo(() => ({
    title: {
      text: '',
      font: { color: isDark ? '#e5e7eb' : '#1f2937' }
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      color: isDark ? '#e5e7eb' : '#1f2937',
      family: 'Inter, system-ui, sans-serif'
    },
    xaxis: {
      title: chart.xAxis?.label || '',
      gridcolor: isDark ? '#374151' : '#e5e7eb',
      color: isDark ? '#9ca3af' : '#6b7280'
    },
    yaxis: {
      title: chart.yAxis?.label || '',
      gridcolor: isDark ? '#374151' : '#e5e7eb',
      color: isDark ? '#9ca3af' : '#6b7280'
    },
    legend: {
      font: { color: isDark ? '#e5e7eb' : '#1f2937' },
      bgcolor: 'transparent'
    },
    autosize: true,
    margin: { l: 50, r: 30, t: 30, b: 50 },
    hovermode: 'closest' as const
  }), [chart, isDark]);

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    toImageButtonOptions: {
      format: 'png' as const,
      filename: `${chart.title || 'chart'}`,
      height: 800,
      width: 1200,
      scale: 2
    }
  };

  return (
    <div className={className} data-testid={`plotly-chart-${chart.id}`}>
      {chart.description && (
        <p className="text-sm text-muted-foreground mb-2 px-1">{chart.description}</p>
      )}
      <Plot
        data={plotlyData as any}
        layout={layout as any}
        config={config}
        style={{ width: '100%', height }}
        onClick={handlePlotlyClick}
        useResizeHandler={true}
      />
    </div>
  );
}
