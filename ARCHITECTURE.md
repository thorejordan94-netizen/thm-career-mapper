# Architecture Documentation

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Browser                                 │
│                    (http://localhost:3000)                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Next.js 14 Application                            │
│                      (Container: web)                                │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Public Routes   │  │  Admin Routes    │  │   API Routes     │  │
│  │                  │  │  (Protected)     │  │                  │  │
│  │ /                │  │ /admin           │  │ /api/auth        │  │
│  │ /rooms           │  │ /admin/scraper   │  │ /api/rooms       │  │
│  │ /rooms/[slug]    │  │ /admin/rooms     │  │ /api/scraper     │  │
│  │                  │  │ /admin/tags      │  │ /api/tags        │  │
│  │                  │  │                  │  │ /api/stats       │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    NextAuth.js                                │  │
│  │  - Credentials Provider                                       │  │
│  │  - Session Management                                         │  │
│  │  - RBAC (User/Admin)                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────┬──────────────────────────┬──────────────────────┬─────────┘
         │                          │                      │
         │ Prisma ORM               │ BullMQ Client        │
         ▼                          ▼                      │
┌─────────────────────┐    ┌─────────────────────┐        │
│   PostgreSQL 16     │    │      Redis 7        │        │
│  (Container: db)    │    │  (Container: redis) │        │
│                     │    │                     │        │
│ Tables:             │    │ Queues:             │        │
│ - Room (960)        │    │ - scrape-jobs       │        │
│ - Tag               │    │ - progress          │        │
│ - RoomTag           │    │ - failed-jobs       │        │
│ - Tool              │    │                     │        │
│ - RoomTool          │    │ Data:               │        │
│ - Lesson            │    │ - Job status        │        │
│ - RelevanceScore    │    │ - Queue metrics     │        │
│ - ScrapeRun         │    │ - Active jobs       │        │
│ - User              │    │                     │        │
│                     │    │                     │        │
│ Port: 5432          │    │ Port: 6379          │        │
└─────────────────────┘    └─────────────────────┘        │
                                                           │
                                                           │
                                                           ▼
                                              ┌─────────────────────┐
                                              │  Worker Process     │
                                              │ (Container: worker) │
                                              │                     │
                                              │ ┌─────────────────┐ │
                                              │ │   BullMQ Worker │ │
                                              │ │   - Job Queue   │ │
                                              │ │   - Processor   │ │
                                              │ └─────────────────┘ │
                                              │         │           │
                                              │         ▼           │
                                              │ ┌─────────────────┐ │
                                              │ │   Playwright    │ │
                                              │ │   - Chromium    │ │
                                              │ │   - Scraper     │ │
                                              │ │   - Parser      │ │
                                              │ └─────────────────┘ │
                                              │         │           │
                                              │         ▼           │
                                              │ ┌─────────────────┐ │
                                              │ │  Rate Limiter   │ │
                                              │ │  - 3 concurrent │ │
                                              │ │  - 2s delay     │ │
                                              │ │  - Retries      │ │
                                              │ └─────────────────┘ │
                                              │         │           │
                                              └─────────┼───────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────────┐
                                              │   TryHackMe.com     │
                                              │   (960 rooms)       │
                                              └─────────────────────┘
```

## 🔄 Data Flow

### 1. User Browsing Flow

```
User → Next.js Page → API Route → Prisma → PostgreSQL → Response → UI
```

**Example: View Room Details**
1. User navigates to `/rooms/active-directory-basics`
2. Next.js Server Component fetches data
3. Prisma queries PostgreSQL for room + tags + tools + lessons
4. Data returned and rendered with badges
5. User sees room details with color-coded domain badges

### 2. Scraping Flow

```
Admin → Start Scrape → API → BullMQ → Redis → Worker → Playwright → TryHackMe → Parse → Database
```

**Example: Full Scrape**
1. Admin clicks "Run Full Scrape" in admin panel
2. API route creates 960 jobs in BullMQ queue
3. Worker picks up jobs (3 concurrent)
4. Playwright navigates to room page
5. Parser extracts metadata
6. Tag classifier processes tags
7. Relevance scorer calculates scores
8. Data saved to PostgreSQL
9. Progress updated in Redis
10. Admin sees real-time progress

### 3. Authentication Flow

```
User → Login Form → NextAuth → Credentials Provider → bcrypt → Database → Session → Protected Routes
```

**Example: Admin Login**
1. User enters email/password
2. NextAuth validates credentials
3. bcrypt compares password hash
4. Session created with role (USER/ADMIN)
5. Admin routes become accessible
6. Session stored in HTTP-only cookie

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│             │
│ - id        │
│ - email     │
│ - password  │
│ - role      │
└─────────────┘

┌─────────────────────────────────────────────────────────────┐
│                          Room                                │
│                                                               │
│ - id (uuid)                                                   │
│ - slug (unique)                                               │
│ - name, url, category, description                            │
│ - timeText, difficulty                                        │
│ - scrapeStatus (PENDING|IN_PROGRESS|OK|FAILED)               │
│ - scrapeError, rawSourceHash                                  │
│ - lastScrapedAt, createdAt, updatedAt                         │
└───────┬─────────────┬─────────────┬─────────────┬────────────┘
        │             │             │             │
        │ 1:N         │ 1:N         │ 1:N         │ 1:N
        ▼             ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────────────┐
│   RoomTag   │ │  RoomTool   │ │   Lesson    │ │ RelevanceAssessment  │
│             │ │             │ │             │ │                      │
│ - roomId    │ │ - roomId    │ │ - roomId    │ │ - roomId             │
│ - tagId     │ │ - toolId    │ │ - content   │ │ - rubricKey          │
│ - original  │ │             │ │             │ │ - score (0-100)      │
│   Text      │ │             │ │             │ │ - justification      │
└──────┬──────┘ └──────┬──────┘ └─────────────┘ │ - generatedBy        │
       │               │                         │   (auto|admin)       │
       │ N:1           │ N:1                     └──────────────────────┘
       ▼               ▼
┌─────────────┐ ┌─────────────┐
│     Tag     │ │    Tool     │
│             │ │             │
│ - id        │ │ - id        │
│ - canonical │ │ - name      │
│ - display   │ │             │
│ - type      │ │             │
│ - cluster   │ │             │
│ - confidence│ │             │
└─────────────┘ └─────────────┘

┌─────────────────────┐
│     ScrapeRun       │
│                     │
│ - id                │
│ - startedAt         │
│ - finishedAt        │
│ - status            │
│ - totalRooms        │
│ - successful        │
│ - failed            │
│ - logs              │
└─────────────────────┘
```

### Key Relationships

1. **Room ↔ Tag** (Many-to-Many via RoomTag)
   - One room has many tags
   - One tag belongs to many rooms
   - RoomTag preserves original text

2. **Room ↔ Tool** (Many-to-Many via RoomTool)
   - One room uses many tools
   - One tool is used in many rooms

3. **Room → Lesson** (One-to-Many)
   - One room has many lessons learned

4. **Room → RelevanceAssessment** (One-to-Many)
   - One room has multiple relevance scores (one per rubric)

## 🎨 Design System Architecture

### Color Token System

```typescript
// Domain Color Palette
const domainColors = {
  web_exploitation: {
    bg: '#6D28D9',      // Badge fill
    border: '#4C1D95',  // Outline
    ink: '#FFFFFF'      // Text/icon
  },
  active_directory: {
    bg: '#B91C1C',
    border: '#7F1D1D',
    ink: '#FFFFFF'
  },
  // ... 14 more domains
};
```

### Badge Component Hierarchy

```
BadgeGroup (max 5 badges)
├── DomainBadge (pill, colored)
│   ├── Icon (from domain)
│   └── Text (domain name)
├── PlatformChip (rounded-rect, neutral fill, domain border)
│   ├── Icon (platform)
│   └── Text (platform name)
├── TacticChip (rounded-rect, neutral, micro-icon)
│   ├── MicroIcon (tactic symbol)
│   └── Text (tactic abbreviation)
├── ToolChip (squircle, neutral monochrome)
│   ├── Icon (tool)
│   └── Text (tool name)
└── DifficultyChip (hex, neutral)
    └── Text (difficulty level)
```

### Tag Classification Pipeline

```
Raw Tag Text
    │
    ▼
┌─────────────────────────────────────┐
│  Pass 1: Deterministic Typing       │
│  - Regex patterns                   │
│  - Keyword anchors                  │
│  - Exact matches                    │
└────────────┬────────────────────────┘
             │
             ▼
        Tag Type Assigned
        (DOMAIN, TACTIC, etc.)
             │
             ▼
┌─────────────────────────────────────┐
│  Pass 2: Vector Assignment          │
│  - Cosine similarity                │
│  - Type-specific centroids          │
│  - Confidence scoring               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Canonicalization                   │
│  - snake_case conversion            │
│  - Synonym mapping                  │
│  - Bigram preservation              │
└────────────┬────────────────────────┘
             │
             ▼
    Normalized Tag
    (stored in database)
```

## 🔧 Component Architecture

### Frontend Components

```
App Layout
├── Header
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── Main Content
│   ├── Dashboard
│   │   ├── KPICards (4-6 cards)
│   │   ├── SearchBar
│   │   └── RoomGrid (preview)
│   ├── Rooms Page
│   │   ├── FilterPanel
│   │   │   ├── CategoryFilter
│   │   │   ├── DifficultyFilter
│   │   │   └── TagFilter
│   │   ├── SearchBar
│   │   └── RoomGrid
│   │       └── RoomCard (repeated)
│   │           ├── BadgeGroup
│   │           ├── Title
│   │           ├── Description
│   │           └── Metadata
│   └── Room Detail
│       ├── Header
│       ├── BadgeGroup
│       ├── Description
│       ├── MetadataSection
│       │   ├── Tags
│       │   ├── Tools
│       │   └── Lessons
│       └── RelevanceScores
│           └── RubricScore (5x)
└── Footer
```

### Admin Components

```
Admin Layout
├── AdminNav
│   ├── Dashboard
│   ├── Scraper
│   ├── Rooms
│   └── Tags
├── Scraper Panel
│   ├── ControlButtons
│   │   ├── RunFullScrape
│   │   └── RunIncremental
│   ├── ProgressDisplay
│   │   ├── ProgressBar
│   │   ├── Stats (total, success, failed)
│   │   └── ETA
│   ├── QueueStatus
│   │   ├── Active Jobs
│   │   ├── Waiting Jobs
│   │   └── Completed Jobs
│   └── FailedRoomsList
│       └── RetryButton
├── Room Management
│   ├── RoomTable
│   │   ├── SortableHeaders
│   │   ├── InlineEdit
│   │   └── BulkActions
│   └── RoomEditor
│       ├── MetadataForm
│       ├── TagAssignment
│       └── RelevanceOverride
└── Tag Management
    ├── TagTable
    ├── MergeSynonyms
    └── TypeClassification
```

## 🔄 Scraper Workflow

### Full Scrape Process

```
1. Admin Trigger
   │
   ▼
2. Create Scrape Run Record
   │
   ▼
3. Query All Rooms (960)
   │
   ▼
4. Create BullMQ Jobs
   │
   ▼
5. Worker Picks Up Jobs (3 concurrent)
   │
   ├─────────────────────────────────┐
   │                                 │
   ▼                                 ▼
6. Job Processing              7. Rate Limiting
   │                                 │
   ├─ Launch Playwright              ├─ Check concurrency
   ├─ Navigate to room page          ├─ Apply delay (2s)
   ├─ Wait for page load             └─ Backoff on error
   ├─ Extract metadata                     │
   ├─ Parse HTML                           │
   └─ Close browser                        │
   │                                       │
   ▼                                       │
8. Data Processing ◄────────────────────────┘
   │
   ├─ Normalize tags
   ├─ Classify tag types
   ├─ Extract tools
   ├─ Parse lessons
   ├─ Calculate relevance scores
   └─ Generate justifications
   │
   ▼
9. Database Update
   │
   ├─ Update Room record
   ├─ Create/link Tags
   ├─ Create/link Tools
   ├─ Create Lessons
   ├─ Create RelevanceAssessments
   └─ Update scrapeStatus = OK
   │
   ▼
10. Update Progress
    │
    ├─ Increment success counter
    ├─ Update Redis progress
    └─ Log to ScrapeRun
    │
    ▼
11. Job Complete
    │
    ▼
12. Next Job (repeat until queue empty)
```

### Error Handling

```
Error Occurs
    │
    ▼
Retry Logic
    │
    ├─ Attempt 1: Immediate retry
    │   └─ Failed? → Wait 5s
    │
    ├─ Attempt 2: Retry with backoff
    │   └─ Failed? → Wait 15s
    │
    └─ Attempt 3: Final retry
        │
        ├─ Success → Continue
        │
        └─ Failed → Mark as FAILED
            │
            ├─ Log error to database
            ├─ Add to failed jobs list
            └─ Continue with next job
```

## 🔐 Security Architecture

### Authentication Flow

```
Login Request
    │
    ▼
NextAuth Credentials Provider
    │
    ├─ Validate email format
    ├─ Query user from database
    ├─ Compare password with bcrypt
    │
    ├─ Valid? → Create session
    │   │
    │   ├─ Generate JWT token
    │   ├─ Set HTTP-only cookie
    │   └─ Include user role
    │
    └─ Invalid? → Return error
```

### Authorization Flow

```
Protected Route Request
    │
    ▼
Middleware Check
    │
    ├─ Session exists?
    │   │
    │   ├─ Yes → Check role
    │   │   │
    │   │   ├─ Admin required?
    │   │   │   │
    │   │   │   ├─ User is Admin? → Allow
    │   │   │   └─ User is not Admin? → Deny (403)
    │   │   │
    │   │   └─ User role sufficient → Allow
    │   │
    │   └─ No → Redirect to login
    │
    └─ Continue to route handler
```

## 📊 Performance Considerations

### Database Optimization

**Indexes Created:**
- Room: slug, scrapeStatus, category, difficulty
- Tag: type, nameCanonical
- RoomTag: roomId, tagId
- RelevanceAssessment: roomId, rubricKey

**Query Optimization:**
- Use Prisma's `include` for eager loading
- Implement pagination (limit/offset)
- Cache frequently accessed data
- Use database views for complex queries

### Scraper Optimization

**Rate Limiting:**
- Max 3 concurrent requests
- 2 second delay between requests
- Exponential backoff on errors
- Timeout after 30 seconds

**Resource Management:**
- Reuse browser context
- Close pages after scraping
- Limit browser instances
- Monitor memory usage

### Frontend Optimization

**Performance:**
- Server Components for static content
- Client Components only when needed
- Image optimization with Next.js Image
- Code splitting by route
- Lazy loading for heavy components

**Caching:**
- Static page generation where possible
- Revalidate on-demand
- Cache API responses
- Use React Server Components

## 🧪 Testing Strategy

### Unit Tests

```
src/lib/tags/classifier.test.ts
├─ Test deterministic typing
├─ Test synonym mapping
├─ Test canonicalization
└─ Test confidence scoring

src/lib/relevance/scorer.test.ts
├─ Test keyword matching
├─ Test score calculation
├─ Test justification generation
└─ Test rubric definitions

src/lib/scraper/parser.test.ts
├─ Test HTML parsing
├─ Test data extraction
├─ Test error handling
└─ Test edge cases
```

### Integration Tests

```
API Routes
├─ /api/rooms
│   ├─ GET with filters
│   ├─ POST create room
│   └─ Error handling
├─ /api/scraper/start
│   ├─ Job creation
│   ├─ Queue integration
│   └─ Authorization
└─ /api/auth
    ├─ Login flow
    ├─ Session management
    └─ Role checks
```

### E2E Tests

```
User Flows
├─ Browse rooms
├─ Search and filter
├─ View room details
└─ Navigate between pages

Admin Flows
├─ Login as admin
├─ Start scrape job
├─ Monitor progress
├─ Edit room metadata
├─ Manage tags
└─ Export data
```

## 📈 Monitoring & Observability

### Application Metrics

```
Dashboard KPIs
├─ Total Rooms
├─ Scraped Rooms (OK status)
├─ Pending Rooms
├─ Failed Rooms
├─ Average Relevance Score
└─ Rooms by Category

Scraper Metrics
├─ Jobs in Queue
├─ Jobs Processing
├─ Jobs Completed
├─ Jobs Failed
├─ Average Scrape Time
└─ Success Rate
```

### Logging

```
Application Logs
├─ API requests
├─ Authentication events
├─ Database queries (slow queries)
└─ Error stack traces

Scraper Logs
├─ Job start/complete
├─ Page navigation
├─ Data extraction
├─ Errors and retries
└─ Rate limit events

System Logs
├─ Docker container logs
├─ PostgreSQL logs
├─ Redis logs
└─ Worker process logs
```

## 🚀 Deployment Architecture

### Development

```
Local Machine
├─ Docker Compose
│   ├─ postgres:16-alpine
│   ├─ redis:7-alpine
│   ├─ web (Next.js dev)
│   └─ worker (tsx watch)
└─ Volumes
    ├─ postgres_data
    └─ redis_data
```

### Production

```
Production Server
├─ Docker Compose
│   ├─ postgres:16-alpine (with backups)
│   ├─ redis:7-alpine (with persistence)
│   ├─ web (Next.js production build)
│   └─ worker (production mode)
├─ Nginx Reverse Proxy
│   ├─ SSL/TLS termination
│   ├─ Rate limiting
│   └─ Static file serving
├─ Monitoring
│   ├─ Prometheus
│   ├─ Grafana
│   └─ Alertmanager
└─ Backups
    ├─ PostgreSQL dumps (daily)
    ├─ Redis snapshots
    └─ Application logs
```

## 🔮 Scalability

### Horizontal Scaling

```
Load Balancer
    │
    ├─────────┬─────────┬─────────┐
    ▼         ▼         ▼         ▼
  Web 1    Web 2    Web 3    Web 4
    │         │         │         │
    └─────────┴─────────┴─────────┘
              │
              ▼
        PostgreSQL
        (with replicas)
              │
              ▼
          Redis Cluster
              │
              ▼
    ┌─────────┬─────────┬─────────┐
    ▼         ▼         ▼         ▼
Worker 1  Worker 2  Worker 3  Worker 4
```

### Vertical Scaling

- **Database**: Increase PostgreSQL resources
- **Workers**: More CPU for Playwright
- **Redis**: More memory for queue
- **Web**: More instances behind load balancer

## 📝 Summary

This architecture provides:
- ✅ **Scalable**: Horizontal and vertical scaling
- ✅ **Resilient**: Health checks, retries, error handling
- ✅ **Performant**: Indexes, caching, optimization
- ✅ **Secure**: Authentication, RBAC, encryption
- ✅ **Maintainable**: Clean code, documentation, testing
- ✅ **Compliant**: Rate limiting, respectful scraping

**Ready for implementation!** 🚀
