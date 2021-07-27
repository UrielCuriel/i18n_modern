# i18n Modern

Module to use localization in your project both backend with node js and frontend with any framework

## Table of content

1 [Installation](#introduction)

2 [Use](#use)

2.1 [Module Instance](#instance)

2.2 [Add a new locale](#add_locale)

2.3 [How to work the module](#work)

2.4 [Get a locale value](#get_locale_value)

## how to install <a id="introduction"></a>

```console
npm install i18n_modern
```

## how to use <a id="use"></a>

the module can have several languages, to load it you can use any of the following methods

### module instance <a id="instance"></a>

loading locale from url

```typescript
import { i18nModern } from "i18n_modern";

const i18n = new i18nModern(
  "en-US", // default locale id
  "localhost:3000/en.json" // url to load the json locale
);
```

loading locale from object

```typescript
import { i18nModern } from "i18n_modern";
import en from "./locales/en";

const i18n = new i18nModern(
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
import { i18nModern } from "i18n_modern";
import en from "./locales/en";

const i18n = new i18nModern(
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
