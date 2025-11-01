/**
 * Advanced KPI Card with sparkline, trend indicators, and comparison
 * Power BI-style metric visualization
 */
import { TrendingUp, TrendingDown, Activity, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MetricCard as MetricCardType } from '@shared/schema';

interface AdvancedKPICardProps {
  metric: MetricCardType;
  sparklineData?: Array<{ value: number }>;
  comparisonValue?: string | number;
  comparisonLabel?: string;
  index?: number;
}

export function AdvancedKPICard({ 
  metric, 
  sparklineData,
  comparisonValue,
  comparisonLabel = 'vs previous',
  index = 0
}: AdvancedKPICardProps) {
  const colors = [
    'from-blue-500/20 to-blue-500/5 border-blue-500/20',
    'from-purple-500/20 to-purple-500/5 border-purple-500/20',
    'from-pink-500/20 to-pink-500/5 border-pink-500/20',
    'from-amber-500/20 to-amber-500/5 border-amber-500/20',
  ];

  const accentColors = [
    'text-blue-600 dark:text-blue-400',
    'text-purple-600 dark:text-purple-400',
    'text-pink-600 dark:text-pink-400',
    'text-amber-600 dark:text-amber-400',
  ];

  const sparklineColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <Card
      className={`p-6 min-h-36 bg-gradient-to-br ${colors[index % colors.length]} border hover-elevate transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 relative overflow-hidden`}
      style={{ animationDelay: `${index * 100}ms` }}
      data-testid={`card-kpi-${index}`}
    >
      {/* Background Icon */}
      <div className="absolute top-4 right-4 opacity-5">
        <Activity className="w-20 h-20" />
      </div>

      {/* Label */}
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
        {metric.label}
      </p>

      {/* Value and Trend */}
      <div className="flex items-baseline gap-3 mb-2">
        <p className={`text-4xl font-bold ${accentColors[index % accentColors.length]}`} data-testid={`text-kpi-value-${index}`}>
          {metric.value}
        </p>
        {metric.trend && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
              metric.trend.direction === 'up'
                ? 'text-green-600 dark:text-green-400 bg-green-500/10'
                : metric.trend.direction === 'down'
                ? 'text-red-600 dark:text-red-400 bg-red-500/10'
                : 'text-gray-600 dark:text-gray-400 bg-gray-500/10'
            }`}
          >
            {metric.trend.direction === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : metric.trend.direction === 'down' ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {metric.trend.percentage}%
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="h-12 mt-3 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparklineColors[index % sparklineColors.length]}
                fill={sparklineColors[index % sparklineColors.length]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Description and Comparison */}
      <div className="mt-3 space-y-1">
        {metric.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{metric.description}</p>
        )}
        {comparisonValue && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">{comparisonValue}</span> {comparisonLabel}
          </p>
        )}
      </div>
    </Card>
  );
}
