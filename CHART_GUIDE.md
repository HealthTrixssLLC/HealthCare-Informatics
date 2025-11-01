# Chart Types and Visualization Guide

This project uses a **hybrid approach** combining **ECharts** and **Plotly.js** to provide the best visualization experience.

## 🎨 Visualization Libraries

### ECharts (Default for Standard Charts)
Fast, interactive, and feature-rich for common business charts:
- **Performance**: Excellent for large datasets
- **Interactivity**: Built-in zoom, pan, and data exploration
- **Customization**: Extensive theming and styling options
- **Best For**: Dashboards, business intelligence, real-time data

### Plotly.js (Advanced Statistical Charts)
Scientific-grade visualizations with 3D support:
- **Statistical**: Box plots, violin plots, histograms
- **3D Charts**: Surface plots, 3D scatter, mesh plots
- **Heatmaps**: Advanced color scaling and clustering
- **Best For**: Data science, research, complex analytics

## 📊 Supported Chart Types

### Standard Charts (ECharts)

#### Bar Chart
```typescript
{
  type: 'bar',
  title: 'Patient Count by Age Group',
  data: [
    { name: '0-18', value: 45 },
    { name: '19-30', value: 78 },
    { name: '31-50', value: 123 }
  ]
}
```
**Use Cases**: Comparisons, rankings, frequency distributions

#### Line Chart
```typescript
{
  type: 'line',
  title: 'Trend Over Time',
  data: [
    { name: 'Jan', value: 100 },
    { name: 'Feb', value: 120 },
    { name: 'Mar', value: 115 }
  ]
}
```
**Use Cases**: Trends, time series, continuous data

#### Pie Chart
```typescript
{
  type: 'pie',
  title: 'Gender Distribution',
  data: [
    { name: 'Male', value: 52 },
    { name: 'Female', value: 48 }
  ]
}
```
**Use Cases**: Proportions, percentages, composition

#### Area Chart
```typescript
{
  type: 'area',
  title: 'Cumulative Observations',
  data: [
    { name: 'Week 1', value: 10 },
    { name: 'Week 2', value: 25 },
    { name: 'Week 3', value: 45 }
  ]
}
```
**Use Cases**: Volume over time, accumulation, magnitude

#### Scatter Plot
```typescript
{
  type: 'scatter',
  title: 'Age vs. Observation Count',
  data: [
    { name: 'Patient 1', value: 35 },
    { name: 'Patient 2', value: 42 }
  ]
}
```
**Use Cases**: Correlation, distribution, clustering

---

### Advanced Charts (Plotly.js)

#### Heatmap
```typescript
{
  type: 'heatmap',
  title: 'Condition Correlation Matrix',
  data: [
    { name: 'Diabetes', value: 0.8 },
    { name: 'Hypertension', value: 0.6 },
    { name: 'Obesity', value: 0.9 }
  ]
}
```
**Use Cases**: Correlations, patterns, intensity mapping
**Features**: Color gradients, cell annotations, clustering

#### Box Plot
```typescript
{
  type: 'box',
  title: 'Age Distribution',
  data: [
    { name: 'Group A', value: 25 },
    { name: 'Group A', value: 30 },
    { name: 'Group A', value: 28 }
  ]
}
```
**Use Cases**: Statistical analysis, outlier detection, quartiles
**Features**: Shows median, quartiles, whiskers, outliers

#### Violin Plot
```typescript
{
  type: 'violin',
  title: 'BMI Distribution',
  data: [
    { name: 'BMI', value: 22.5 },
    { name: 'BMI', value: 24.8 },
    { name: 'BMI', value: 26.3 }
  ]
}
```
**Use Cases**: Probability density, distribution shape, multimodal data
**Features**: Combines box plot + density curve

#### Waterfall Chart
```typescript
{
  type: 'waterfall',
  title: 'Patient Flow Analysis',
  data: [
    { name: 'Starting', value: 100 },
    { name: 'New Admissions', value: 25 },
    { name: 'Discharges', value: -20 },
    { name: 'Ending', value: 105 }
  ]
}
```
**Use Cases**: Sequential changes, variance analysis, financial data
**Features**: Shows cumulative effect with color-coded positive/negative

#### Sunburst Chart
```typescript
{
  type: 'sunburst',
  title: 'Hierarchical Condition Categories',
  data: [
    { name: 'Cardiovascular', value: 45 },
    { name: 'Diabetes', value: 30 },
    { name: 'Respiratory', value: 25 }
  ]
}
```
**Use Cases**: Hierarchies, nested categories, drill-down
**Features**: Radial layout, interactive zoom, space-efficient

#### Treemap
```typescript
{
  type: 'treemap',
  title: 'Resource Utilization',
  data: [
    { name: 'Lab Tests', value: 450 },
    { name: 'Imaging', value: 280 },
    { name: 'Medications', value: 620 }
  ]
}
```
**Use Cases**: Proportional data, space utilization, large datasets
**Features**: Nested rectangles, efficient space usage

