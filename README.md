# Healthcare Informatics Platform

A modern healthcare data analytics platform that transforms FHIR data into insightful, interactive reports using AI-powered analysis and Power BI-style visualizations.

## 🚀 Features

### Core Capabilities
- **FHIR Data Integration**: Connects to FHIR R4 servers to fetch patient, observation, and condition data
- **AI-Powered Reports**: Uses OpenAI to generate comprehensive healthcare analytics reports
- **Interactive Dashboards**: Power BI-style interactive visualizations with cross-filtering
- **Advanced Analytics**: KPI cards, waterfall charts, matrix tables, and AI insights
- **Real-time Filtering**: Dynamic data filtering with instant visualization updates
- **Session Management**: Persistent chat sessions with report history

### Power BI-Style Features
- ✨ **Cross-Filtering**: Click any chart to filter all other visuals
- 📊 **Advanced Charts**: Waterfall, combo, matrix/pivot tables, gauges
- 🎯 **Smart KPI Cards**: Sparklines, trend indicators, comparison metrics
- 🧠 **AI Insights Panel**: Automatic pattern detection, anomalies, recommendations
- 🎨 **Interactive Grid Layout**: Drag-and-drop dashboard customization
- 🔍 **Multi-dimensional Filtering**: Age, gender, date range, conditions

## 🏗️ Architecture

```
├── client/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # UI components (charts, panels, dashboards)
│   │   ├── pages/         # Route pages (Home, Dashboard)
│   │   ├── stores/        # Zustand state management
│   │   ├── lib/           # Utilities and transformations
│   │   └── hooks/         # Custom React hooks
│   └── public/
├── server_py/             # Python FastAPI backend
│   ├── app/
│   │   ├── services/      # FHIR client, OpenAI, aggregation
│   │   ├── models.py      # Pydantic data models
│   │   ├── routes.py      # API endpoints
│   │   ├── config.py      # Configuration management
│   │   └── main.py        # FastAPI application
│   └── requirements.txt
└── shared/                # Shared TypeScript schemas
    └── schema.ts
```

## 📋 Prerequisites

- **Node.js**: v18+ (for frontend)
- **Python**: 3.11+ (for backend)
- **OpenAI API Key**: Required for AI report generation
- **FHIR Server**: Access to a FHIR R4 server (uses HAPI public server by default)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/HealthTrixssLLC/HealthCare-Informatics.git
cd HealthCare-Informatics
```

### 2. Set Up Python Backend

```bash
cd server_py

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\activate
# Windows CMD:
venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-...
```

### 3. Set Up Frontend

```bash
# From project root
npm install

# Install additional dependencies for Power BI features
npm install recharts react-grid-layout zustand date-fns
npm install --save-dev @types/react-grid-layout
```

## 🚀 Running the Application

### Start the Backend Server

```bash
cd server_py
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

Backend will be available at: `http://localhost:5000`
API documentation: `http://localhost:5000/docs`

### Start the Frontend

```bash
# From project root
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 🔑 Environment Variables

### Backend (`server_py/.env`)

```env
# Required
OPENAI_API_KEY=sk-your-key-here

# Optional (defaults shown)
PORT=5000
FHIR_BASE_URL=https://hapi.fhir.org/baseR4
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4096
CACHE_TTL_SECONDS=3600
STORAGE_TYPE=memory
LOG_LEVEL=INFO
```

### Frontend (`.env` in root)

```env
VITE_API_URL=http://localhost:5000
```

## 📡 API Endpoints

### Sessions
- `POST /api/sessions` - Create new chat session
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/{id}/messages` - Get session messages

### Reports
- `POST /api/generate-report` - Generate AI report from FHIR data
- `GET /api/reports` - List all reports
- `GET /api/reports/{id}` - Get specific report

### Health
- `GET /api/health` - Health check endpoint

## 🎨 Using Power BI Features

### Cross-Filtering

Click any data point in a chart to filter all other visuals:

```tsx
// Charts automatically support cross-filtering
// Click a bar, pie slice, or data point to activate filter
// Click again to clear the filter
```

### Advanced KPI Cards

Enhanced metrics with sparklines and trends:

```tsx
import { AdvancedKPICard } from '@/components/AdvancedKPICard';

<AdvancedKPICard
  metric={{
    label: "Total Patients",
    value: "1,234",
    icon: "users"
  }}
  sparklineData={[{value: 100}, {value: 120}, {value: 115}]}
  comparisonValue="10% vs last month"
  trend={{ direction: 'up', percentage: 10 }}
/>
```

### Waterfall Charts

Visualize cumulative effects:

