/**
 * Operators allowed in conditional expressions
 */
export type ConditionalOperator =
  | "=="
  | "==="
  | "!="
  | "!=="
  | ">"
  | ">="
  | "<"
  | "<=";

/**
 * Logical operators for combining conditions
 */
export type LogicalOperator = "&&" | "||";

/**
 * Pattern for conditional keys with expressions like:
 * - "[count] > 5"
 * - "[status] === 'active'"
 * - "[n] >= 2 && [n] <= 10"
 * The pattern matches: [variable] operator value [&& || [variable] operator value]*
 */
export type ConditionalKey = `[${string}]${string}`;

/**
 * Static keys for direct value matching (e.g., "0", "1", "male", "female")
 */
export type StaticKey = string | number;

/**
 * Reserved key for default fallback value
 */
export type DefaultKey = "default";

/**
 * Translation object with conditional expressions and/or static values
 * Examples:
 * {
 *   "0": "No items",
 *   "1": "One item",
 *   "[count] > 1": "[count] items",
 *   "default": "Items"
 * }
 */
export type TranslationObject = {
  [K in DefaultKey]?: string;
} & {
  [key: ConditionalKey | StaticKey]: TranslationValue | undefined;
};

/**
 * Represents a translation value which can be:
 * - A simple string
 * - An object with conditional keys (expressions like "[count] > 5")
 * - An object with static keys (like "0", "1", "2")
 * - A nested structure with more translations
 */
export type TranslationValue = string | TranslationObject;

/**
 * Represents the locales structure where:
 * - Keys are dot-separated paths (e.g., "home.section1.title")
 * - Values can be nested objects or translation values
 */
export type ILocales = {
  [key: string]: TranslationValue | ILocales;
};

export interface IFormatParam {
  [x: string]: string | number | boolean | Date;
}

export interface ILocalesAccessor {
  get: () => ILocales;
  set: (value: ILocales) => void;
}

export interface I18nModernConfig {
  defaultLocale: string;
  locales?: ILocales | string | ILocalesAccessor;
}
