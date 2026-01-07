# TryHackMe Room Explorer

A comprehensive web application for exploring, managing, and analyzing TryHackMe rooms with automated scraping, tag classification, and relevance scoring.

## Features

### Public Features
- **Dashboard**: Overview with KPI cards showing total rooms, high feasibility rooms, average potential, etc.
- **Room Grid**: Searchable and filterable card-based grid displaying all 960 TryHackMe rooms
- **Room Detail Pages**: Comprehensive view of each room with:
  - Metadata (name, URL, category, description, tags, tools, lessons learned, time, difficulty)
  - Semantic badges with domain-specific colors and icons
  - Relevance scores and justifications per rubric
- **Advanced Filtering**: Filter by difficulty, complexity, type, feasibility, domain, platform, tactics, tools
- **Search**: Full-text search across room names, descriptions, and tags

### Admin Features
- **Authentication**: Secure login with NextAuth.js and role-based access control
- **Scraper Control Panel**:
  - Seed 960 rooms (initial database population)
  - Run full scrape (all pending/failed rooms)
  - Run incremental scrape (only missing or outdated rooms)
  - Real-time progress tracking
  - Queue status monitoring
  - Detailed logs and error reporting
  - Failed room list with retry functionality
- **Room Management**:
  - Edit room metadata
  - Manual relevance score/justification override
  - Tag normalization and merging
  - Bulk operations
- **Tag Management**:
  - View all tags with type classification
  - Merge synonyms (e.g., "privesc" → "privilege_escalation")
  - Reclassify tag types
  - View tag usage statistics
- **Export**: CSV/JSON export of rooms with all metadata

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16, Prisma ORM
- **Scraper**: Playwright (with cheerio fallback)
- **Queue**: BullMQ + Redis
- **Auth**: NextAuth.js with Credentials provider
- **Deployment**: Docker Compose

## Design System

### Color Palette (Domain-Based)
The UI uses a semantic color system where only the **Domain** determines the primary color:

| Domain | Background | Border | Text | Icon |
|--------|-----------|--------|------|------|
| Web Exploitation | `#6D28D9` | `#4C1D95` | `#FFFFFF` | Bug |
| Active Directory | `#B91C1C` | `#7F1D1D` | `#FFFFFF` | Network |
| Windows Offense | `#DC2626` | `#991B1B` | `#FFFFFF` | Monitor |
| Linux Offense | `#F97316` | `#C2410C` | `#111827` | Terminal |
| Cloud Exploitation | `#0EA5E9` | `#0369A1` | `#0B1220` | Cloud |
| DFIR / Forensics | `#2563EB` | `#1E40AF` | `#FFFFFF` | Search |
| SOC / Detection | `#16A34A` | `#166534` | `#0B1220` | ShieldCheck |
| Malware / RE | `#111827` | `#374151` | `#FFFFFF` | Binary |
| Binary Exploitation | `#6B7280` | `#374151` | `#FFFFFF` | Cpu |
| Networking | `#14B8A6` | `#0F766E` | `#0B1220` | Router |
| OSINT | `#A16207` | `#713F12` | `#FFFFFF` | Radar |
| Crypto / Stego | `#9333EA` | `#5B21B6` | `#FFFFFF` | KeyRound |
| AI Security | `#EC4899` | `#9D174D` | `#0B1220` | BrainCircuit |
| OT / ICS | `#F59E0B` | `#B45309` | `#0B1220` | Factory |
| Security Engineering | `#22C55E` | `#15803D` | `#0B1220` | Shield |
| CTF / Challenges | `#8B5CF6` | `#5B21B6` | `#FFFFFF` | Flag |

### Tag Types
- **Domain**: Broad topic area (e.g., web_exploitation, active_directory)
- **Tactic**: Goal/phase (e.g., reconnaissance, privilege_escalation)
- **Technique**: How (e.g., process_hollowing, sql_injection)
- **Tool/Stack**: Software (e.g., burp_suite, nmap, splunk)
- **Artifact/Indicator**: Evidence (e.g., pcap, memory_dump, windows_event_logs)
- **Platform/Environment**: OS/infrastructure (e.g., windows, linux, aws, kubernetes)

### Badge Grammar
Display order: `[Domain] [Platform] [Top Tactic] [Top Tool] [Difficulty]`

