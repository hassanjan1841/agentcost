# PostgreSQL Setup for AgentCost Dashboard

Your PostgreSQL is running but needs database setup. Choose one option:

## Option 1: Using the Setup Script (Easiest)

```bash
cd /home/hassan-jan/agentcost
bash setup-postgres.sh
```

This will:
1. Create database and user role
2. Load the schema
3. Configure .env.local

## Option 2: Manual Setup

If you prefer manual setup or the script doesn't work:

### Step 1: Create Role and Database

You may need to run these commands with sudo. Try:

```bash
# Create a PostgreSQL role and database
sudo psql -U postgres -c "CREATE USER agentcost WITH PASSWORD 'agentcost';"
sudo psql -U postgres -c "CREATE DATABASE agentcost OWNER agentcost;"
sudo psql -U postgres -c "ALTER USER agentcost CREATEDB;"
```

### Step 2: Load Schema

```bash
# Connect as the agentcost user and load schema
psql -h localhost -U agentcost -d agentcost -f apps/dashboard/lib/schema.sql
```

When prompted for password, enter: `agentcost`

### Step 3: Update .env.local

```bash
cat > apps/dashboard/.env.local << 'ENVEOF'
POSTGRES_URL="postgresql://agentcost:agentcost@localhost:5432/agentcost"
POSTGRES_PRISMA_URL="postgresql://agentcost:agentcost@localhost:5432/agentcost?schema=public"
POSTGRES_URL_NON_POOLING="postgresql://agentcost:agentcost@localhost:5432/agentcost"
POSTGRES_USER="agentcost"
POSTGRES_HOST="localhost"
POSTGRES_PASSWORD="agentcost"
POSTGRES_DATABASE="agentcost"
ENVEOF
```

### Step 4: Test Connection

```bash
psql -h localhost -U agentcost -d agentcost -c "SELECT 1"
```

Should return: `1`

## Option 3: Use Socket Connection (Linux Only)

If you have peer authentication enabled:

```bash
# Create database for current user
sudo createdb agentcost

# Load schema
psql -d agentcost < apps/dashboard/lib/schema.sql

# Update .env.local
cat > apps/dashboard/.env.local << 'ENVEOF'
POSTGRES_URL="postgresql:///agentcost"
POSTGRES_PRISMA_URL="postgresql:///agentcost?schema=public"
POSTGRES_URL_NON_POOLING="postgresql:///agentcost"
POSTGRES_USER="postgres"
POSTGRES_HOST="localhost"
POSTGRES_PASSWORD=""
POSTGRES_DATABASE="agentcost"
ENVEOF
```

## Troubleshooting

### "role does not exist"
You need to create the role first:
```bash
sudo psql -U postgres -c "CREATE USER agentcost WITH PASSWORD 'agentcost';"
```

### "permission denied"
You need elevated privileges. Use `sudo`:
```bash
sudo psql -U postgres -c "..."
```

### "connection refused"
PostgreSQL might not be running:
```bash
sudo systemctl start postgresql
```

### "password authentication failed"
Make sure the password in the command matches .env.local:
```bash
# If you used password "agentcost" in creation:
POSTGRES_PASSWORD="agentcost"
```

## Verify Setup

After setup, test the dashboard:

```bash
cd apps/dashboard
pnpm dev
```

Visit http://localhost:3000/dashboard

If you see "No requests yet" instead of an error, setup is successful! ✅

Then seed demo data:
```bash
npx tsx scripts/seed-demo-data.ts
```

## Get Help

If stuck, provide:
1. Output of `psql --version`
2. Output of `sudo systemctl status postgresql`
3. Error message from dashboard
4. Your .env.local (without passwords)
