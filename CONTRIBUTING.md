# Contributing to Postfix Dashboard

We're thrilled you want to contribute! Whether it's a bug fix, new feature, documentation improvement, or any other enhancement—we appreciate your effort and energy. Contributing should be fun and rewarding, so let's keep it simple and straightforward.

Please treat all project members with respect and fairness. We're committed to an open and welcoming community.

## Getting Started

**Branch naming:**

- `feature/description` (e.g., `feature/ai-log-analysis`)
- `fix/description` (e.g., `fix/cors-origin-validation`)
- `docs/description`
- `refactor/description`

## Commits & Changelog

We use [Conventional Commits](https://www.conventionalcommits.org/) to keep history clean:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `refactor`: Code improvements
- `test`: Tests
- `chore`: Build, dependencies, etc.

Example: `feat(analytics): add pie chart visualization`

For breaking changes, add `!`: `feat(api)!: change auth method`

Update [CHANGELOG.md](CHANGELOG.md) under `## [Unreleased]` using [Keep a Changelog](https://keepachangelog.com/) format. We handle versioning automatically!

## Submitting a PR

Here's what makes the review process smooth:

- [ ] Branch is up to date with `main`
- [ ] Code follows conventions (ESLint, Prettier)
- [ ] Tests pass
- [ ] CHANGELOG updated under `[Unreleased]`
- [ ] Commits follow Conventional Commits

**In your PR description:**

1. What does this PR do?
2. Type: Feature / Fix / Docs / Refactoring / etc.
3. Any breaking changes?
4. Related issues (if applicable)

Automated checks run automatically. We'll review and get back to you promptly!

## Local Development

```bash
# Install dependencies
npm install

# Frontend (with hot-reload)
cd frontend
npm run dev

# Backend (in a separate terminal)
cd backend
npm run start

# Linting
npm run lint:check

# Format code
npm run format:fix

# Run tests
npm run test
```

## Versioning

We follow [Semantic Versioning](https://semver.org/) and automate versioning via Conventional Commits. No manual work needed!
