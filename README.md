# TryHackMe Room Explorer

A comprehensive web application for exploring, scraping, and analyzing 960 TryHackMe rooms with advanced tagging, relevance scoring, and admin management capabilities.

## 🎯 Features

### Public Features
- **Dashboard**: KPI cards showing total rooms, high feasibility rooms, average potential, etc.
- **Room Grid**: Browse all rooms with advanced filtering (category, difficulty, tags)
- **Room Details**: Comprehensive view of room metadata, tags, tools, lessons, and relevance scores
- **Search**: Full-text search across room names, descriptions, and tags
- **Dark UI**: Modern dark theme with domain-specific color coding

### Admin Features
- **Scraper Control Panel**: 
  - Full scrape (all 960 rooms)
  - Incremental scrape (failed/outdated rooms only)
  - Real-time progress tracking
  - Queue status visualization
  - Failed rooms list with retry functionality
- **Room Management**: Edit metadata, assign tags, override relevance scores
- **Tag Normalization**: Merge synonyms, classify tag types, manage tag hierarchy
- **Export**: CSV/JSON export of room data

### Technical Features
- **Robust Scraping**: Playwright-based scraper with rate limiting, retries, and error handling
- **Job Queue**: BullMQ + Redis for reliable background job processing
- **Semantic Tagging**: Two-pass tag routing (deterministic + vector similarity)
- **Auto Relevance Scoring**: Keyword-based scoring with justification generation
- **RBAC**: Role-based access control (User/Admin)

## 🏗️ Architecture

**Tech Stack:**
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16 + Prisma ORM
- **Queue**: BullMQ + Redis
- **Scraper**: Playwright (headless Chromium)
- **Auth**: NextAuth.js with Credentials provider

**Database Schema:**
- `Room`: Core room data with scrape status
- `Tag`: Normalized tags with type classification
- `RoomTag`: Many-to-many relationship with original text
- `Tool`, `Lesson`, `RelevanceAssessment`: Related metadata
- `ScrapeRun`: Job history and statistics
- `User`: Authentication with role-based access

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (for local development)
- 8GB RAM minimum (for Playwright browser)

### 1. Clone and Setup

```bash
# Clone repository
git clone <repository-url>
cd tryhackme-room-explorer

# Copy environment variables
cp .env.example .env

# Edit .env with your settings (optional)
nano .env
```

### 2. Start with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f web

# The application will be available at http://localhost:3000
```

**What happens on first start:**
1. PostgreSQL database is created
2. Redis is started
3. Database schema is pushed via Prisma
4. 960 room slugs are seeded
5. Admin user is created
6. Next.js dev server starts
7. Worker process starts for background jobs

### 3. Login as Admin

Navigate to `http://localhost:3000/admin` and login with:
- **Email**: `admin@example.com` (or your ADMIN_EMAIL from .env)
- **Password**: `admin123` (or your ADMIN_PASSWORD from .env)

### 4. Start Scraping

1. Go to Admin → Scraper
2. Click "Run Full Scrape" to scrape all 960 rooms
3. Monitor progress in real-time
4. Scraping respects rate limits (3 concurrent, 2s delay between requests)

**Estimated Time**: ~1-2 hours for full scrape (960 rooms with rate limiting)

## 📦 Local Development (Without Docker)

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Setup Database

```bash
# Start PostgreSQL and Redis (via Docker)
docker-compose up -d postgres redis

# Push database schema
npx prisma db push

# Seed initial data
npx prisma db seed
```

### Run Development Servers

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Worker process
npm run worker

# Terminal 3: Prisma Studio (optional)
npm run db:studio
```

## 🎨 Design System

### Domain Color Palette

The UI uses a semantic color system where **only Domain tags** determine the main color:

| Domain | Background | Border | Text |
|--------|-----------|--------|------|
| Web Exploitation | `#6D28D9` | `#4C1D95` | `#FFFFFF` |
| Active Directory | `#B91C1C` | `#7F1D1D` | `#FFFFFF` |
| Windows Offense | `#DC2626` | `#991B1B` | `#FFFFFF` |
| Linux Offense | `#F97316` | `#C2410C` | `#111827` |
| Cloud Exploitation | `#0EA5E9` | `#0369A1` | `#0B1220` |
| DFIR / Forensics | `#2563EB` | `#1E40AF` | `#FFFFFF` |
| SOC / Detection | `#16A34A` | `#166534` | `#0B1220` |
| Malware / RE | `#111827` | `#374151` | `#FFFFFF` |
| Binary Exploitation | `#6B7280` | `#374151` | `#FFFFFF` |
| Networking | `#14B8A6` | `#0F766E` | `#0B1220` |
| OSINT / Social Eng | `#A16207` | `#713F12` | `#FFFFFF` |
| Crypto / Stego | `#9333EA` | `#5B21B6` | `#FFFFFF` |
| AI Security | `#EC4899` | `#9D174D` | `#0B1220` |
| OT / ICS | `#F59E0B` | `#B45309` | `#0B1220` |
| Security Engineering | `#22C55E` | `#15803D` | `#0B1220` |
| CTF / Challenges | `#8B5CF6` | `#5B21B6` | `#FFFFFF` |

