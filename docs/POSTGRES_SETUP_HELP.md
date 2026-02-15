# PostgreSQL Setup - Need Your Help

The automated setup needs elevated privileges that we can't access without your password. Here's what to do:

## Quick Fix (2 minutes)

Run this ONE command in your terminal - it will ask for your password once:

```bash
sudo psql -U postgres -c "CREATE USER agentcost WITH PASSWORD 'agentcost' CREATEDB; CREATE DATABASE agentcost OWNER agentcost; \c agentcost; $(cat /home/hassan-jan/agentcost/apps/dashboard/lib/schema.sql)"
```

Or broken down (easier):

```bash
# Step 1 - Create user and database (will ask for password)
sudo psql -U postgres << SQL
CREATE USER agentcost WITH PASSWORD 'agentcost' CREATEDB;
CREATE DATABASE agentcost OWNER agentcost;
GRANT ALL PRIVILEGES ON DATABASE agentcost TO agentcost;
SQL

# Step 2 - Load the schema
psql -h localhost -U agentcost -d agentcost -f /home/hassan-jan/agentcost/apps/dashboard/lib/schema.sql
```

When `psql` asks for the password in Step 2, type: `agentcost`

---

## What This Does

1. **Creates a PostgreSQL user** called `agentcost` with password `agentcost`
2. **Creates a database** called `agentcost` owned by the user
3. **Loads the schema** (tables, indexes, demo project)

---

## After Setup

1. **Stop the dashboard** - Press Ctrl+C in the terminal running `pnpm dev`
2. **Restart it:**
   ```bash
   cd /home/hassan-jan/agentcost/apps/dashboard
   pnpm dev
   ```
3. **Open http://localhost:3000/dashboard** - Should work without errors!

---

## Verify It Worked

Test the connection:

```bash
psql -h localhost -U agentcost -d agentcost -c "SELECT 1"
```

If you see `1` returned, you're good! ✅

---

## Seed Demo Data

Once confirmed working:

```bash
cd /home/hassan-jan/agentcost/apps/dashboard
npx tsx scripts/seed-demo-data.ts
```

Then refresh http://localhost:3000/dashboard - you'll see demo data! ✨

---

## Having Issues?

**"password authentication failed"**
- Make sure password is `agentcost` (set in Step 1)
- Or try without password: `psql -h localhost -U agentcost -d agentcost`

**"database does not exist"**
- Step 1 didn't complete - try again with `sudo`

**"role does not exist"**
- Make sure Step 1 created the user

**Still stuck?**
- Try Option 2 from POSTGRES_SETUP.md
- Or use Vercel Postgres (no local setup needed)

---

## Your .env.local is Already Updated

It now points to the local database:
```env
POSTGRES_URL="postgresql://agentcost:agentcost@localhost:5432/agentcost"
```

---

**TL;DR:** Copy-paste this:
```bash
sudo psql -U postgres << 'SQL'
CREATE USER agentcost WITH PASSWORD 'agentcost' CREATEDB;
CREATE DATABASE agentcost OWNER agentcost;
GRANT ALL PRIVILEGES ON DATABASE agentcost TO agentcost;
SQL

psql -h localhost -U agentcost -d agentcost -f /home/hassan-jan/agentcost/apps/dashboard/lib/schema.sql
```

Then enter password when asked.
