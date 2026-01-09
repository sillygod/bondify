# English Learning Application

An AI-powered English learning application with conversation practice, vocabulary lookup, and sentence rephrasing features. Built with React/TypeScript frontend and FastAPI/Python backend, integrated with LLM services (Gemini/Mistral).

## Features

- **Conversation Practice**: Practice English conversations with an AI tutor that provides grammar corrections and feedback
- **Vocabulary Lookup**: Get comprehensive word information including etymology, pronunciation, synonyms, and usage examples
- **Sentence Rephrasing**: Analyze sentences for grammar issues and get multiple rephrasing suggestions
- **Progress Tracking**: Track learning streaks, XP, and achievements
- **User Authentication**: Secure JWT-based authentication system

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui components

### Backend
- FastAPI (Python 3.11+)
- SQLAlchemy with async support
- LangChain & LangGraph for LLM integration
- SQLite (development) / PostgreSQL (production)
- JWT authentication with python-jose

## Project Structure

```
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── llm/            # LLM agents and prompts
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # Database setup
│   │   └── main.py         # FastAPI app entry
│   ├── requirements.txt
│   └── .env.example
├── src/                     # React frontend
│   ├── components/         # UI components
│   ├── lib/api/           # API client functions
│   ├── pages/             # Page components
│   └── ...
└── .kiro/specs/           # Feature specifications
```

## Quick Start

### Option 1: Docker Compose (Recommended)

The easiest way to run the application locally:

1. Copy environment file and add your API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your GOOGLE_API_KEY or MISTRAL_API_KEY
   ```

2. Start all services:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. Stop services:
   ```bash
   docker-compose down
   ```

### Option 2: Manual Setup

#### Prerequisites

- Node.js 18+ and npm/bun
- Python 3.11+
- Google Gemini API key or Mistral API key

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install [uv](https://docs.astral.sh/uv/getting-started/installation/) (Python package manager):
   ```bash
   # macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh
   
   # Or with Homebrew
   brew install uv
   ```

3. Install dependencies with uv:
   ```bash
   uv sync
   ```

4. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

5. Configure your `.env` file:
   ```env
   SECRET_KEY=your-secure-secret-key
   LLM_PROVIDER=gemini
   GOOGLE_API_KEY=your-google-api-key
   ```

6. Start the backend server:
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup

1. Install dependencies (from project root):
   ```bash
   npm install
   # or
   bun install
   ```

2. Create `.env` file:
   ```bash
   echo "VITE_API_BASE_URL=http://localhost:8000" > .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. Open http://localhost:8080 in your browser

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/refresh` | Refresh access token |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update user profile |

### Conversation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/conversation/start` | Start new conversation |
| POST | `/api/conversation/message` | Send message and get reply |
| POST | `/api/conversation/feedback` | Get conversation feedback |

### Vocabulary
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vocabulary/lookup` | Look up word details |

### Rephrase
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rephrase/analyze` | Analyze and rephrase sentence |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress/stats` | Get learning statistics |
| GET | `/api/progress/streak` | Get streak data |
| POST | `/api/progress/activity` | Record learning activity |
| GET | `/api/progress/achievements` | Get achievements list |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |

## Configuration

### Environment Variables

#### Backend (.env)
```env
# Application
APP_NAME=English Learning API
DEBUG=true
SECRET_KEY=your-secret-key-change-in-production

# Database
DATABASE_URL=sqlite+aiosqlite:///./app.db

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# LLM Provider (gemini or mistral)
LLM_PROVIDER=gemini
GOOGLE_API_KEY=your-google-api-key
MISTRAL_API_KEY=your-mistral-api-key

# JWT
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Development

### Running Tests

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

```bash
# Backend tests
cd backend
uv run pytest

# Frontend tests (if configured)
npm test
```

### API Documentation

When the backend is running, access the interactive API docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## LLM Provider Configuration

### Using Google Gemini (Default)
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set in `.env`:
   ```env
   LLM_PROVIDER=gemini
   GOOGLE_API_KEY=your-api-key
   ```

### Using Mistral AI
1. Get an API key from [Mistral AI](https://console.mistral.ai/)
2. Set in `.env`:
   ```env
   LLM_PROVIDER=mistral
   MISTRAL_API_KEY=your-api-key
   ```

## Production Deployment

### Backend
1. Use a production WSGI server with uv:
   ```bash
   uv run gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. Configure PostgreSQL:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
   ```

3. Set secure SECRET_KEY and disable DEBUG

### Frontend
1. Build for production:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting service

## License

MIT License
