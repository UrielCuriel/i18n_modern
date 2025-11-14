# i18n Modern

Module to use localization in your project both backend with node js and frontend with any framework

## Table of content

1 [Installation](#introduction)

2 [Use](#use)

2.1 [Module Instance](#instance)

2.2 [Add a new locale](#add_locale)

2.3 [How to work the module](#work)

2.4 [Get a locale value](#get_locale_value)

2.5 [Framework Integration (Vue, Svelte, etc.)](#framework-integration)

3 [Breaking Changes](#breaking-changes)

## Development

This project now uses the [Bun](https://bun.sh/) toolchain for local development. To get started:

```bash
bun install
bun run build
bun test
```

These commands install dependencies, compile the TypeScript sources, and execute the automated test suite respectively.

## how to install <a id="introduction"></a>

```console
npm install i18n_modern
```

## how to use <a id="use"></a>

the module can have several languages, to load it you can use any of the following methods

### module instance <a id="instance"></a>

**New Configuration-based API** (Recommended)

```typescript
import { I18nModern } from "i18n_modern";

// Loading locale from object
const i18n = new I18nModern({
  defaultLocale: "en-US",
  locales: en, // object to load locale
});

// Loading locale from URL
const i18n = new I18nModern({
  defaultLocale: "en-US",
  locales: "localhost:3000/en.json", // url to load the json locale
});
```

**Legacy API** (Still supported for backward compatibility)

loading locale from url

```typescript
import { I18nModern } from "i18n_modern";

const i18n = new I18nModern(
  "en-US", // default locale id
  "localhost:3000/en.json" // url to load the json locale
);
```

loading locale from object

```typescript
import { I18nModern } from "i18n_modern";
import en from "./locales/en";

const i18n = new I18nModern(
  "en-US", // default locale id
  en // object to load locale
);
```

### add locale <a id="add_locale"></a>

to add a locale after instantiating the module, either of these two functions must be used

if it is going to be loaded from a url:

```typescript
...
i18n.loadFromUrl("localhost:3000/en.json", "en-US");
```

if it is going to be loaded from a object:

```typescript
...
i18n.loadFromValue(en, "en-US");
```

### how to work the module <a id="work"></a>

this library has two peculiarities, the first is that it uses dot keys for example `'home.section1.tittle'` this corresponds to the following structure of a json

```json
{
  "home": {
    "section1": {
      "tittle": "Home Section 1"
    }
  }
}
```

and the second is that locales can have keys assertions for example

```json
{
  "notificationsCount": {
    "0": "You have no notifications",
    "1": "You have one notification",
    "[notificationsCount] >= 2 && [notificationsCount] <= 10": "You have [notificationsCount] notifications",
    "[notificationsCount] > 10": "You have many notifications"
  }
}
```

to use the substitution of variables both in the key and in the values are placed between brackets `[]`

### getting a locale value <a id="get_locale_value"></a>

the module have a `get` method that can be used to get a locale value, the method takes two parameters, the first is a key and the second is the options object that include the locale id as `locale` and de data to be used as `values`

`locales/en.json`

```json
{
  "notificationsCount": {
    "0": "You have no notifications",
    "1": "You have one notification",
    "[notificationsCount] >= 2 && [notificationsCount] <= 10": "You have [notificationsCount] notifications",
    "[notificationsCount] > 10": "You have many notifications"
  }
}
```

`app.ts`

```typescript
import { I18nModern } from "i18n_modern";
import en from "./locales/en";

const i18n = new I18nModern(
  "en-US", // default locale id
  en // object to load locale
);

const notificationsCount = i18n.get("notificationsCount", {
  locale: "en-US",
  values: {
    notificationsCount: 10,
  },
});
// notificationsCount: You have many notifications
```

### Framework Integration (Vue, Svelte, etc.) <a id="framework-integration"></a>

`i18n_modern` is framework-agnostic and can integrate with reactive systems from Vue, Svelte, Solid.js, and other frameworks by providing custom getter/setter functions for the locales storage.

#### Vue 3 Integration (Composition API)

```typescript
import { ref } from "vue";
import { I18nModern } from "i18n_modern";
import type { ILocales } from "i18n_modern";

// Create a reactive ref for locales
const locales = ref<ILocales>({});

// Initialize i18n with custom getter/setter
const i18n = new I18nModern({
  defaultLocale: "en-US",
  locales: {
    get: () => locales.value,
    set: (newLocales) => {
      locales.value = newLocales;
    },
  },
});

// Load locales - this will update the reactive ref
i18n.loadFromValue(en, "en-US");

// Now locales.value is reactive and any changes will trigger Vue's reactivity
```

#### Svelte Integration

```typescript
import { writable } from "svelte/store";
import { I18nModern } from "i18n_modern";
import type { ILocales } from "i18n_modern";

// Create a writable store for locales
const locales = writable<ILocales>({});

// Initialize i18n with custom getter/setter
const i18n = new I18nModern({
  defaultLocale: "en-US",
  locales: {
    get: () => {
      let value: ILocales = {};
      locales.subscribe((v) => (value = v))();
      return value;
    },
    set: (newLocales) => {
      locales.set(newLocales);
    },
  },
});

// Load locales - this will update the store
i18n.loadFromValue(en, "en-US");
```

#### Solid.js Integration

```typescript
import { createSignal } from "solid-js";
import { I18nModern } from "i18n_modern";
import type { ILocales } from "i18n_modern";

// Create a signal for locales
const [locales, setLocales] = createSignal<ILocales>({});

// Initialize i18n with custom getter/setter
const i18n = new I18nModern({
  defaultLocale: "en-US",
  locales: {
    get: () => locales(),
    set: (newLocales) => {
      setLocales(newLocales);
    },
  },
});

// Load locales - this will update the signal
i18n.loadFromValue(en, "en-US");
```

#### Plain JavaScript (No Framework)

For applications that don't use a reactive framework, you can simply pass a plain object:

```typescript
import { I18nModern } from "i18n_modern";

const i18n = new I18nModern({
  defaultLocale: "en-US",
  locales: {}, // Plain object
});

// Or use the legacy API
const i18n = new I18nModern("en-US", en);
```

## Breaking Changes <a id="breaking-changes"></a>

### Version 2.0.0

The main class has been renamed from `i18nModern` to `I18nModern` to follow TypeScript/JavaScript PascalCase convention for classes.

**Migration Required:** Update all imports and instantiations from `new i18nModern()` to `new I18nModern()`.

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions and examples.