#### Funnel Chart
```typescript
{
  type: 'funnel',
  title: 'Patient Journey',
  data: [
    { name: 'Initial Consultation', value: 1000 },
    { name: 'Diagnosis', value: 850 },
    { name: 'Treatment', value: 720 },
    { name: 'Follow-up', value: 650 }
  ]
}
```
**Use Cases**: Conversion rates, process flows, drop-off analysis
**Features**: Shows stage-by-stage reduction

---

## 🔄 HybridChart Component

The `HybridChart` component automatically selects the optimal library:

```tsx
import HybridChart from '@/components/HybridChart';

// Automatically uses ECharts for standard bar chart
<HybridChart chart={{ type: 'bar', title: 'My Chart', data: [...] }} />

// Automatically uses Plotly for advanced heatmap
<HybridChart chart={{ type: 'heatmap', title: 'Correlation', data: [...] }} />

// Force Plotly for any chart type
<HybridChart chart={chartData} preferPlotly={true} />
```

### Auto-Selection Logic

```typescript
// Plotly is used for:
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

// ECharts is used for:
const echartsChartTypes = [
  'bar',
  'line',
  'pie',
  'area',
  'scatter',
  'treemap',
  'funnel',
  'gauge'
];
```

---

## 🎯 Chart Selection Guidelines

### Use ECharts when:
- ✅ Need maximum performance (>10k data points)
- ✅ Building interactive dashboards
- ✅ Standard business intelligence charts
- ✅ Real-time data updates
- ✅ Mobile-responsive design

### Use Plotly when:
- ✅ Statistical analysis required
- ✅ 3D visualizations needed
- ✅ Scientific/research context
- ✅ Complex heatmaps or contours
- ✅ Advanced interactivity (hover details, zoom, pan)

---

## 🛠️ Customization Examples

### ECharts Custom Options
```tsx
import InteractiveChart from '@/components/InteractiveChart';

<InteractiveChart
  chart={{
    type: 'bar',
    title: 'Custom Bar Chart',
    data: myData,
    xAxis: { label: 'Categories' },
    yAxis: { label: 'Values' },
    tooltip: { 
      formatter: '{b}: {c} patients' 
    }
  }}
  onDataClick={(params) => {
    console.log('Clicked:', params);
  }}
  height="500px"
  enableCrossFilter={true}
/>
```

### Plotly Custom Options
```tsx
import PlotlyChart from '@/components/PlotlyChart';

<PlotlyChart
  chart={{
    type: 'box',
    title: 'Statistical Distribution',
    data: myData
  }}
  height="400px"
  className="my-custom-class"
/>
```

---

## 🎨 Theming

Both libraries automatically adapt to light/dark themes:

```typescript
// Theme is detected from ThemeProvider
const { theme } = useTheme();
const isDark = theme === 'dark';

// Colors adjust automatically
const colors = isDark 
  ? ['#6366f1', '#8b5cf6', '#ec4899'] // Dark theme colors
  : ['#6366f1', '#8b5cf6', '#ec4899']; // Light theme colors
```

---

## 📊 Performance Tips

### ECharts
- Enable `lazyUpdate` for better performance
- Use `notMerge: true` for complete redraws
- Limit data points to <50k for smooth interaction

### Plotly
- Use `useResizeHandler` for responsive layouts
- Enable `responsive: true` in config
- For large datasets, consider data aggregation

---

## 🔗 Integration with Cross-Filtering

Both chart types support Power BI-style cross-filtering:

```tsx
<HybridChart
  chart={chartData}
  enableCrossFilter={true}
  onDataClick={(params) => {
    // Custom handler + cross-filtering
    console.log('Data point clicked:', params);
  }}
/>
```

When a user clicks any chart:
1. Event bubbles to `DashboardWorkspace`
2. Cross-filter is added to store
3. All charts re-render with filtered data
4. Click again to remove filter

---

## 📚 Additional Resources

- [ECharts Documentation](https://echarts.apache.org/en/index.html)
- [Plotly.js Documentation](https://plotly.com/javascript/)
- [React-Plotly.js GitHub](https://github.com/plotly/react-plotly.js)
- [ECharts-for-React GitHub](https://github.com/hustcc/echarts-for-react)

---

## 🚀 Future Enhancements

Planned chart types:
- [ ] Sankey diagrams (flow visualization)
- [ ] Parallel coordinates (multi-dimensional data)
- [ ] Chord diagrams (relationship networks)
- [ ] 3D surface plots (bivariate functions)
- [ ] Animated timelines (temporal data)
- [ ] Geographic maps (spatial data)

---

Built with ❤️ using ECharts + Plotly.js