## Installation & Setup

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tryhackme-explorer
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec web npx prisma db push
   ```

5. **Seed initial data (960 rooms + admin user)**
   ```bash
   docker-compose exec web npm run db:seed
   ```

   Default admin credentials:
   - Email: `admin@tryhackme-explorer.local`
   - Password: `admin123` (change this immediately!)

6. **Access the application**
   - Public site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin

### Local Development (without Docker)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start PostgreSQL and Redis** (you'll need these running)
   ```bash
   # Example with Docker:
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine
   docker run -d -p 6379:6379 redis:7-alpine
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis URLs
   ```

4. **Run migrations and seed**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Start scraper worker (in separate terminal)**
   ```bash
   npm run worker
   ```

## Usage

### Scraping Workflow

1. **Login to Admin Panel**
   - Navigate to `/admin`
   - Login with admin credentials

2. **Initialize Database**
   - The seed script already populated 960 room entries with status `PENDING`

3. **Run Full Scrape**
   - Go to Admin → Scraper
   - Click "Run Full Scrape"
   - Monitor progress in real-time
   - View failed rooms and retry individually or in bulk

4. **Run Incremental Scrape**
   - Scrapes only rooms with status `PENDING` or `FAILED`
   - Useful for updates and retries

### Tag Management

1. **Normalize Tags**
   - Admin → Tags
   - View all tags with usage counts
   - Merge synonyms (e.g., "AD" → "active_directory")
   - Reclassify tag types if needed

2. **Tag Classification**
   - Tags are automatically classified using a two-pass routing system:
     1. **Deterministic typing**: Regex patterns and keyword anchors
     2. **Heuristic assignment**: Similarity to predefined clusters
   - All tags are canonicalized to snake_case with synonym mapping

### Relevance Scoring

Currently, relevance scores must be manually added or computed separately. To extend:

1. Define rubric sources in environment or database
2. Implement auto-scoring logic in `src/lib/relevance-scorer.ts`
3. Call scorer after scraping to generate scores + justifications

### Export Data

- Admin → Rooms → Export
- Choose format (CSV/JSON)
- Downloads all rooms with metadata, tags, tools, lessons, relevance scores

## Project Structure

```
tryhackme-explorer/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script (960 rooms + admin user)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── rooms/         # Room CRUD
│   │   │   ├── scraper/       # Scraper control
│   │   │   └── tags/          # Tag management
│   │   ├── admin/             # Admin pages
│   │   ├── rooms/             # Public room pages
│   │   └── page.tsx           # Dashboard
│   ├── components/
│   │   ├── badges/            # Domain, tactic, tool badges
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── scraper.ts         # Playwright scraper
│   │   ├── tag-classifier.ts  # Tag classification system
│   │   └── utils.ts           # Utilities
│   └── workers/
│       └── scraper-worker.ts  # BullMQ worker
├── docker-compose.yml         # Docker services
├── Dockerfile                 # Next.js container
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Scraper Design

### Compliance & Ethics
- Scrapes only publicly accessible information
- Respects rate limits (configurable delay between requests)
- Low concurrency (default: 3)
- Exponential backoff on failures
- No paywall/login circumvention
- Optional authenticated mode (user provides own session cookie)

### Implementation
- **Primary**: Playwright (handles JavaScript-rendered pages)
- **Fallback**: axios + cheerio (for static HTML)
- User-Agent spoofing to avoid bot detection
- Request delay with jitter
- Retry logic with exponential backoff
- Raw HTML snapshot storage (optional)
- Change detection via content hash

### Queue Management
- BullMQ for robust job queue
- Redis for queue persistence
- Job priority (critical CVEs first)
- Failed job tracking and retry
- Progress monitoring
- Detailed logging

## API Endpoints

### Public
- `GET /api/rooms` - List rooms (with filters, search, pagination)
- `GET /api/rooms/[slug]` - Get single room
- `GET /api/tags` - List tags

### Admin (requires authentication)
- `POST /api/scraper/start` - Start scrape job
- `GET /api/scraper/status` - Get scrape run status
- `POST /api/scraper/retry` - Retry failed rooms
- `PUT /api/rooms/[slug]` - Update room
- `POST /api/tags/merge` - Merge tags
- `GET /api/export` - Export data

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/tryhackme_explorer"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-strong-secret-key"

# Scraper Settings
SCRAPER_CONCURRENCY=3                  # Max parallel requests
SCRAPER_DELAY_MS=2000                  # Delay between requests (ms)
SCRAPER_USER_AGENT="Mozilla/5.0..."   # User agent string

# Optional: Authenticated scraping
THM_SESSION_COOKIE=""                  # TryHackMe session cookie
```

## Compliance & Legal

This tool is designed for:
- Educational research
- Personal learning path planning
- CTF preparation
- Security training program curation

**Do not**:
- Overwhelm TryHackMe servers (respect rate limits)
- Scrape copyrighted content for redistribution
- Use for commercial purposes without permission
- Circumvent any access controls

**Recommendation**: Use for personal study and reference. If building a public service, contact TryHackMe for official API access or partnership.

## Development

### Database Management
```bash
# Push schema changes
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Reseed database
npm run db:seed
```

### Scraper Worker
The scraper runs as a separate background worker:
```bash
npm run worker
```

### Linting & Type Checking
```bash
npm run lint
npm run type-check
```

## Troubleshooting

### Scraper Fails with "Executable not found"
Playwright may need manual browser installation:
```bash
npx playwright install chromium
```

### Database Connection Issues
Check that PostgreSQL is running and `DATABASE_URL` is correct:
```bash
docker-compose logs postgres
```

### Redis Connection Issues
Check that Redis is running:
```bash
docker-compose logs redis
```

### "Next is not found" in Docker
Rebuild the container:
```bash
docker-compose down
docker-compose build --no-cache web
docker-compose up -d
```

## Roadmap

- [ ] Real-time scrape progress via WebSocket
- [ ] Semantic vector search (embeddings)
- [ ] Auto-relevance scoring with configurable rubrics
- [ ] User accounts with saved room lists
- [ ] Learning path recommendations
- [ ] Integration with TryHackMe API (if available)
- [ ] Dark mode refinements
- [ ] Mobile-optimized UI
- [ ] Export to Notion, Obsidian, Markdown

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Open a pull request

## License

MIT License - See LICENSE file for details

## Acknowledgments

- **TryHackMe** for providing an excellent learning platform
- **Specification** based on security domain taxonomy and MITRE ATT&CK framework
- **Design inspiration** from modern CTF platforms and security dashboards

---

**Note**: This tool is for educational and personal use. Always respect TryHackMe's Terms of Service and rate limits. For production use or public deployment, contact TryHackMe for official API access.
