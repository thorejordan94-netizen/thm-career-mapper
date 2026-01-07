#!/bin/bash

# TryHackMe Room Explorer - Setup Script
# This script helps you get started quickly

set -e

echo "🚀 TryHackMe Room Explorer - Setup Script"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    
    # Generate a random secret for NEXTAUTH_SECRET
    SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-this-secret-in-production")
    
    # Update .env with generated secret
    if command -v sed &> /dev/null; then
        sed -i.bak "s/your-secret-key-change-this-in-production/$SECRET/" .env
        rm -f .env.bak
    fi
    
    echo "✅ .env file created with random NEXTAUTH_SECRET"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Ask user if they want to customize admin credentials
echo "🔐 Admin Credentials Setup"
echo "-------------------------"
read -p "Do you want to customize admin credentials? (y/N): " customize

if [[ $customize =~ ^[Yy]$ ]]; then
    read -p "Admin Email [admin@example.com]: " admin_email
    admin_email=${admin_email:-admin@example.com}
    
    read -sp "Admin Password [admin123]: " admin_password
    echo ""
    admin_password=${admin_password:-admin123}
    
    # Update .env file
    if command -v sed &> /dev/null; then
        sed -i.bak "s/ADMIN_EMAIL=\".*\"/ADMIN_EMAIL=\"$admin_email\"/" .env
        sed -i.bak "s/ADMIN_PASSWORD=\".*\"/ADMIN_PASSWORD=\"$admin_password\"/" .env
        rm -f .env.bak
    fi
    
    echo "✅ Admin credentials updated"
else
    echo "ℹ️  Using default credentials:"
    echo "   Email: admin@example.com"
    echo "   Password: admin123"
fi
echo ""

# Start Docker Compose
echo "🐳 Starting Docker Compose services..."
echo "This may take a few minutes on first run..."
echo ""

docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    echo ""
    echo "🎉 Setup Complete!"
    echo ""
    echo "📍 Access the application:"
    echo "   - Web App: http://localhost:3000"
    echo "   - Admin Panel: http://localhost:3000/admin"
    echo "   - Database: localhost:5432"
    echo "   - Redis: localhost:6379"
    echo ""
    echo "🔑 Admin Login:"
    echo "   Email: $(grep ADMIN_EMAIL .env | cut -d '=' -f2 | tr -d '"')"
    echo "   Password: $(grep ADMIN_PASSWORD .env | cut -d '=' -f2 | tr -d '"')"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Open http://localhost:3000 in your browser"
    echo "   2. Login to admin panel at /admin"
    echo "   3. Go to Scraper section"
    echo "   4. Click 'Run Full Scrape' to scrape all 960 rooms"
    echo ""
    echo "📖 View logs:"
    echo "   docker-compose logs -f web"
    echo ""
    echo "🛑 Stop services:"
    echo "   docker-compose down"
    echo ""
else
    echo "❌ Some services failed to start. Check logs:"
    echo "   docker-compose logs"
    exit 1
fi
