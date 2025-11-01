/**
 * Matrix/Pivot Table Component
 * Power BI-style matrix for cross-tabulation
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export interface MatrixData {
  rows: string[];
  columns: string[];
  values: number[][];
  rowTotals?: number[];
  columnTotals?: number[];
  grandTotal?: number;
}

interface MatrixTableProps {
  title: string;
  data: MatrixData;
  description?: string;
  valueFormatter?: (value: number) => string;
  showHeatmap?: boolean;
}

export function MatrixTable({ 
  title, 
  data, 
  description,
  valueFormatter = (v) => v.toString(),
  showHeatmap = true
}: MatrixTableProps) {
  
  // Calculate min/max for heatmap
  const allValues = data.values.flat().filter(v => v !== null && v !== undefined);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  
  const getHeatmapColor = (value: number) => {
    if (!showHeatmap || maxValue === minValue) return '';
    
    const normalized = (value - minValue) / (maxValue - minValue);
    const intensity = Math.round(normalized * 100);
    
    if (intensity > 75) return 'bg-blue-500/30 font-semibold';
    if (intensity > 50) return 'bg-blue-500/20 font-medium';
    if (intensity > 25) return 'bg-blue-500/10';
    return '';
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
        <div className="rounded-md border overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold sticky left-0 bg-background z-10">Category</TableHead>
                {data.columns.map((col, idx) => (
                  <TableHead key={idx} className="text-center font-bold">
                    {col}
                  </TableHead>
                ))}
                {data.rowTotals && (
                  <TableHead className="text-center font-bold bg-muted">Total</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row, rowIdx) => (
                <TableRow key={rowIdx}>
                  <TableCell className="font-medium sticky left-0 bg-background z-10">
                    {row}
                  </TableCell>
                  {data.columns.map((_, colIdx) => {
                    const value = data.values[rowIdx][colIdx];
                    return (
                      <TableCell 
                        key={colIdx} 
                        className={`text-center ${getHeatmapColor(value)}`}
                      >
                        {value !== null && value !== undefined ? valueFormatter(value) : '-'}
                      </TableCell>
                    );
                  })}
                  {data.rowTotals && (
                    <TableCell className="text-center font-bold bg-muted">
                      {valueFormatter(data.rowTotals[rowIdx])}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {data.columnTotals && (
                <TableRow className="font-bold bg-muted">
                  <TableCell className="sticky left-0 bg-muted z-10">Total</TableCell>
                  {data.columnTotals.map((total, idx) => (
                    <TableCell key={idx} className="text-center">
                      {valueFormatter(total)}
                    </TableCell>
                  ))}
                  {data.grandTotal !== undefined && (
                    <TableCell className="text-center bg-muted-foreground/20">
                      <Badge variant="default">{valueFormatter(data.grandTotal)}</Badge>
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
