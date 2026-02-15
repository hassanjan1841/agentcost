# Pre-Commit Checklist

Use this checklist before every `git commit` to ensure you're not committing secrets, build artifacts, or other unwanted files.

## Quick Check (30 seconds)

- [ ] Run `git status` and visually inspect
- [ ] No `.env` files in the list
- [ ] No `node_modules/` directory
- [ ] No build outputs (`dist/`, `.next/`)
- [ ] No log files (`*.log`)

**If ANY red flag appears → STOP and read below**

## Detailed Checklist

### 1. Environment & Secrets ⚠️ CRITICAL
- [ ] No `.env` file staged
- [ ] No `.env.local` file staged
- [ ] No `.env.production` file staged
- [ ] No credentials files (`.aws/`, `.gcp/`, `secrets.json`)
- [ ] No API keys in code comments
- [ ] No passwords in configuration files

**Command to check:**
```bash
git diff --cached --name-only | grep -E "\.env|credentials|secret|password|token|key"
```

### 2. Dependencies & Lock Files
- [ ] No `node_modules/` directory staged
- [ ] No `pnpm-store/` directory staged
- [ ] No `.yarn/` directory staged
- [ ] `pnpm-lock.yaml` ✅ OK to commit (for reproducibility)

**Command to check:**
```bash
git diff --cached --name-only | grep -E "node_modules|pnpm-store|\.yarn"
```

### 3. Build Artifacts
- [ ] No `dist/` directory staged
- [ ] No `build/` directory staged
- [ ] No `.next/` directory staged
- [ ] No `out/` directory staged
- [ ] No `.turbo/` directory staged
- [ ] No `*.tsbuildinfo` files

**Command to check:**
```bash
git diff --cached --name-only | grep -E "dist|build|\.next|out|\.turbo|tsbuildinfo"
```

### 4. IDE & Editor Files
- [ ] No `.vscode/` settings
- [ ] No `.idea/` files
- [ ] No `*.swp`, `*.swo` files
- [ ] No `*.sublime-workspace`
- [ ] No editor backups (`~`, `.bak`)

**Command to check:**
```bash
git diff --cached --name-only | grep -E "\.vscode|\.idea|swp|swo|sublime"
```

### 5. OS & System Files
- [ ] No `.DS_Store` (macOS)
- [ ] No `Thumbs.db` (Windows)
- [ ] No `.cache/` directory
- [ ] No `.local/` directory

**Command to check:**
```bash
git diff --cached --name-only | grep -E "\.DS_Store|Thumbs|\.cache|\.local"
```

### 6. Logs & Temporary Files
- [ ] No `*.log` files
- [ ] No `npm-debug.log*` files
- [ ] No `pnpm-debug.log*` files
- [ ] No `*.tmp` or `*.temp` files
- [ ] No `*.bak` backup files

**Command to check:**
```bash
git diff --cached --name-only | grep -E "\.log|\.tmp|\.bak|\.temp"
```

### 7. Testing & Coverage
- [ ] No `coverage/` directory
- [ ] No `.nyc_output/` directory
- [ ] No `.pytest_cache/` directory
- [ ] No `*.lcov` files

**Command to check:**
```bash
git diff --cached --name-only | grep -E "coverage|\.nyc_output|pytest_cache|lcov"
```

### 8. Source Code ✅ GOOD TO COMMIT
- [ ] `.ts` and `.tsx` files
- [ ] `.js` and `.jsx` files
- [ ] `.json` configuration files
- [ ] `.md` documentation files
- [ ] Source code in `src/`, `lib/`, `components/`, `app/`

**All source code should be committed!**

### 9. Configuration Files ✅ GOOD TO COMMIT
- [ ] `package.json`
- [ ] `pnpm-workspace.yaml`
- [ ] `tsconfig.json`
- [ ] `tailwind.config.ts`
- [ ] `next.config.js`
- [ ] `.eslintrc.json`
- [ ] `postcss.config.js`
- [ ] `.gitignore`

**All configuration files should be committed!**

### 10. Documentation ✅ GOOD TO COMMIT
- [ ] `README.md`
- [ ] `*.md` files
- [ ] `AGENTS.md`
- [ ] `QUICKSTART.md`
- [ ] License files

**All documentation should be committed!**

## Pre-Commit Script

Save this as `.git/hooks/pre-commit` (make it executable):