### Badge Grammar

Badges are displayed in this order (max 5 total):
```
[Domain] [Platform] [Top Tactic] [Top Tool] [Difficulty/Mode]
```

- **Domain Badge**: Colored pill with domain icon
- **Platform Chip**: Neutral fill with domain-colored border
- **Tactic Chip**: Neutral with micro-icon
- **Tool Chip**: Neutral monochrome
- **Artifact Chip**: Neutral with document icon

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tryhackme_explorer?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# Admin Credentials
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

# Scraper Settings
SCRAPER_CONCURRENCY="3"          # Number of concurrent scrape jobs
SCRAPER_DELAY_MS="2000"          # Delay between requests (ms)
SCRAPER_TIMEOUT_MS="30000"       # Timeout per page (ms)
```

### Scraper Configuration

The scraper is designed to be **respectful and compliant**:

- **Rate Limiting**: 3 concurrent requests max, 2s delay between requests
- **Retries**: 3 attempts with exponential backoff
- **Timeout**: 30s per page
- **User Agent**: Identifies as research/educational tool
- **Caching**: Stores raw HTML hash to detect changes
- **Error Handling**: Comprehensive logging and retry queue

## 📊 Database Schema

```prisma
model Room {
  id                String   @id @default(uuid())
  slug              String   @unique
  name              String?
  url               String?
  category          String?
  description       String?  @db.Text
  timeText          String?
  difficulty        String?
  scrapeStatus      ScrapeStatus @default(PENDING)
  scrapeError       String?  @db.Text
  lastScrapedAt     DateTime?
  
  tags              RoomTag[]
  tools             RoomTool[]
  lessons           Lesson[]
  relevanceScores   RelevanceAssessment[]
}

model Tag {
  id                String   @id @default(uuid())
  nameCanonical     String   @unique
  displayName       String
  type              TagType  // DOMAIN, TACTIC, TECHNIQUE, TOOL_STACK, ARTIFACT, PLATFORM
  primaryCluster    String?
  secondaryCluster  String?
  confidence        Float?
  
  rooms             RoomTag[]
}

model RelevanceAssessment {
  id            String   @id @default(uuid())
  roomId        String
  rubricKey     String   // Reference to rubric/source
  score         Int      // 0-100
  justification String   @db.Text
  generatedBy   String   @default("auto")  // auto|admin
}
```

## 🔐 Security

- **Authentication**: NextAuth.js with bcrypt password hashing
- **RBAC**: Role-based access control (User/Admin)
- **Session Management**: Secure HTTP-only cookies
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection**: Prisma ORM with parameterized queries
- **XSS Protection**: React's built-in escaping + Content Security Policy

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit

# Database migrations (production)
npx prisma migrate dev

# View database
npx prisma studio
```

## 📈 Monitoring

### Scraper Metrics
- Total rooms scraped
- Success/failure rates
- Average scrape time
- Queue depth
- Failed rooms list

### Application Metrics
- Room count by category
- Room count by difficulty
- Tag distribution
- Relevance score distribution

## 🐛 Troubleshooting

### Scraper Issues

**Problem**: Scraper fails with timeout errors
```bash
# Increase timeout in .env
SCRAPER_TIMEOUT_MS="60000"

# Reduce concurrency
SCRAPER_CONCURRENCY="1"
```

**Problem**: Playwright browser crashes
```bash
# Increase Docker memory limit
docker-compose down
docker-compose up -d --scale worker=1 --memory=4g
```

### Database Issues

**Problem**: Connection refused
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

**Problem**: Schema out of sync
```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Redis Issues

**Problem**: Queue jobs not processing
```bash
# Check Redis is running
docker-compose ps redis

# View worker logs
docker-compose logs worker

# Restart worker
docker-compose restart worker
```

## 📝 API Endpoints

### Public API
- `GET /api/rooms` - List rooms with filters
- `GET /api/rooms/[slug]` - Get room details
- `GET /api/tags` - List all tags
- `GET /api/stats` - Get dashboard statistics

### Admin API (Protected)
- `POST /api/scraper/start` - Start scrape job
- `GET /api/scraper/status` - Get scrape progress
- `POST /api/scraper/retry` - Retry failed rooms
- `PUT /api/rooms/[id]` - Update room metadata
- `PUT /api/tags/[id]` - Update tag
- `POST /api/relevance` - Update relevance score

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes only. Respect TryHackMe's Terms of Service and rate limits.

## 🙏 Acknowledgments

- TryHackMe for providing excellent cybersecurity training content
- The specification document for comprehensive design system and requirements
- Open source community for amazing tools (Next.js, Prisma, Playwright, BullMQ)

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Built with ❤️ for the cybersecurity community**
