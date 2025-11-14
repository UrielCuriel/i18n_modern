declare const BUILD_VERSION: string;
/**
 * Module to get translation from a locales variable
 * @author: Uriel Curiel <urielcuriel@outlook.com>
 */
import {
  evalKey,
  formatValue,
  getDeepValue,
  isDevelopmentMode,
  mergeDeep,
} from "./helpers";
import type {
  IFormatParam,
  ILocales,
  I18nModernConfig,
  ILocalesAccessor,
} from "./types";
/**
 * @description: Gets the translation from a locales variable
 * @param {string} defaultLocale - The default locale
 * @param {ILocales} locales - The locales variable
 */
export class I18nModern {
  #internalLocales: ILocales = {};
  #localesGetter: () => ILocales;
  #localesSetter: (value: ILocales) => void;
  #defaultLocale: string;
  #previousTranslations = new Map<string, string>();
  static readonly MAX_CACHE_SIZE = 500;

  private setCache(key: string, value: string) {
    if (this.#previousTranslations.has(key)) {
      this.#previousTranslations.delete(key);
    }
    if (this.#previousTranslations.size >= I18nModern.MAX_CACHE_SIZE) {
      // Remove the oldest entry (first inserted)
      const oldestKey = this.#previousTranslations.keys().next().value;
      if (oldestKey) {
        this.#previousTranslations.delete(oldestKey);
      }
    }
    this.#previousTranslations.set(key, value);
  }
  ready: Promise<void> = Promise.resolve();

