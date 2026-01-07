#!/bin/bash

echo "🚀 TryHackMe Room Explorer - Quick Setup"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and set NEXTAUTH_SECRET to a strong random value"
    echo ""
fi

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL, Redis)..."
docker-compose up -d postgres redis

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run Prisma migrations
echo "🗄️  Setting up database schema..."
npx prisma db push

# Seed database
echo "🌱 Seeding database with 960 rooms and admin user..."
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Start the development server: npm run dev"
echo "  2. Start the scraper worker (in another terminal): npm run worker"
echo "  3. Open http://localhost:3000 in your browser"
echo "  4. Login to admin panel at http://localhost:3000/admin"
echo "     Default credentials: admin@tryhackme-explorer.local / admin123"
echo ""
echo "🎯 To run with Docker Compose (recommended):"
echo "  docker-compose up -d"
echo "  docker-compose exec web npx prisma db push"
echo "  docker-compose exec web npm run db:seed"
echo ""
echo "Happy hacking! 🔐"
