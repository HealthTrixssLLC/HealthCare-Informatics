/**
 * AI Insights Panel - Power BI-style smart insights
 * Shows key influencers, anomalies, and smart narratives
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, AlertTriangle, Lightbulb, BarChart3, Target } from 'lucide-react';
import type { SourceDataset } from '@shared/schema';

interface InsightsPanelProps {
  sourceData: SourceDataset;
  className?: string;
}

interface Insight {
  type: 'trend' | 'anomaly' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
}

export function InsightsPanel({ sourceData, className = '' }: InsightsPanelProps) {
  // Generate insights from data
  const insights = generateInsights(sourceData);
  
  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      case 'pattern': return <BarChart3 className="w-4 h-4" />;
      case 'recommendation': return <Target className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };
  
  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'trend': return 'text-blue-600 dark:text-blue-400 bg-blue-500/10';
      case 'anomaly': return 'text-red-600 dark:text-red-400 bg-red-500/10';
      case 'pattern': return 'text-purple-600 dark:text-purple-400 bg-purple-500/10';
      case 'recommendation': return 'text-green-600 dark:text-green-400 bg-green-500/10';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-500/10';
    }
  };
  
  const getImpactBadge = (impact: Insight['impact']) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    return <Badge variant={variants[impact] as any}>{impact.toUpperCase()}</Badge>;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">AI Insights</CardTitle>
        </div>
        <CardDescription>
          Smart analysis of your data with key patterns and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3 mt-4">
            {insights.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} getInsightIcon={getInsightIcon} getInsightColor={getInsightColor} getImpactBadge={getImpactBadge} />
            ))}
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-3 mt-4">
            {insights.filter(i => i.type === 'trend').map((insight, idx) => (
              <InsightCard key={idx} insight={insight} getInsightIcon={getInsightIcon} getInsightColor={getInsightColor} getImpactBadge={getImpactBadge} />
            ))}
          </TabsContent>
          
          <TabsContent value="anomalies" className="space-y-3 mt-4">
            {insights.filter(i => i.type === 'anomaly').map((insight, idx) => (
              <InsightCard key={idx} insight={insight} getInsightIcon={getInsightIcon} getInsightColor={getInsightColor} getImpactBadge={getImpactBadge} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function InsightCard({ 
  insight, 
  getInsightIcon, 
  getInsightColor, 
  getImpactBadge 
}: { 
  insight: Insight; 
  getInsightIcon: (type: Insight['type']) => JSX.Element;
  getInsightColor: (type: Insight['type']) => string;
  getImpactBadge: (impact: Insight['impact']) => JSX.Element;
}) {
  return (
    <div className="p-4 rounded-lg border bg-card hover-elevate transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
          {getInsightIcon(insight.type)}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm">{insight.title}</h4>
            {getImpactBadge(insight.impact)}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insight.description}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Confidence:</span>
            <div className="flex-1 max-w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${insight.confidence}%` }}
              />
            </div>
            <span>{insight.confidence}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateInsights(sourceData: SourceDataset): Insight[] {
  const insights: Insight[] = [];
  
  if (!sourceData.demographics) return insights;
  
  // Gender distribution insights
  const genderDist = sourceData.demographics.gender_distribution;
  if (genderDist) {
    const total = Object.values(genderDist).reduce((a, b) => a + b, 0);
    const maleCount = genderDist['male'] || 0;
    const femaleCount = genderDist['female'] || 0;
    
    if (total > 0) {
      const malePercent = (maleCount / total) * 100;
      const femalePercent = (femaleCount / total) * 100;
      
      if (Math.abs(malePercent - femalePercent) > 20) {
        insights.push({
          type: 'pattern',
          title: 'Gender Distribution Imbalance',
          description: `The cohort shows ${malePercent > femalePercent ? 'male' : 'female'} predominance (${Math.max(malePercent, femalePercent).toFixed(1)}% vs ${Math.min(malePercent, femalePercent).toFixed(1)}%). This may affect population health insights and should be considered in analysis.`,
          confidence: 85,
          impact: 'medium'
        });
      }
    }
  }
  
  // Age group insights
  const ageGroups = sourceData.demographics.age_groups;
  if (ageGroups) {
    const maxGroup = Object.entries(ageGroups).reduce((max, [group, count]) => 
      count > max.count ? { group, count } : max
    , { group: '', count: 0 });
    
    if (maxGroup.count > 0) {
      const total = Object.values(ageGroups).reduce((a, b) => a + b, 0);
      const percentage = (maxGroup.count / total) * 100;
      
      insights.push({
        type: 'trend',
        title: `Dominant Age Group: ${maxGroup.group}`,
        description: `The ${maxGroup.group} age group represents ${percentage.toFixed(1)}% of the patient population. Healthcare interventions should be tailored to this demographic's specific needs.`,
        confidence: 90,
        impact: 'high'
      });
    }
  }
  
  // Average age insights
  if (sourceData.demographics.average_age) {
    const avgAge = sourceData.demographics.average_age;
    
    if (avgAge < 30) {
      insights.push({
        type: 'recommendation',
        title: 'Young Population Focus',
        description: `Average age of ${avgAge.toFixed(1)} years suggests focusing on preventive care, vaccination programs, and health education initiatives.`,
        confidence: 80,
        impact: 'medium'
      });
    } else if (avgAge > 60) {
      insights.push({
        type: 'recommendation',
        title: 'Aging Population Considerations',
        description: `Average age of ${avgAge.toFixed(1)} years indicates need for chronic disease management, fall prevention programs, and medication review services.`,
        confidence: 82,
        impact: 'high'
      });
    }
  }
  
  // Observation insights
  if (sourceData.observations && sourceData.observations.length > 0) {
    const avgObsPerPatient = sourceData.observations.length / (sourceData.metadata?.patient_count || 1);
    
    if (avgObsPerPatient > 5) {
      insights.push({
        type: 'pattern',
        title: 'High Observation Density',
        description: `Average of ${avgObsPerPatient.toFixed(1)} observations per patient suggests active monitoring or complex health conditions requiring frequent assessments.`,
        confidence: 75,
        impact: 'medium'
      });
    } else if (avgObsPerPatient < 2) {
      insights.push({
        type: 'anomaly',
        title: 'Low Observation Rate',
        description: `Only ${avgObsPerPatient.toFixed(1)} observations per patient on average. Consider if this represents incomplete data capture or truly minimal monitoring.`,
        confidence: 70,
        impact: 'medium'
      });
    }
  }
  
  // Condition insights
  if (sourceData.conditions && sourceData.conditions.length > 0) {
    const conditionsPerPatient = sourceData.conditions.length / (sourceData.metadata?.patient_count || 1);
    
    if (conditionsPerPatient > 3) {
      insights.push({
        type: 'trend',
        title: 'High Comorbidity Rate',
        description: `Average of ${conditionsPerPatient.toFixed(1)} conditions per patient indicates significant comorbidity. Care coordination and integrated treatment plans are essential.`,
        confidence: 88,
        impact: 'high'
      });
    }
  }
  
  return insights;
}