  constructor(
    defaultLocale: string | I18nModernConfig,
    locales?: ILocales | string
  ) {
    // Support both old API and new config-based API
    if (typeof defaultLocale === "string") {
      // Old API: new I18nModern(defaultLocale, locales)
      this.#defaultLocale = defaultLocale;
      this.#localesGetter = () => this.#internalLocales;
      this.#localesSetter = (value: ILocales) => {
        this.#internalLocales = value;
      };

      if (typeof locales === "string") {
        this.ready = this.loadFromUrl(locales, defaultLocale);
      } else if (locales) {
        this.loadFromValue(locales, defaultLocale);
      }
    } else {
      // New API: new I18nModern({ defaultLocale, locales })
      const config = defaultLocale as I18nModernConfig;
      this.#defaultLocale = config.defaultLocale;

      // Check if locales is provided with custom getter/setter
      if (
        config.locales &&
        typeof config.locales === "object" &&
        "get" in config.locales &&
        "set" in config.locales
      ) {
        const accessor = config.locales as ILocalesAccessor;
        this.#localesGetter = accessor.get;
        this.#localesSetter = accessor.set;
      } else {
        // Use internal storage
        this.#localesGetter = () => this.#internalLocales;
        this.#localesSetter = (value: ILocales) => {
          this.#internalLocales = value;
        };

        if (typeof config.locales === "string") {
          this.ready = this.loadFromUrl(config.locales, config.defaultLocale);
        } else if (config.locales) {
          this.loadFromValue(config.locales as ILocales, config.defaultLocale);
        }
      }
    }
  }

  //get version
  static get version(): string {
    return BUILD_VERSION;
  }

  // default locale getter
  get defaultLocale(): string {
    return this.#defaultLocale;
  }

  // default locale setter
  set defaultLocale(value: string) {
    this.#defaultLocale = value;
  }

  /**
   * function to load a locales from url using fetch
   * @param localesUrl: string
   * @param localeIdentify: string
   */
  loadFromUrl(localesUrl: string, localeIdentify: string): Promise<void> {
    const readyPromise = (async () => {
      const response = await globalThis.fetch(localesUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to load locales from ${localesUrl}: ${response.status} ${response.statusText}`
        );
      }
      const data = (await response.json()) as ILocales;
      const currentLocales = this.#localesGetter();
      const updatedLocales = {
        ...currentLocales,
        [localeIdentify]: mergeDeep(
          currentLocales[this.#defaultLocale] ?? {},
          data
        ),
      };
      this.#localesSetter(updatedLocales);
    })();

    this.ready = readyPromise;
    return readyPromise;
  }
  /**
   * function to load a locales from a value
   * @param locales: ILocales
   * @param localeIdentify: string
   */
  loadFromValue(locales: ILocales, localeIdentify: string) {
    const currentLocales = this.#localesGetter();
    const updatedLocales = {
      ...currentLocales,
      [localeIdentify]: mergeDeep(
        currentLocales[this.#defaultLocale] ?? {},
        locales
      ),
    };
    this.#localesSetter(updatedLocales);
    this.ready = Promise.resolve();
  }

  /**
   * function to get a translation with memoization from a key and format params
   * @param key:string,
   * @param params:IFormatParam
   * @returns {string}
   */
  get(
    key: string,
    params: { locale?: string; values?: IFormatParam } = {}
  ): string {
    const { locale = this.#defaultLocale, values } = params;
    // Create a deterministic cache key to avoid issues with JSON.stringify
    // property ordering and to handle edge cases like functions or circular references
    const cacheKey = `${key}:${locale}:${values ? JSON.stringify(values) : ""}`;
    const cached = this.#previousTranslations.get(cacheKey);
    if (cached) {
      return cached;
    }

    const currentLocales = this.#localesGetter();
    const localeData =
      currentLocales[locale] ?? currentLocales[this.#defaultLocale];
    if (!localeData) {
      if (isDevelopmentMode()) {
        console.error(`the locale ${locale} is not defined in locales`);
      }
      return "";
    }

    const translation = getDeepValue(localeData, key);
    // Extract the last part of the key path to use as context for static key matching
    const keyParts = key.split(".");
    const contextKey = keyParts[keyParts.length - 1];
    const resolved = this.getTranslation(
      translation,
      values,
      undefined,
      contextKey
    );

    if (typeof resolved === "string") {
      this.setCache(cacheKey, resolved);
      return resolved;
    } else {
      if (isDevelopmentMode()) {
        console.warn(
          `the key ${key} is not defined in locales, this warning is shown only in development mode`
        );
      }
      return "";
    }
  }

  /**
   * function to get a translation from object and formant there
   * @param { Object} translation
   * @param {IFormatParam} params
   * @param {string} defaultTranslation
   * @param {string} contextKey - The key name to use for static value matching
   * @returns {string}
   */
  getTranslation(
    translation: any,
    values?: IFormatParam,
    defaultTranslation?: string,
    contextKey?: string
  ): string | undefined {
    if (typeof translation === "string") {
      return formatValue(translation, values);
    }

    const fallback =
      typeof translation?.default === "string"
        ? translation.default
        : defaultTranslation;

    if (translation && typeof translation === "object") {
      // First, try to find a static key match
      // Strategy 1: If we have a contextKey, try to match with values[contextKey]
      // Strategy 2: Try to match with any value in the values object
      if (values) {
        // Strategy 1: Try contextKey first (for simple cases like notificationsCount)
        if (contextKey) {
          const contextValue = values[contextKey];
          if (contextValue !== undefined && contextValue !== null) {
            const staticKey = String(contextValue);
            if (
              translation.hasOwnProperty(staticKey) &&
              staticKey !== "default"
            ) {
              return this.getTranslation(
                translation[staticKey],
                values,
                fallback,
                undefined
              );
            }
          }
        }

        // Strategy 2: Try any value in values object (for nested cases like pagination.selected)
        for (const [valueKey, value] of Object.entries(values)) {
          if (value !== undefined && value !== null) {
            const staticKey = String(value);
            if (
              translation.hasOwnProperty(staticKey) &&
              staticKey !== "default"
            ) {
              return this.getTranslation(
                translation[staticKey],
                values,
                fallback,
                undefined
              );
            }
          }
        }
      }

      // Then, try conditional keys
      const key = Object.keys(translation).find(
        (candidate) => candidate !== "default" && evalKey(candidate, values)
      );

      if (key) {
        return this.getTranslation(
          translation[key],
          values,
          fallback,
          undefined
        );
      }
    }

    if (typeof fallback === "string") {
      return this.getTranslation(fallback, values, fallback, undefined);
    }

    return undefined;
  }
}
