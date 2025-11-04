# Guía de Migración - Breaking Changes

## Versión 2.0.0

### Cambio: Nombre de la clase - `i18nModern` → `I18nModern`

**Tipo:** Breaking Change

#### Descripción

El nombre de la clase principal ha sido actualizado de `i18nModern` (camelCase) a `I18nModern` (PascalCase) para seguir las convenciones estándar de nomenclatura de TypeScript/JavaScript para clases.

#### Antes (v1.x)

```typescript
import { i18nModern } from "i18n_modern";

const i18n = new i18nModern("en-US", locales);
```

#### Después (v2.0.0)

```typescript
import { I18nModern } from "i18n_modern";

const i18n = new I18nModern("en-US", locales);
```

#### Impacto

- **Importación:** Cambiar el nombre en la declaración de importación
- **Instanciación:** Cambiar el nombre en todas las instancias de la clase
- **TypeScript:** Si utilizas tipos importados de esta clase, también necesitarán actualizar sus referencias

#### Ejemplos de actualización

**Proyecto Node.js (Backend)**

```typescript
// ❌ ANTES
import { i18nModern } from "i18n_modern";

const i18n = new i18nModern("es", spanishLocales);
const message = i18n.get("home.title");

// ✅ DESPUÉS
import { I18nModern } from "i18n_modern";

const i18n = new I18nModern("es", spanishLocales);
const message = i18n.get("home.title");
```

**Proyecto Frontend (Vue, React, etc.)**

```typescript
// ❌ ANTES
import { i18nModern } from "i18n_modern";

export const i18nInstance = new i18nModern("en-US", enLocales);

// ✅ DESPUÉS
import { I18nModern } from "i18n_modern";

export const i18nInstance = new I18nModern("en-US", enLocales);
```

#### Herramienta de búsqueda y reemplazo

Puedes utilizar la característica de búsqueda y reemplazo (Find & Replace) en tu editor para actualizar automáticamente todas las referencias:

- **Buscar:** `new i18nModern\(`
- **Reemplazar por:** `new I18nModern(`

---

### ¿Por qué este cambio?

1. **Convención estándar:** PascalCase es la convención de nomenclatura recomendada para clases en TypeScript/JavaScript
2. **Mejora de legibilidad:** Hace más claro que se trata de una clase y no de una función o variable
3. **Consistencia con el ecosistema:** Alineado con las prácticas de la comunidad

### Preguntas frecuentes

**P: ¿Hay un alias para la clase antigua?**  
R: No, este es un breaking change intencional. Se recomienda actualizar todas las referencias en tu código.

**P: ¿Cuánto tiempo tengo para migrar?**  
R: Te recomendamos actualizar al momento de actualizar a v2.0.0. La migración es rápida y segura.

**P: ¿Necesito cambiar algo más?**  
R: No, solo el nombre de la clase. Toda la funcionalidad y los métodos siguen siendo los mismos.

---

Para más ayuda, consulta el [README.md](./README.md) o abre un issue en el repositorio.
