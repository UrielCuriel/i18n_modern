/**
 * Module to get translation from a locales variable
 * @author: Uriel Curiel <urielcurrel@outlook.com>
 */
import axios from "axios";
import { evalKey, formatValue, getDeepValue, mergeDeep } from "./helpers";
import { ILocales, IFormatParam } from "./types";
/**
 * @description: Gets the translation from a locales variable
 * @param {string} defaultLocale - The default locale
 * @param {ILocales} locales - The locales variable
 */
export class i18nModern {
  private _locales: ILocales = {};
  private _defaultLocale!: string;
  private previousTranslations: any = {};
  ready!: Promise<void>;
  constructor(defaultLocale: string, locales?: ILocales | string) {
    this._defaultLocale = defaultLocale;
    if (locales) {
      if (typeof locales === "string") {
        this.loadFromUrl(locales, defaultLocale);
      } else {
        this.loadFromValue(locales, defaultLocale);
      }
    }
  }

  // default locale getter
  get defaultLocale(): string {
    return this._defaultLocale;
  }

  // default locale setter
  set defaultLocale(value: string) {
    this._defaultLocale = value;
  }

  /**
   * function to load a locales from url using axios
   * @param localesUrl: string
   * @param localeIdentify: string
   */
  loadFromUrl(localesUrl: string, localeIdentify: string) {
    this.ready = axios.get(localesUrl).then((response) => {
      this._locales[localeIdentify] = mergeDeep(
        this._locales[this._defaultLocale],
        response.data
      );
    });
  }
  /**
   * function to load a locales from a value
   * @param locales: ILocales
   * @param localeIdentify: string
   */
  loadFromValue(locales: ILocales, localeIdentify: string) {
    this._locales[localeIdentify] = mergeDeep(
      this._locales[this._defaultLocale],
      locales
    );
  }

  /**
   * function to get a translation with memoization from a key and format params
   * @param key:string,
   * @param params:IFormatParam
   * @returns {string}
   */
  get(key: string, params: { locale?: string; values?: IFormatParam }) {
    try {
      params.locale = params.locale ?? this._defaultLocale;
      const previous = JSON.stringify({ key, params });
      if (this.previousTranslations && this.previousTranslations[previous]) {
        return this.previousTranslations[previous];
      } else {
        const translation = getDeepValue(this._locales[params.locale], key);
        this.previousTranslations[previous] = this.getTranslation(
          translation,
          params.values
        );
        return this.previousTranslations[previous];
      }
    } catch (error) {
      console.error(`the key ${key} is not defined in locales`);
    }
  }

  /**
   * function to get a translation from object and formant there
   * @param { Object} translation
   * @param {IFormatParam} params
   * @returns {string}
   */
  getTranslation(
    translation: any,
    values?: IFormatParam,
    defaultTranslation?: string
  ): string {
    if (translation["default"]) defaultTranslation = translation["default"];
    if (typeof translation !== "string") {
      const key = Object.keys(translation).find((key) => evalKey(key, values));

      if (key)
        return this.getTranslation(
          translation[key],
          values,
          defaultTranslation
        );
      return this.getTranslation(
        defaultTranslation,
        values,
        defaultTranslation
      );
    }
    return formatValue(translation, values);
  }
}
