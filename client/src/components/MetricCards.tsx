import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@shared/schema';

interface MetricCardsProps {
  metrics: MetricCard[];
}

export function MetricCards({ metrics }: MetricCardsProps) {
  const colors = [
    'from-chart-1/20 to-chart-1/5 border-chart-1/20',
    'from-chart-2/20 to-chart-2/5 border-chart-2/20',
    'from-chart-3/20 to-chart-3/5 border-chart-3/20',
    'from-chart-4/20 to-chart-4/5 border-chart-4/20',
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {metrics.map((metric, index) => (
        <Card
          key={index}
          className={`p-6 min-h-36 bg-gradient-to-br ${colors[index % colors.length]} border hover-elevate transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
          style={{ animationDelay: `${index * 100}ms` }}
          data-testid={`card-metric-${index}`}
        >
          <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            {metric.label}
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-4xl font-bold" data-testid={`text-metric-value-${index}`}>
              {metric.value}
            </p>
            {metric.trend && (
              <div
                className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg ${
                  metric.trend.direction === 'up'
                    ? 'text-green-600 dark:text-green-400 bg-green-500/10'
                    : 'text-red-600 dark:text-red-400 bg-red-500/10'
                }`}
              >
                {metric.trend.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {metric.trend.percentage}%
              </div>
            )}
          </div>
          {metric.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{metric.description}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
