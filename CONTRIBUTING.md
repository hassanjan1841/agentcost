# Contributing to AgentCost

Thank you for your interest in contributing! 🎉

## How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/my-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit**: `git commit -m 'Add my feature'`
6. **Push**: `git push origin feature/my-feature`
7. **Open a Pull Request**

## Development Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/agentcost
cd agentcost

# Install dependencies
pnpm install

# Set up environment
cp apps/dashboard/.env.example apps/dashboard/.env.local

# Start development
pnpm --filter dashboard dev
```

## What to Contribute

We welcome:

- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation improvements**
- 🎨 **UI/UX enhancements**
- 🧪 **Tests**
- 🌍 **Translations**

## Code Style

- Use TypeScript
- Follow existing patterns
- Add comments for complex logic
- Write meaningful commit messages

## Testing
```bash
# Run SDK tests
cd packages/sdk
pnpm test:mocks

# Test dashboard
cd apps/dashboard
pnpm dev
```

## Questions?

Open an issue or join our [Discord](https://discord.gg/agentcost)!
