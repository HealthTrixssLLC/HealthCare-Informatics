# Healthcare Informatics - Python FastAPI Server

This is the Python/FastAPI backend for the Healthcare Informatics application. It provides AI-powered healthcare analytics using FHIR data.

## Features

- FastAPI-based REST API
- FHIR data fetching with pagination and caching
- OpenAI integration for AI-generated reports
- In-memory and PostgreSQL storage options
- Comprehensive data aggregation and transformation
- Async/await throughout for optimal performance

## Prerequisites

- Python 3.11+
- pip or poetry for package management
- Redis (optional, for distributed caching)
- PostgreSQL (optional, for persistent storage)

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
AI_INTEGRATIONS_OPENAI_BASE_URL=your_openai_base_url
AI_INTEGRATIONS_OPENAI_API_KEY=your_openai_api_key
```

## Running the Server

Development mode with auto-reload:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

Or using Python directly:
```bash
python -m app.main
```

Production mode:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000 --workers 4
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc

## API Endpoints

### Sessions
- `POST /api/sessions` - Create a new chat session
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/{id}/messages` - Get messages for a session

### Reports
- `POST /api/generate-report` - Generate a new report from FHIR data
- `GET /api/reports` - Get all reports
- `GET /api/reports/{id}` - Get a specific report

### Health
- `GET /api/health` - Health check endpoint

## Project Structure

```
server_py/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app and middleware
│   ├── config.py            # Configuration and settings
│   ├── models.py            # Pydantic models
│   ├── routes.py            # API route handlers
│   └── services/
│       ├── __init__.py
│       ├── storage.py       # Storage abstraction layer
│       ├── fhir_client.py   # FHIR data fetching
│       ├── fhir_aggregator.py  # Data aggregation
│       └── openai_client.py    # OpenAI integration
├── requirements.txt
├── .env.example
└── README.md
```

## Testing

Run tests with pytest:
```bash
pytest
```

## Storage Options

### In-Memory (Default)
Fast, suitable for development and demos. Data is lost on restart.

### PostgreSQL
For production use with persistent storage:

1. Set up PostgreSQL database
2. Update `.env`:
```
STORAGE_TYPE=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/healthcare_db
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `HOST` | Server host | 0.0.0.0 |
| `ENVIRONMENT` | Environment (development/production) | development |
| `FHIR_BASE_URL` | FHIR server URL | https://hapi.fhir.org/baseR4 |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI API base URL | - |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI API key | - |
| `CACHE_TTL_MINUTES` | Cache time-to-live | 10 |
| `STORAGE_TYPE` | Storage type (memory/postgres) | memory |
| `DEFAULT_PATIENT_LIMIT` | Default patient fetch limit | 500 |

## Performance Considerations

- Uses async/await throughout for non-blocking I/O
- FHIR data caching reduces external API calls
- Pagination handles large datasets efficiently
- Data aggregation reduces payload sizes for AI processing

## Security Notes

⚠️ **Important for Production:**
- Add authentication and authorization
- Implement audit logging for PHI access
- Use HTTPS/TLS for all connections
- Sanitize and validate all inputs
- Consider HIPAA compliance requirements
- Implement rate limiting
- Scrub logs of sensitive data

## Troubleshooting

**Import errors:**
```bash
pip install -r requirements.txt --upgrade
```

**Port already in use:**
```bash
# Change PORT in .env or use different port:
uvicorn app.main:app --port 5001
```

**OpenAI API errors:**
- Check API key and base URL in `.env`
- Verify quota and rate limits
- Check network connectivity

## Migration from TypeScript

This Python server is a direct port of the original TypeScript/Express server with:
- FastAPI instead of Express
- Pydantic for validation instead of Zod
- httpx/aiohttp instead of axios
- Tenacity for retries instead of p-retry
- Same API endpoints and response formats
- Identical business logic and data flows

The frontend client requires no changes - all API contracts are preserved.

## License

[Your License Here]
