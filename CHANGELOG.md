# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-04

### Breaking Changes

- **Class naming convention:** The main class has been renamed from `i18nModern` to `I18nModern` to follow PascalCase convention for TypeScript/JavaScript classes. See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration instructions.

```typescript
// Before (v1.x)
import { i18nModern } from "i18n_modern";
const i18n = new i18nModern("en-US", locales);

// After (v2.0.0)
import { I18nModern } from "i18n_modern";
const i18n = new I18nModern("en-US", locales);
```

### Added

- Migration guide for breaking changes
- Changelog documentation

### Changed

- Class naming to follow TypeScript/JavaScript conventions

---

## [1.x.x] - Previous versions

See git history for details on earlier versions.
