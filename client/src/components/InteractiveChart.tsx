import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  TreemapChart,
  FunnelChart,
  GaugeChart,
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
  ToolboxComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ChartDataSet } from '@shared/schema';
import { useTheme } from '@/components/ThemeProvider';

// Register required components
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  TreemapChart,
  FunnelChart,
  GaugeChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
  ToolboxComponent,
  CanvasRenderer,
]);

interface InteractiveChartProps {
  chart: ChartDataSet;
  onDataClick?: (params: any) => void;
  height?: string;
  className?: string;
  enableCrossFilter?: boolean;
}

export default function InteractiveChart({ 
  chart, 
  onDataClick,
  height = '400px',
  className = '',
  enableCrossFilter = true
}: InteractiveChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getChartOption = (): any => {
    const baseColors = [
      '#6366f1', // indigo
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#f97316', // orange
      '#06b6d4', // cyan
    ];

    const textColor = isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)';
    const subTextColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
    const backgroundColor = isDark ? 'transparent' : 'transparent';

    const baseOption = {
      backgroundColor,
      color: baseColors,
      textStyle: {
        color: textColor,
      },
      tooltip: {
        trigger: chart.type === 'pie' ? 'item' : 'axis',
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: borderColor,
        textStyle: {
          color: textColor,
        },
        confine: true,
        formatter: chart.tooltip?.formatter,
      },
      legend: {
        show: chart.legend?.show !== false,
        orient: chart.legend?.orient || 'horizontal',
        top: chart.legend?.position === 'top' ? 0 : chart.legend?.position === 'bottom' ? 'bottom' : 'top',
        textStyle: {
          color: textColor,
        },
      },
    };

    switch (chart.type) {
      case 'bar':
        return {
          ...baseOption,
          xAxis: {
            type: chart.xAxis?.type || 'category',
            data: chart.data.map(d => d.name),
            name: chart.xAxis?.label,
            nameTextStyle: { color: subTextColor },
            axisLine: { lineStyle: { color: borderColor } },
            axisLabel: { color: textColor },
          },
          yAxis: {
            type: chart.yAxis?.type || 'value',
            name: chart.yAxis?.label,
            nameTextStyle: { color: subTextColor },
            axisLine: { lineStyle: { color: borderColor } },
            axisLabel: { color: textColor },
            splitLine: { lineStyle: { color: borderColor } },
          },
          series: [
            {
              name: chart.title,
              type: 'bar',
              data: chart.data.map(d => d.value),
              itemStyle: {
                borderRadius: [4, 4, 0, 0],
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ],
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true,
          },
        };

      case 'line':
        return {
          ...baseOption,
          xAxis: {
            type: chart.xAxis?.type || 'category',
            data: chart.data.map(d => d.name),
            name: chart.xAxis?.label,
            nameTextStyle: { color: subTextColor },
            axisLine: { lineStyle: { color: borderColor } },
            axisLabel: { color: textColor },
            boundaryGap: false,
          },
          yAxis: {
            type: chart.yAxis?.type || 'value',
            name: chart.yAxis?.label,
            nameTextStyle: { color: subTextColor },
            axisLine: { lineStyle: { color: borderColor } },
            axisLabel: { color: textColor },
            splitLine: { lineStyle: { color: borderColor } },
          },
          series: [
            {
              name: chart.title,
              type: 'line',
              data: chart.data.map(d => d.value),
              smooth: true,
              symbolSize: 8,
              lineStyle: {
                width: 3,
              },
              areaStyle: {
                opacity: 0.1,
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ],
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true,
          },
        };

      case 'pie':
        return {
          ...baseOption,
          series: [
            {
              name: chart.title,
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 8,
                borderColor: backgroundColor,
                borderWidth: 2,
              },
              label: {
                show: true,
                formatter: '{b}: {d}%',
                color: textColor,
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 16,
                  fontWeight: 'bold',
                },
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
              data: chart.data.map(d => ({
                name: d.name,
                value: d.value,
              })),
            },
          ],
        };

      case 'area':
        return {
          ...baseOption,
          xAxis: {
            type: chart.xAxis?.type || 'category',
            data: chart.data.map(d => d.name),
            name: chart.xAxis?.label,
            nameTextStyle: { color: subTextColor },
            axisLine: { lineStyle: { color: borderColor } },
            axisLabel: { color: textColor },
            boundaryGap: false,
          },
          yAxis: {
            type: chart.yAxis?.type || 'value',
            name: chart.yAxis?.label,
            nameTextStyle: { color: subTextColor },
            axisLine: { lineStyle: { color: borderColor } },
            axisLabel: { color: textColor },
            splitLine: { lineStyle: { color: borderColor } },
          },
          series: [
            {
              name: chart.title,
              type: 'line',
              data: chart.data.map(d => d.value),
              smooth: true,
              areaStyle: {
                opacity: 0.5,
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ],
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true,
          },
        };

      case 'treemap':
        return {
          ...baseOption,
          series: [
            {
              name: chart.title,
              type: 'treemap',
              data: chart.data.map(d => ({
                name: d.name,
                value: d.value,
              })),
              label: {
                show: true,
                formatter: '{b}: {c}',
                color: textColor,
              },
              itemStyle: {
                borderColor: borderColor,
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ],
        };

      case 'funnel':
        return {
          ...baseOption,
          series: [
            {
              name: chart.title,
              type: 'funnel',
              data: chart.data
                .map(d => ({
                  name: d.name,
                  value: d.value,
                }))
                .sort((a, b) => b.value - a.value),
              label: {
                show: true,
                position: 'inside',
                color: '#fff',
              },
              itemStyle: {
                borderColor: borderColor,
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ],
        };

      case 'gauge':
        const maxValue = Math.max(...chart.data.map(d => d.value));
        const mainValue = chart.data[0]?.value || 0;
        return {
          ...baseOption,
          series: [
            {
              name: chart.title,
              type: 'gauge',
              max: maxValue * 1.2,
              detail: {
                formatter: '{value}',
                color: textColor,
              },
              axisLine: {
                lineStyle: {
                  color: [
                    [0.3, '#10b981'],
                    [0.7, '#f59e0b'],
                    [1, '#ef4444'],
                  ],
                },
              },
              data: [
                {
                  value: mainValue,
                  name: chart.data[0]?.name || '',
                },
              ],
            },
          ],
        };

      case 'scatter':
        return {
          ...baseOption,
          xAxis: {
            type: chart.xAxis?.type || 'value',
            name: chart.xAxis?.label,
            nameTextStyle: { color: subTextColor },
            axisLine: { lineStyle: { color: borderColor } },
            axisLabel: { color: textColor },
            splitLine: { lineStyle: { color: borderColor } },
          },
          yAxis: {
            type: chart.yAxis?.type || 'value',
            name: chart.yAxis?.label,
            nameTextStyle: { color: subTextColor },
            axisLine: { lineStyle: { color: borderColor } },
            axisLabel: { color: textColor },
            splitLine: { lineStyle: { color: borderColor } },
          },
          series: [
            {
              name: chart.title,
              type: 'scatter',
              data: chart.data.map(d => [d.value, d.value]),
              symbolSize: 10,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ],
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true,
          },
        };

      default:
        return baseOption;
    }
  };

  // Handle chart clicks for cross-filtering or custom handlers
  const handleChartClick = (params: any) => {
    // Call custom handler if provided
    if (onDataClick) {
      onDataClick(params);
    }
    
    // Enable cross-filtering by default for interactive charts
    if (enableCrossFilter && params.data) {
      // The DashboardWorkspace will handle the cross-filter logic
      // This passes the event up with chart context
      const event = new CustomEvent('chartClick', {
        detail: {
          chartId: chart.id,
          chartTitle: chart.title,
          dataPoint: {
            name: params.name || params.data.name,
            value: params.value || params.data.value,
            seriesName: params.seriesName
          }
        },
        bubbles: true
      });
      
      if (params.event?.event?.target) {
        params.event.event.target.dispatchEvent(event);
      }
    }
  };

  const onEvents: Record<string, Function> = {
    click: handleChartClick,
  };

  return (
    <div className={className} data-testid={`chart-${chart.id}`}>
      {chart.description && (
        <p className="text-sm text-muted-foreground mb-2 px-1">{chart.description}</p>
      )}
      <ReactEChartsCore
        echarts={echarts}
        option={getChartOption()}
        notMerge={true}
        lazyUpdate={true}
        style={{ height, width: '100%' }}
        onEvents={onEvents}
      />
    </div>
  );
}