```tsx
import { WaterfallChart } from '@/components/WaterfallChart';

<WaterfallChart
  title="Patient Flow"
  data={[
    { name: 'Start', value: 100, isTotal: true },
    { name: 'Admissions', value: 25 },
    { name: 'Discharges', value: -20 },
    { name: 'End', value: 105, isTotal: true }
  ]}
/>
```

### Matrix/Pivot Tables

Cross-tabulation with heatmaps:

```tsx
import { MatrixTable } from '@/components/MatrixTable';

<MatrixTable
  title="Conditions by Age Group"
  data={{
    rows: ['0-18', '19-30', '31-50'],
    columns: ['Diabetes', 'Hypertension', 'Asthma'],
    values: [[5, 2, 10], [15, 20, 8], [30, 45, 5]]
  }}
  showHeatmap={true}
/>
```

### AI Insights Panel

Automatic pattern detection and recommendations:

```tsx
import { InsightsPanel } from '@/components/InsightsPanel';

<InsightsPanel sourceData={report.sourceData} />
```

## 🧪 Development

### Project Structure

```
client/src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── AdvancedKPICard.tsx   # Enhanced metric cards
│   ├── WaterfallChart.tsx    # Waterfall visualizations
│   ├── MatrixTable.tsx       # Pivot tables with heatmap
│   ├── InsightsPanel.tsx     # AI insights
│   ├── InteractiveChart.tsx  # ECharts wrapper
│   ├── DashboardWorkspace.tsx # Grid layout dashboard
│   ├── FilterPanel.tsx       # Multi-filter UI
│   └── ...
├── stores/
│   ├── filterStore.ts        # Filter state management
│   └── crossFilterStore.ts   # Cross-filtering logic
├── lib/
│   ├── reportTransform.ts    # Data transformation
│   └── queryClient.ts        # TanStack Query config
└── pages/
    ├── Home.tsx              # Main chat interface
    └── Dashboard.tsx         # Reports listing
```

### Key Technologies

**Frontend:**
- React 18 with TypeScript
- TanStack Query for data fetching
- Zustand for state management
- ECharts & Recharts for visualizations
- react-grid-layout for dashboards
- shadcn/ui + Tailwind CSS
- Wouter for routing

**Backend:**
- FastAPI with Python 3.11+
- Pydantic for validation
- httpx for async HTTP
- OpenAI SDK
- Tenacity for retries
- Uvicorn server

## 📊 Data Flow

```
1. User Query → Chat Interface
2. FHIR Server ← Fetch Patient Data (with pagination & caching)
3. Data Aggregation → Reduce 270KB to 2-5KB
4. OpenAI API ← Generate Report (structured JSON)
5. Frontend ← Render Interactive Dashboard
6. User Interaction → Apply Filters → Update All Visuals
```

## 🐛 Troubleshooting

### Backend Issues

**Server won't start:**
```bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install --upgrade -r server_py/requirements.txt

# Check for port conflicts
netstat -ano | findstr :5000
```

**OpenAI API errors:**
- Verify API key in `.env`
- Check account credits and rate limits
- Review logs: `tail -f server_py/app.log`

### Frontend Issues

**Charts not rendering:**
```bash
# Reinstall dependencies
npm install

# Clear cache
rm -rf node_modules/.vite
npm run dev
```

**Cross-filtering not working:**
- Ensure `zustand` is installed: `npm install zustand`
- Check browser console for errors
- Verify `crossFilterStore.ts` exists

### FHIR Connection Issues

**Cannot fetch data:**
- Check FHIR_BASE_URL in `.env`
- Test endpoint: `curl https://hapi.fhir.org/baseR4/Patient?_count=1`
- Review CORS settings if using custom FHIR server

## 🚢 Deployment

### Backend (Python/FastAPI)

**Docker:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY server_py/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server_py/app ./app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
```

**Railway/Render:**
```
Build Command: pip install -r server_py/requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (React/Vite)

**Build:**
```bash
npm run build
# Output in dist/ directory
```

**Deploy to Vercel/Netlify:**
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=dist
```

## 📚 Documentation

- [Migration Guide](./MIGRATION.md) - TypeScript to Python migration details
- [API Documentation](http://localhost:5000/docs) - Interactive API docs (when server running)
- [Component Guide](./client/src/components/README.md) - Frontend component usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [HAPI FHIR](https://hapi.fhir.org/) - Public FHIR server for testing
- [OpenAI](https://openai.com/) - AI-powered report generation
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [ECharts](https://echarts.apache.org/) - Powerful charting library
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework

## 📧 Support

For issues and questions:
- GitHub Issues: [Report a bug](https://github.com/HealthTrixssLLC/HealthCare-Informatics/issues)
- Email: support@healthtrixss.com
- Documentation: Check the `/docs` folder

---

Built with ❤️ by HealthTrixss LLC
