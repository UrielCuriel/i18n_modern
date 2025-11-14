# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.0.1](https://github.com/UrielCuriel/i18n_modern/compare/v1.0.0...v2.0.1) (2025-11-14)

### Features

- add benchmarking for expression evaluator and i18n translations ([6957a69](https://github.com/UrielCuriel/i18n_modern/commit/6957a6985e89c9ad8f807c153248b810f79004f3))
- add documentation ([46f7077](https://github.com/UrielCuriel/i18n_modern/commit/46f7077e641a9782e51082f16b58417d9afd5dcd))
- add husky and standard version ([49b3cf5](https://github.com/UrielCuriel/i18n_modern/commit/49b3cf5b597d6215c0f34b6db8ccbe1d12020c5c))
- **i18n:** add notifications and status translations with context handling ([3e48086](https://github.com/UrielCuriel/i18n_modern/commit/3e48086ede6e4b51a71cbb0a1659c94a110a3cb7))

### Bug Fixes

- corregir la importación de i18nModern en las pruebas unitarias ([59abecb](https://github.com/UrielCuriel/i18n_modern/commit/59abecb57d4bbdbd314a49f7f4182b65eb3959bf))
- corregir la referencia a la clase I18nModern en la documentación y actualizar la configuración del compilador para usar la resolución de módulos 'Bundler' ([3b90075](https://github.com/UrielCuriel/i18n_modern/commit/3b90075e158706765317195220fb3a01b18106af))
- modified regex to validate keys before using eval function ([f63b3bf](https://github.com/UrielCuriel/i18n_modern/commit/f63b3bfeb75b225db90a5361150365acbe88cc76))
- update build script and improve server stop behavior in tests ([680dffb](https://github.com/UrielCuriel/i18n_modern/commit/680dffbd1d51f6c1cf7c16ebbb8c71134d1e1e3b))
- use deterministic cache key approach to avoid JSON.stringify issues ([40e572f](https://github.com/UrielCuriel/i18n_modern/commit/40e572f957a3eefd928938f98eca088c40cbee4e))

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