```bash
#!/bin/bash
set -e

echo "Running pre-commit checks..."

# Check for .env files
if git diff --cached --name-only | grep -q "\.env"; then
    echo "❌ ERROR: .env file detected in staging!"
    echo "Run: git reset .env"
    exit 1
fi

# Check for node_modules
if git diff --cached --name-only | grep -q "node_modules"; then
    echo "❌ ERROR: node_modules detected in staging!"
    echo "Run: git reset node_modules"
    exit 1
fi

# Check for build artifacts
if git diff --cached --name-only | grep -qE "dist/|build/|\.next/"; then
    echo "❌ ERROR: Build artifacts detected!"
    echo "Run: git reset dist/ build/ .next/"
    exit 1
fi

# Check for log files
if git diff --cached --name-only | grep -q "\.log"; then
    echo "❌ ERROR: Log files detected!"
    echo "Run: git reset '*.log'"
    exit 1
fi

echo "✅ Pre-commit checks passed!"
exit 0
```

Install hook:
```bash
chmod +x .git/hooks/pre-commit
```

## Workflow Commands

### Safe Commit Workflow
```bash
# 1. Check what will be committed
git status

# 2. Stage specific files (not everything)
git add path/to/file.ts
git add package.json

# 3. Review what's staged
git diff --cached --name-only

# 4. Run verification
git check-ignore -v .env
git check-ignore -v node_modules/

# 5. Commit with meaningful message
git commit -m "feat: add new feature"

# 6. Push to remote
git push origin branch-name
```

### If You See Red Flags

**Unstage everything:**
```bash
git reset HEAD
git status  # Check what's left
```

**Unstage specific file:**
```bash
git reset HEAD .env
git reset HEAD node_modules/
```

**Restore file to repo version:**
```bash
git checkout .env
```

**See what would be committed:**
```bash
git diff --cached --name-only
git diff --cached  # See actual changes
```

## Examples

### ✅ Good Commit
```bash
$ git status
On branch main
Changes to be committed:
  new file:   src/components/Button.tsx
  modified:   package.json
  modified:   README.md

$ git commit -m "feat: add Button component"
[main abc1234] feat: add Button component
 3 files changed, 150 insertions(+), 5 deletions(-)
```

### ❌ Bad Commit (Stopped by Checks)
```bash
$ git status
On branch main
Changes to be committed:
  modified:   .env
  modified:   .env.local
  new file:   node_modules/...

$ git commit -m "Update env"
❌ ERROR: .env file detected in staging!
# Fix before committing!
```

## Fixing Accidental Commits

### Case 1: Not Pushed Yet
```bash
# Remove from last commit
git reset HEAD~1
git checkout .env        # Get original
git add src/             # Add only source
git commit -m "feat: fix"
```

### Case 2: Already Pushed
```bash
# ⚠️ Requires force push - coordinate with team!
git reset HEAD~1
git checkout .env
git add src/
git commit -m "fix: remove env"
git push -f origin main  # Only if not pulled by team
```

### Case 3: Multiple Commits Back
```bash
# Use git filter-repo (advanced)
git filter-repo --path .env --invert-paths
git push -f origin main
# Notify entire team to re-clone
```

## Team Reminders

### Every Team Member Should
1. Set up local `.env` from `.env.example`
2. Run through this checklist before committing
3. Never share `.env` or `.env.local` files
4. Report if secrets are accidentally committed

### Before First Commit
```bash
# Copy example env
cp .env.example .env.local

# Edit with your values
nano .env.local

# Verify it's ignored
git check-ignore -v .env.local
# Should output: .gitignore:X:.env.local

# Never add .env.local
git add .env.local  # ❌ Wrong
```

## Quick Reference Commands

```bash
# Check if file is ignored
git check-ignore -v filename

# See all ignored files
git status --ignored

# Preview commit (don't stage everything!)
git diff --cached --name-only

# Unstage all
git reset HEAD

# Unstage specific file
git reset HEAD filename

# Restore file
git checkout filename
```

## Automation

Add this to your shell profile (`~/.bashrc` or `~/.zshrc`):

```bash
# Safe git status before commit
alias gsafe='git status && git diff --cached --name-only | grep -E "\.env|node_modules|\.log" && echo "⚠️ Found suspicious files!" || echo "✅ Safe to commit"'

# Use before every commit
gsafe
git commit -m "your message"
```

---

## Summary

**Before every commit:**
1. Run `git status`
2. Run `git diff --cached --name-only`
3. Check for red flags (.env, node_modules, *.log)
4. Only commit source code and configuration
5. Push with confidence ✅

**Remember:** It's easier to prevent than to fix!
