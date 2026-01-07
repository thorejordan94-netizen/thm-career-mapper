# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Docker & Docker Compose installed
- 8GB RAM minimum
- 10GB free disk space

### Step 1: Setup (1 minute)

```bash
# Clone and enter directory
cd /vercel/sandbox

# Run automated setup
./setup.sh
```

The script will:
- Create `.env` file with random secrets
- Ask for admin credentials (or use defaults)
- Start all Docker services
- Initialize database
- Seed 960 room slugs
- Create admin user

### Step 2: Access (30 seconds)

Open your browser:
- **Application**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### Step 3: Login (30 seconds)

Default credentials (unless you customized):
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Step 4: Start Scraping (3 minutes)

1. Go to Admin → Scraper
2. Click "Run Full Scrape"
3. Watch progress in real-time
4. Wait ~1-2 hours for all 960 rooms

---

## 📋 Common Commands

### Docker Management

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f web

# Restart a service
docker-compose restart web

# Check service status
docker-compose ps

# Remove all data (WARNING: deletes database)
docker-compose down -v
```

### Database Management

```bash
# View database in browser
npx prisma studio

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d

# Backup database
docker exec tryhackme_postgres pg_dump -U postgres tryhackme_explorer > backup.sql

# Restore database
docker exec -i tryhackme_postgres psql -U postgres tryhackme_explorer < backup.sql
```

### Development

```bash
# Install dependencies
npm install

# Start dev server (without Docker)
npm run dev

# Start worker (without Docker)
npm run worker

# Run linter
npm run lint

# Generate Prisma client
npm run db:generate
```

---

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check if ports are already in use
lsof -i :3000  # Next.js
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Kill processes using ports
kill -9 <PID>

# Restart Docker
docker-compose down
docker-compose up -d
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Scraper Not Working

```bash
# Check worker logs
docker-compose logs worker

# Restart worker
docker-compose restart worker

# Check Redis connection
docker-compose logs redis
```

### Out of Memory

```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory → 8GB+

# Or reduce scraper concurrency in .env
SCRAPER_CONCURRENCY="1"
```

---

## 📊 What's Included

### ✅ Ready to Use
- Docker Compose setup (4 services)
- PostgreSQL database with schema
- Redis for job queue
- 960 TryHackMe room slugs seeded
- Admin user created
- Environment variables configured
- Comprehensive documentation

### ⏳ To Be Implemented
- UI components (pages, components)
- Playwright scraper
- API routes
- Authentication (NextAuth)
- Tag classification
- Relevance scoring

See `IMPLEMENTATION_STATUS.md` for detailed roadmap.

---

## 🎯 Next Steps

### For Users
1. ✅ Run `./setup.sh`
2. ✅ Access http://localhost:3000
3. ✅ Login to admin panel
4. ⏳ Wait for UI implementation
5. ⏳ Start scraping rooms

### For Developers
1. ✅ Review `README.md`
2. ✅ Check `IMPLEMENTATION_STATUS.md`
3. ⏳ Implement `/src/lib/prisma.ts`
4. ⏳ Build UI components
5. ⏳ Create scraper
6. ⏳ Add authentication
7. ⏳ Test and deploy

---

## 📚 Documentation

- **README.md**: Comprehensive guide (400+ lines)
- **IMPLEMENTATION_STATUS.md**: Detailed roadmap
- **PROJECT_SUMMARY.md**: Executive overview
- **QUICK_START.md**: This file

---

## 🔗 Useful Links

### Services
- Web App: http://localhost:3000
- Admin Panel: http://localhost:3000/admin
- Prisma Studio: http://localhost:5555 (run `npx prisma studio`)

### Logs
```bash
docker-compose logs -f web      # Next.js logs
docker-compose logs -f worker   # Scraper logs
docker-compose logs -f postgres # Database logs
docker-compose logs -f redis    # Queue logs
```

### Database
```bash
# Connect to PostgreSQL
docker exec -it tryhackme_postgres psql -U postgres -d tryhackme_explorer

# Connect to Redis
docker exec -it tryhackme_redis redis-cli
```

---

## ⚡ Performance Tips

### Scraper Optimization
```bash
# Faster scraping (less respectful)
SCRAPER_CONCURRENCY="5"
SCRAPER_DELAY_MS="1000"

# Slower scraping (more respectful)
SCRAPER_CONCURRENCY="1"
SCRAPER_DELAY_MS="5000"
```

### Database Optimization
```bash
# Add indexes (already included in schema)
# Vacuum database periodically
docker exec tryhackme_postgres psql -U postgres -d tryhackme_explorer -c "VACUUM ANALYZE;"
```

### Memory Management
```bash
# Monitor memory usage
docker stats

# Limit container memory
docker-compose up -d --scale worker=1 --memory=2g
```

---

## 🎉 Success Checklist

- [ ] Docker services running (`docker-compose ps`)
- [ ] Database accessible (`docker exec -it tryhackme_postgres psql -U postgres`)
- [ ] Redis accessible (`docker exec -it tryhackme_redis redis-cli ping`)
- [ ] Web app accessible (http://localhost:3000)
- [ ] Admin login works (http://localhost:3000/admin)
- [ ] 960 rooms seeded (`docker exec -it tryhackme_postgres psql -U postgres -d tryhackme_explorer -c "SELECT COUNT(*) FROM \"Room\";"`)

---

## 💡 Pro Tips

1. **Use Prisma Studio** for easy database browsing: `npx prisma studio`
2. **Monitor logs** in real-time: `docker-compose logs -f`
3. **Backup before scraping**: `docker exec tryhackme_postgres pg_dump -U postgres tryhackme_explorer > backup.sql`
4. **Test incrementally**: Start with 10 rooms, then scale up
5. **Check rate limits**: Monitor TryHackMe for any blocking

---

## 🆘 Need Help?

1. Check logs: `docker-compose logs`
2. Review README.md
3. Check IMPLEMENTATION_STATUS.md
4. Open GitHub issue
5. Check Docker status: `docker-compose ps`

---

**Ready to build? Start implementing! 🚀**
