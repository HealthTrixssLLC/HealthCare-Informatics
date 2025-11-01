# Quick Start - React + ECharts + Plotly

## ✅ What You Have

Your Healthcare Informatics platform now uses **React 18** with a **dual charting strategy**:

- **ECharts**: Fast, interactive dashboards (bar, line, pie, area, scatter)
- **Plotly.js**: Advanced analytics (heatmap, box, violin, waterfall, 3D)
- **HybridChart**: Automatically picks the best library for each chart type

## 🚀 Run the Application

### Backend (Python FastAPI)
```powershell
cd server_py
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Add your OpenAI API key to .env
# OPENAI_API_KEY=sk-...

uvicorn app.main:app --reload --port 5000
```
**API Docs**: http://localhost:5000/docs

### Frontend (React + Vite)
```powershell
# From project root
npm install
npm run dev
```
**App URL**: http://localhost:5173

## 📊 Using Charts

### Simple Usage (Auto-Selected Library)
```tsx
import HybridChart from '@/components/HybridChart';

// Automatically uses ECharts for bar charts
<HybridChart 
  chart={{
    type: 'bar',
    title: 'Patient Count',
    data: [
      { name: 'Group A', value: 100 },
      { name: 'Group B', value: 150 }
    ]
  }}
/>

// Automatically uses Plotly for heatmaps
<HybridChart 
  chart={{
    type: 'heatmap',
    title: 'Correlation Matrix',
    data: [...] 
  }}
/>
```

### Force Specific Library
```tsx
// Force Plotly for any chart
<HybridChart chart={data} preferPlotly={true} />

// Use ECharts directly
import InteractiveChart from '@/components/InteractiveChart';
<InteractiveChart chart={data} />

// Use Plotly directly
import PlotlyChart from '@/components/PlotlyChart';
<PlotlyChart chart={data} />
```

### With Cross-Filtering
```tsx
<HybridChart
  chart={chartData}
  enableCrossFilter={true}
  onDataClick={(params) => {
    console.log('Clicked:', params);
  }}
/>
```

## 📈 Chart Type Reference

| Chart Type | Library | Use Case |
|------------|---------|----------|
| `bar` | ECharts | Comparisons, rankings |
| `line` | ECharts | Trends, time series |
| `pie` | ECharts | Proportions, percentages |
| `area` | ECharts | Volume over time |
| `scatter` | ECharts | Correlation, distribution |
| `heatmap` | Plotly | Correlation matrices |
| `box` | Plotly | Statistical analysis |
| `violin` | Plotly | Distribution shapes |
| `waterfall` | Plotly | Sequential changes |
| `sunburst` | Plotly | Hierarchies |
| `treemap` | ECharts/Plotly | Proportional data |
| `funnel` | ECharts/Plotly | Conversion rates |

## 🎨 Power BI Features

### Cross-Filtering
Click any chart to filter all other visuals:
```tsx
// In DashboardWorkspace
<HybridChart 
  chart={chart} 
  enableCrossFilter={true} 
/>
```

### Advanced KPI Cards
```tsx
import { AdvancedKPICard } from '@/components/AdvancedKPICard';

<AdvancedKPICard
  metric={{ label: "Patients", value: "1,234", icon: "users" }}
  sparklineData={[{value: 100}, {value: 120}, {value: 115}]}
  trend={{ direction: 'up', percentage: 10 }}
/>
```

### AI Insights
```tsx
import { InsightsPanel } from '@/components/InsightsPanel';

<InsightsPanel sourceData={report.sourceData} />
```

## 🔧 Project Structure

```
├── server_py/              # Python FastAPI backend
│   ├── app/
│   │   ├── main.py        # FastAPI app
│   │   ├── routes.py      # API endpoints
│   │   ├── models.py      # Pydantic schemas
│   │   └── services/      # FHIR, OpenAI, storage
│   └── requirements.txt
│
├── client/                 # React frontend
│   └── src/
│       ├── components/
│       │   ├── HybridChart.tsx        # 🆕 Auto chart selector
│       │   ├── PlotlyChart.tsx        # 🆕 Plotly wrapper
│       │   ├── InteractiveChart.tsx   # ECharts wrapper
│       │   ├── AdvancedKPICard.tsx    # Enhanced metrics
│       │   ├── WaterfallChart.tsx     # Waterfall viz
│       │   ├── MatrixTable.tsx        # Pivot table
│       │   ├── InsightsPanel.tsx      # AI insights
│       │   └── DashboardWorkspace.tsx # Main dashboard
│       ├── stores/
│       │   ├── filterStore.ts         # Manual filters
│       │   └── crossFilterStore.ts    # Cross-filtering
│       └── pages/
│           ├── Home.tsx               # Chat interface
│           └── Dashboard.tsx          # Reports list
│
└── shared/
    └── schema.ts          # TypeScript types
```

## 🔑 Environment Variables

### Backend `.env`
```env
OPENAI_API_KEY=sk-your-key-here
PORT=5000
FHIR_BASE_URL=https://hapi.fhir.org/baseR4
```

### Frontend `.env` (optional)
```env
VITE_API_URL=http://localhost:5000
```

## 🐛 Troubleshooting

**Charts not rendering?**
```powershell
npm install plotly.js react-plotly.js echarts echarts-for-react recharts
```

**Backend won't start?**
```powershell
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install --upgrade -r server_py/requirements.txt
```

**Cross-filtering not working?**
```powershell
npm install zustand
```

## 📚 Documentation

- [README.md](./README.md) - Full setup guide
- [MIGRATION.md](./MIGRATION.md) - TypeScript to Python migration
- [CHART_GUIDE.md](./CHART_GUIDE.md) - Comprehensive chart types guide

## 🚢 Deployment

**Backend (Docker)**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY server_py/requirements.txt .
RUN pip install -r requirements.txt
COPY server_py/app ./app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
```

**Frontend (Build)**
```powershell
npm run build
# Deploy dist/ folder to Vercel/Netlify
```

---

## 🎯 Next Steps

1. ✅ Start the backend: `cd server_py && uvicorn app.main:app --reload`
2. ✅ Start the frontend: `npm run dev`
3. ✅ Open http://localhost:5173
4. ✅ Ask AI to generate a healthcare report
5. ✅ Click charts to see cross-filtering in action!

---

**Tech Stack**: React 18 • TypeScript • FastAPI • ECharts • Plotly.js • Zustand • TailwindCSS

Built with ❤️ by HealthTrixss LLC
