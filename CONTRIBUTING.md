# Contributing to Postfix Dashboard

Danke, dass Sie zum Postfix Dashboard Projekt beitragen! Dieses Dokument beschreibt die Richtlinien und Best Practices für die Zusammenarbeit.

## Inhaltsverzeichnis

- [Code of Conduct](#code-of-conduct)
- [Bevor Sie beginnen](#bevor-sie-beginnen)
- [Git Workflow](#git-workflow)
- [Commit-Konventionen](#commit-konventionen)
- [Changelog Updates](#changelog-updates)
- [Pull Requests](#pull-requests)

## Code of Conduct

Bitte behandeln Sie alle Projektmitglieder mit Respekt und Fairness. Wir verpflichten uns zu einer offenen und einladenden Community.

## Bevor Sie beginnen

1. **Fork** das Repository
2. **Clone** Ihren Fork:
   ```bash
   git clone https://github.com/your-username/postfix-dashboard.git
   cd postfix-dashboard
   ```
3. **Erstellen Sie einen Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Git Workflow

### Branch Naming

- **Features**: `feature/description` (z.B. `feature/ai-log-analysis`)
- **Bugfixes**: `fix/issue-description` (z.B. `fix/cors-origin-validation`)
- **Dokumentation**: `docs/description`
- **Refactoring**: `refactor/description`

### Branch Protection

Der `main` Branch ist geschützt:
- Pull Requests müssen Reviews erhalten
- Alle Checks müssen bestehen (Linting, Tests, Builds)
- Nur auf dem `main` werden Releases durchgeführt

## Commit-Konventionen

Dieses Projekt folgt der **Conventional Commits** Spezifikation:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

- **feat**: Ein neues Feature
- **fix**: Ein Bugfix
- **docs**: Dokumentationsänderungen
- **style**: Formatierung (Whitespace, Linting, Semicolons)
- **refactor**: Code-Umstrukturierung ohne Feature-Änderung
- **perf**: Performance-Verbesserungen
- **test**: Tests hinzufügen oder korrigieren
- **chore**: Build, Dependencies, etc.

### Beispiele

```
feat(analytics): add pie chart visualization
- Implements pie chart component
- Integrates with existing analytics dashboard
- Closes #123

fix(auth): prevent token expiration edge case

docs(readme): add installation instructions for Docker

feat(core)!: change API authentication method
BREAKING CHANGE: The /api/login endpoint is deprecated in favor of OAuth2
```

### Breaking Changes

Breaking Changes müssen mit `!` gekennzeichnet werden und im Footer dokumentiert sein:

```
feat(api)!: rewrite request/response format
BREAKING CHANGE: Requests now require Bearer token authentication
```

## Changelog Updates

Das Changelog folgt dem **Keep-a-Changelog** Format ([keepachangelog.com](https://keepachangelog.com/en/1.0.0/)) und wird automatisch bei Releases aktualisiert.

### ⚠️ Wichtig: CHANGELOG.md Anforderungen

**Bei jedem PR:**

1. ✅ Sektion `## [Unreleased]` MUSS existieren
2. ✅ Updates müssen unter passender Kategorie (Added, Changed, Fixed, etc.) eingetragen werden
3. ✅ **NICHT** manuell Versionsnummern oder Daten hinzufügen
4. ✅ Format muss exakt Keep-a-Changelog Standard entsprechen

Die automatische Release-Action wird:

- `## [Unreleased]` in `## [Version] - YYYY-MM-DD` umwandeln
- Automatisch eine neue `[Unreleased]` Sektion erstellen
- Ohne manuelles Eingreifen funktionieren ✨

### CHANGELOG Struktur

Die Datei `CHANGELOG.md` muss diese Struktur befolgen:

```markdown
# Changelog

All notable changes to this project will be documented in this file.
...

## [Unreleased]

### Added
- Feature descriptions

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

### Deprecated
- Features that will be removed

### Removed
- Features that were removed

### Security
- Security fixes

## [Version] - YYYY-MM-DD

### Added
...

### Changed
...

### Fixed
...
```

### Richtlinien für CHANGELOG Einträge

1. **Sektion `[Unreleased]` verwenden**: Alle neuen Änderungen gehören unter `## [Unreleased]` in die passende Kategorie
2. **Keep-a-Changelog Format**: Verwenden Sie diese standardisierten Kategorien:
   - **Added** - für neue Features
   - **Changed** - für Änderungen an bestehender Funktionalität
   - **Fixed** - für Bugfixes
   - **Deprecated** - für Features, die bald entfernt werden
   - **Removed** - für entfernte Features
   - **Security** - für Security-Fixes

3. **Format**: Jeder Eintrag ist eine Bullet-List:
   ```markdown
   ## [Unreleased]
   
   ### Added
   - New AI-powered log filtering feature
   - Support for multi-tenant configuration
   
   ### Fixed
   - CORS issues with Safari browsers
   - Memory leak in chart rendering
   ```

4. **Automatische Version-Migration**: Bei Releases wird `## [Unreleased]` automatisch in `## [Version] - Date` umgewandelt und eine neue `[Unreleased]` Sektion erstellt

### Changelog Validierung

Der Release-Workflow validiert automatisch:

- ✅ `## [Unreleased]` Sektion existiert
- ✅ Keep-a-Changelog Format ist korrekt
- ✅ Version Headers sind im Format `## [Version]`

Falls das Changelog nicht validiert, wird der Release blockiert!

## Pull Requests

### PR-Template befolgen

Verwenden Sie das bereitgestellte PR-Template und füllen Sie aus:

1. **Beschreibung**: Was macht dieser PR?
2. **Typ**: Feature / Fix / Docs / Refactoring / etc.
3. **Changelog**: Notieren Sie Ihre CHANGELOG-Updates unter `[Unreleased]`
4. **Tests**: Haben Sie Tests hinzugefügt/aktualisiert?
5. **Breaking Changes**: Sind Breaking Changes vorhanden?

### Checkliste vor dem Einreichen

- [ ] Branch ist aktuell mit `main`
- [ ] Code folgt den Project-Konventionen (Linting, Formatting)
- [ ] Tests sind geschrieben und bestanden
- [ ] CHANGELOG.md wurde aktualisiert (`[Unreleased]` Sektion) **im Keep-a-Changelog Format**
- [ ] Commits folgen Conventional Commits Spezifikation
- [ ] Keine Merge-Commits - rebase falls nötig

### Code Review Prozess (erforderlich)

**Jeder PR benötigt mindestens 1 Review von einem Projektmitarbeiter.**

**Automatische Checks** (müssen alle bestehen):

1. ESLint Validierung ✅
2. Prettier Format-Check ✅
3. Tests müssen bestehen ✅
4. CHANGELOG.md Keep-a-Changelog Format-Validierung ✅

**Manueller Maintainer-Review** (erforderlich):

1. Ein Maintainer wird den PR reviewen
2. Feedback wird in Kommentaren gegeben
3. Machen Sie die angeforderten Änderungen
4. Pushen Sie neue Commits (neuer Force-Push nicht empfohlen)
5. Der Reviewer approved und merget den PR

### Review-Kriterien

Reviewer prüfen:

- **Funktionalität**: Funktioniert der Code wie dokumentiert?
- **Code-Qualität**: Ist der Code lesbar und wartbar?
- **Tests**: Sind Tests vorhanden und aussagekräftig?
- **Dokumentation**: Sind Änderungen dokumentiert?
- **CHANGELOG**: Wurde das CHANGELOG korrekt aktualisiert (Keep-a-Changelog Format)?
- **Sicherheit**: Gibt es Sicherheitsrisiken?
- **Performance**: Könnten Performance-Probleme entstehen?
- **Breaking Changes**: Sind Breaking Changes dokumentiert?

## Lokale Entwicklung

### Setup

```bash
# Dependencies installieren
npm install

# Frontend entwickeln (mit Hot-Reload)
cd frontend
npm run dev

# Backend in separatem Terminal
cd backend
npm run dev

# Docker Compose (optional)
docker-compose -f docker-compose.dev.yml up
```

### Linting & Formatting

```bash
# ESLint prüfen
npm run lint

# Prettier formatieren
npm run format:fix

# Tests ausführen
npm run test
```

## Versionierung

Das Projekt folgt **Semantic Versioning** (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking Changes oder große Features
- **MINOR**: Neue Features (backward-compatible)
- **PATCH**: Bugfixes

Die Version wird automatisch im Release-Prozess berechnet basierend auf Conventional Commits.

## Questions?

Eröffnen Sie eine Diskussion oder schauen Sie in die bestehenden Issues - vielleicht wurde Ihre Frage bereits beantwortet!

---

Danke für Ihren Beitrag! 🙏
