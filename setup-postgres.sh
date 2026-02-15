#!/bin/bash
# PostgreSQL Setup Script for AgentCost
# Run this with: bash setup-postgres.sh

echo "🗄️  Setting up PostgreSQL for AgentCost..."
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running"
    echo "Start PostgreSQL with:"
    echo "  sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Create database and role
echo "Creating database and role..."

# Try to create with sudo (may require password)
sudo -n psql -U postgres -c "
    -- Create role if not exists
    DO \$\$ BEGIN
        CREATE ROLE agentcost WITH LOGIN CREATEDB;
    EXCEPTION WHEN DUPLICATE_OBJECT THEN
        NULL;
    END \$\$;
    
    -- Create database
    CREATE DATABASE agentcost OWNER agentcost;
    
    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE agentcost TO agentcost;
" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database 'agentcost' created"
    echo ""
    echo "Running schema..."
    psql -h localhost -U agentcost -d agentcost < apps/dashboard/lib/schema.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Schema loaded successfully"
        echo ""
        echo "🎉 PostgreSQL setup complete!"
        echo ""
        echo "Your .env.local is configured with:"
        echo "  POSTGRES_URL='postgresql://agentcost@localhost/agentcost'"
        echo ""
        exit 0
    else
        echo "❌ Failed to load schema"
        exit 1
    fi
else
    echo ""
    echo "⚠️  Need elevated privileges. Run this with your password:"
    echo ""
    echo "sudo bash setup-postgres.sh"
    exit 1
fi
