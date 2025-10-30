import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@shared/schema';

interface MetricCardsProps {
  metrics: MetricCard[];
}

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card
          key={index}
          className="p-6 min-h-32"
          data-testid={`card-metric-${index}`}
        >
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {metric.label}
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-4xl font-bold" data-testid={`text-metric-value-${index}`}>
              {metric.value}
            </p>
            {metric.trend && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  metric.trend.direction === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
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
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
