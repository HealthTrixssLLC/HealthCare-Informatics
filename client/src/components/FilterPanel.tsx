import { useState } from 'react';
import type { FilterDefinition } from '@shared/schema';
import { useFilterStore } from '@/stores/filterStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Filter, X, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  className?: string;
}

export default function FilterPanel({ className = '' }: FilterPanelProps) {
  const { filterDefinitions, activeFilters, updateFilter, clearFilter, resetFilters } = useFilterStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (filterDefinitions.length === 0) {
    return null;
  }

  const activeFilterCount = Object.keys(activeFilters).filter(
    key => activeFilters[key] !== undefined && activeFilters[key] !== null
  ).length;

  const handleMultiSelectToggle = (filterId: string, value: string | number) => {
    const currentValues = (activeFilters[filterId] as any[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFilter(filterId, newValues.length > 0 ? newValues : undefined);
  };

  if (isCollapsed) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            data-testid="button-expand-filters"
          >
            Show
          </Button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <div>
            <CardTitle className="text-base">Filters</CardTitle>
            <CardDescription className="text-xs">
              Filter data to focus your analysis
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              data-testid="button-reset-filters"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            data-testid="button-collapse-filters"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {filterDefinitions.map(filter => (
              <div key={filter.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={filter.id} className="text-sm font-medium">
                    {filter.label}
                  </Label>
                  {activeFilters[filter.id] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter(filter.id)}
                      className="h-6 px-2 text-xs"
                      data-testid={`button-clear-${filter.id}`}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                
                {filter.description && (
                  <p className="text-xs text-muted-foreground">{filter.description}</p>
                )}

                {filter.type === 'multiselect' && filter.options && (
                  <div className="space-y-2">
                    {filter.options.map(option => {
                      const isChecked = ((activeFilters[filter.id] as any[]) || []).includes(option.value);
                      return (
                        <div key={option.value} className="flex items-center gap-2">
                          <Checkbox
                            id={`${filter.id}-${option.value}`}
                            checked={isChecked}
                            onCheckedChange={() => handleMultiSelectToggle(filter.id, option.value)}
                            data-testid={`checkbox-${filter.id}-${option.value}`}
                          />
                          <Label
                            htmlFor={`${filter.id}-${option.value}`}
                            className="flex items-center gap-2 text-sm font-normal cursor-pointer"
                          >
                            {option.label}
                            {option.count !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                {option.count}
                              </Badge>
                            )}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {filter.type === 'select' && filter.options && (
                  <select
                    id={filter.id}
                    value={activeFilters[filter.id] || ''}
                    onChange={(e) => updateFilter(filter.id, e.target.value || undefined)}
                    className="w-full px-3 py-2 border rounded-md"
                    data-testid={`select-${filter.id}`}
                  >
                    <option value="">All</option>
                    {filter.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} {option.count !== undefined ? `(${option.count})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {activeFilterCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
