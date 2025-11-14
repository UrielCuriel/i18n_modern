/**
 * Module to get translation from a locales variable
 * @author: Uriel Curiel <urielcuriel@outlook.com>
 */
import { evalKey, formatValue, getDeepValue, mergeDeep } from "./helpers";
import type { IFormatParam, ILocales } from "./types";
/**
 * @description: Gets the translation from a locales variable
 * @param {string} defaultLocale - The default locale
 * @param {ILocales} locales - The locales variable
 */
export class I18nModern {
  #locales: ILocales = {};
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

  constructor(defaultLocale: string, locales?: ILocales | string) {
    this.#defaultLocale = defaultLocale;
    if (typeof locales === "string") {
      this.ready = this.loadFromUrl(locales, defaultLocale);
    } else if (locales) {
      this.loadFromValue(locales, defaultLocale);
    }
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
      this.#locales[localeIdentify] = mergeDeep(
        this.#locales[this.#defaultLocale] ?? {},
        data
      );
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
    this.#locales[localeIdentify] = mergeDeep(
      this.#locales[this.#defaultLocale] ?? {},
      locales
    );
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

    const localeData =
      this.#locales[locale] ?? this.#locales[this.#defaultLocale];
    if (!localeData) {
      console.error(`the locale ${locale} is not defined in locales`);
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
      console.error(`the key ${key} is not defined in locales`);
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
      // First, try to find a static key match if we have a contextKey
      // For example, if contextKey is "notificationsCount" and there's a key "0",
      // we check if values.notificationsCount == 0
      if (values && contextKey) {
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
