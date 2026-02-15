# GitIgnore Reference - AgentCost Project

## Quick Summary

### What Gets Committed ✅
- Source code (`.ts`, `.tsx`, `.js`, `.jsx`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Documentation (`.md` files)
- Assets that are source (not generated)
- Example files (`.example.env`, etc.)

### What Gets Ignored ❌
- `node_modules/` - Dependencies (reinstall via pnpm)
- `.env*` - Secrets and credentials
- `dist/`, `build/`, `.next/` - Generated files
- `.DS_Store`, `Thumbs.db` - OS files
- `*.log` - Log files
- IDE configs (`.vscode/`, `.idea/`)
- Cache files (`.eslintcache`, etc.)

## GitIgnore Files in This Project

### 1. Root `.gitignore`
**Location:** `/home/hassan-jan/agentcost/.gitignore`

Handles:
- Monorepo-wide dependencies
- Build artifacts across all packages
- Environment variables
- IDE settings
- OS files
- CI/CD artifacts
- Testing coverage

### 2. Dashboard `.gitignore`
**Location:** `/home/hassan-jan/agentcost/apps/dashboard/.gitignore`

Handles:
- Next.js specific files (`.next/`, `out/`)
- Next.js env files
- Vercel deployment files
- Yarn-specific files (if used)

**Note:** Inherits patterns from root `.gitignore`

## Critical Files Never to Commit

### 1. Environment Files
```
.env              ← Database passwords, API keys
.env.local        ← Local development overrides
.env.production   ← Production secrets
.env.*.local      ← Any local env variant
```

**If accidentally committed:**
1. Stop and do NOT push
2. Run: `git rm --cached .env`
3. Rotate all exposed credentials immediately
4. Amend commit: `git commit --amend`
5. Force push (only if not pushed yet): `git push -f`

### 2. Dependencies
```
node_modules/           ← 1000s of files, not source
pnpm-lock.yaml          ← For reproducibility only
packages/*/node_modules ← Symlinked from root
```

### 3. Build Outputs
```
dist/
build/
apps/dashboard/.next/
packages/sdk/dist/
```

## File-by-File Reference

### Source Code ✅ COMMIT
```
src/*.ts
src/*.tsx
lib/*.ts
components/*.tsx
app/**/*.tsx
pages/**/*.tsx
```

### Configuration ✅ COMMIT
```
package.json
pnpm-workspace.yaml
tsconfig.json
tailwind.config.ts
next.config.js
.eslintrc.json
postcss.config.js
```

### Documentation ✅ COMMIT
```
README.md
AGENTS.md
QUICKSTART.md
**/*.md
```

### Examples ✅ COMMIT
```
.env.example
.env.local.example
examples/
```

### Dependencies ❌ IGNORE
```
node_modules/
.pnp
.yarn/
```

### Environment ❌ IGNORE
```
.env
.env.local
.env.*.local
.env.production
secrets.json
credentials.json
```

### Build Artifacts ❌ IGNORE
```
dist/
build/
.next/
out/
.turbo/
*.tsbuildinfo
```

### IDE ❌ IGNORE
```
.vscode/
.idea/
*.swp
*.swo
.sublime-workspace
```

### OS ❌ IGNORE
```
.DS_Store
Thumbs.db
.cache/
.local/
```

### Logs ❌ IGNORE
```
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*
```

### Testing ❌ IGNORE
```
coverage/
.nyc_output/
.pytest_cache/
```

## Before Every Commit

### Checklist
- [ ] Run `git status` and review files
- [ ] No `.env` files staged
- [ ] No `node_modules/` directory
- [ ] No build outputs (`dist/`, `.next/`)
- [ ] No `*.log` files
- [ ] Only source code and configuration

### Commands
```bash
# Review what will be committed
git status

# Check for sensitive files
git diff --cached --name-only | grep -E "\.env|node_modules|\.log"

# Verify a file is ignored
git check-ignore -v .env

# See what's actually ignored
git status --ignored | head -20
```

## Team Guidelines

### For All Developers
1. Copy example env file to local: `cp .env.example .env.local`
2. Edit `.env.local` with your credentials
3. Never commit `.env` or `.env.local`
4. Run `git status` before every commit
5. Use IDE source control to visualize changes

### For DevOps/CI
1. Secrets passed via environment variables
2. No `.env` file needed
3. Credentials stored in GitHub Secrets or CI platform
4. Use `--allow-empty-message` if needed

### For New Team Members
1. Clone repo: `git clone <url>`
2. Setup local env: `cp .env.example .env.local`
3. Install: `pnpm install`
4. Run: `pnpm dev`
5. Never share `.env.local` file

## Common Git Commands

### Check What's Ignored
```bash
# Specific file
git check-ignore -v .env

# All ignored files
git status --ignored

# See untracked files
git status --untracked-files=all
```

### Fix Accidental Commits

**Case 1: File staged but not committed**
```bash
git reset .env              # Unstage
git checkout .env           # Restore from repo
```

**Case 2: File already committed (not pushed)**
```bash
git rm --cached .env        # Stop tracking
git commit --amend          # Amend last commit
git push -f origin main     # Force push (careful!)
```

**Case 3: File pushed to remote**
```bash
# ⚠️ CRITICAL - Rotate all credentials immediately!
# Use git filter-repo (advanced)
git filter-repo --path .env --invert-paths
git push -f origin main
# Notify team immediately
```

## Verification Script

Run before pushing:
```bash
#!/bin/bash
echo "Checking for secrets..."
git diff --cached --name-only | while read file; do
  if [[ $file =~ \\.env || $file =~ node_modules || $file =~ \\.log ]]; then
    echo "❌ FAIL: $file should not be committed"
    exit 1
  fi
done
echo "✅ OK: No secrets detected"
```

## Configuration Details

### Root Project Structure
```
agentcost/
├── .gitignore              ← Main configuration
├── apps/
│   └── dashboard/
│       └── .gitignore      ← Next.js specific
├── packages/
│   └── sdk/
│       └── (no .gitignore) ← Uses root
├── node_modules/           ← Ignored
├── .env.local              ← Ignored
└── pnpm-lock.yaml          ← Tracked (reproducibility)
```

### Ignore Pattern Precedence
1. Root `.gitignore` applies to all files
2. Package `.gitignore` applies locally
3. Later patterns override earlier ones
4. `!` prefix negates patterns

## Documentation
- Full guide: `GITIGNORE_GUIDE.md`
- This reference: `GITIGNORE_REFERENCE.md`

## Support
- Git docs: https://git-scm.com/docs/gitignore
- GitHub help: https://help.github.com/articles/ignoring-files/
