/**
 * Waterfall Chart Component
 * Shows cumulative effect of sequential positive/negative values
 * Common in financial and variance analysis
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

export interface WaterfallDataPoint {
  name: string;
  value: number;
  isTotal?: boolean;
}

interface WaterfallChartProps {
  title: string;
  data: WaterfallDataPoint[];
  description?: string;
}

export function WaterfallChart({ title, data, description }: WaterfallChartProps) {
  // Calculate cumulative values for waterfall display
  const waterfallData = data.map((point, index) => {
    let start = 0;
    
    if (point.isTotal) {
      // Total bars start from 0
      return {
        ...point,
        start: 0,
        end: point.value,
        displayValue: point.value
      };
    }
    
    // Calculate start position based on previous items
    for (let i = 0; i < index; i++) {
      if (!data[i].isTotal) {
        start += data[i].value;
      }
    }
    
    return {
      ...point,
      start,
      end: start + point.value,
      displayValue: point.value
    };
  });

  const getBarColor = (point: typeof waterfallData[0]) => {
    if (point.isTotal) return 'hsl(var(--chart-3))';
    return point.value >= 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-5))';
  };

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'end') return ['', ''];
                  return [value, 'Change'];
                }}
              />
              <Legend />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
              
              {/* Base bars (invisible) to position the visible bars */}
              <Bar dataKey="start" stackId="stack" fill="transparent" />
              
              {/* Visible bars showing the change */}
              <Bar dataKey="displayValue" stackId="stack">
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
