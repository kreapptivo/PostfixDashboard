# Changelog

All notable changes to this project will be documented in this file.

See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- GitHub workflows for changelog updates and release management
- CONTRIBUTING guidelines and project workflow documentation
- commitlint configuration for conventional commits
- Production and development Docker Compose setups (Traefik reverse proxy, TLS handling, rate limits)
- GitHub Actions for backend/frontend CI with linting, tests, coverage badges, and Docker build checks
- Multi-arch Docker image build-and-publish workflow to GHCR for frontend and backend
- Repository-wide Prettier/ESLint tooling wired into simple-git-hooks
- npm workspaces setup with centralized version management and auto-generated version constants
- frontend use selector to choose ai provider from backend health response

### Changed
- Documentation and badges reorganized to align with automated CI artifacts
- Version handling unified across backend and frontend using root package.json as single source of truth
- CI workflow optimized to use workspace-based dependency installation and caching

### Fixed
- Frontend Nginx config no longer overrides API paths or base URL, keeping SPA routing intact
- CORS origin handling honors the configured allowlist to prevent blocked requests
- backend tests
- CI support for coverage reporting and fix health check tests for AI providers
- changelog parsing for suggestion
- add port 5173 to allowedOrigin for local dev tests

## [2.2.0] - 2025-11-01
### Added
- Advanced analytics with multiple chart types (bar, line, area, pie, radar)
- Improved IP address tracking (local vs relay IPs)
- Enhanced AI analysis with detailed statistics
- Collapsible sidebar for better space management
- Better error messages and user feedback

### Changed
- Updated dependencies to latest versions
- Improved performance for large log files
- Better mobile responsiveness
- Enhanced chart rendering and interactions

### Fixed
- IP address extraction bug in analytics
- Token expiration handling
- Chart rendering issues on mobile devices

## [2.1.0] - 2025-10-31
### Added
- AI-powered log analysis with Gemini and Ollama support
- Allowed networks management interface
- Enhanced date filtering capabilities
- CSV export functionality for logs and analytics
- Executive summaries and anomaly detection

### Changed
- Improved log parsing efficiency
- Enhanced UI/UX for better user experience

### Fixed
- Various bug fixes and improvements

## [2.0.0] - 2025-10-24
### Added
- Type safety across the entire application
- Better error handling
- Improved state management

### Changed
- Complete rewrite in TypeScript
- Migrated to React 18 with modern hooks
- New UI with Tailwind CSS
- Improved authentication system
- Enhanced overall UI/UX

## [1.0.0] - 2025-10-24
### Added
- Initial release
- Basic log viewing functionality
- Simple statistics dashboard
- Mail volume charts
- Authentication system
- Real-time log monitoring
