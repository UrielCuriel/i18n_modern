/**
 * function to get value from deep object
 * @param {object} obj - object to get value from
 * @param {string} path - path to object
 * @returns {any}
 */
export function getDeepValue(obj: any, path: string): any {
  if (path.indexOf(".") === -1) {
    return obj[path];
  }
  const keys = path.split(".");
  let value = obj;

  keys.forEach((key) => {
    if (value?.hasOwnProperty(key)) value = value[key];
    else {
      value = undefined;
      return;
    }
  });
  return value;
}

/**
 * function to eval a key object string
 * @param {string} key - object to eval
 * @param {object} values - object to eval key against
 * @returns {boolean}
 */
export function evalKey(key: string, values?: object): boolean {
  if (!isSafeString(key)) {
    console.error("evalKey: key is not a safe string");
    return false;
  }
  const logicalOperatorsJsList = ["==", "!=", ">", "<", ">=", "<="];
  key = formatValue(key, values);
  //check if key include an operator
  if (logicalOperatorsJsList.some((logical) => key.includes(logical))) {
    return eval(key);
  } else {
    if (values)
      return (
        Object.keys(values).includes(key) || Object.values(values).includes(key)
      );
    return false;
  }
}

/**
 * function to replace [value] in string with regular expression
 * @param {string} str - string to replace
 * @param {object} value - value to replace
 * @returns {string}
 */
export function formatValue(str: string, value: any): string {
  return str.replace(/\[(.*?)\]/g, (a, b) => {
    return Object.prototype.hasOwnProperty.call(value, b) &&
      value[b] !== null &&
      value[b] !== undefined
      ? value[b]
      : a;
  });
}

/**
 * function to validate that the string does not include javascript reserved words
 * @param {string} str - string to validate
 * @returns {boolean}
 */
export function isSafeString(str: string): boolean {
  const reservedWords = [
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "delete",
    "do",
    "else",
    "enum",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "function",
    "if",
    "implements",
    "import",
    "in",
    "instanceof",
    "interface",
    "let",
    "new",
    "null",
    "package",
    "private",
    "protected",
    "public",
    "return",
    "static",
    "super",
    "switch",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "alert",
    "console",
    "script",
  ];
  const regexValidExpression =
    /^(?:\[?(\d+|\w+)\]?)+(?:(?:\s?)+(?:[\>\=\!\<]+)+(?:\s?)+(?:\[?(\d+|\w+)\]?))?$/g;
  return (
    regexValidExpression.test(str) &&
    reservedWords.every((word) => !str.includes(word))
  );
}

/**
 * function to merge deep objects
 * @params {object} obj1 - object to merge
 * @params {object} obj2 - object to merge
 * @returns {object}
 */
export function mergeDeep(obj1: any, obj2: any): any {
  const obj3: any = {};
  if (obj1)
    Object.keys(obj1).forEach((key) => {
      obj3[key] = obj1[key];
    });
  Object.keys(obj2).forEach((key) => {
    if (typeof obj2[key] === "object") {
      if (typeof obj3[key] === "object") {
        obj3[key] = mergeDeep(obj3[key], obj2[key]);
      } else {
        obj3[key] = obj2[key];
      }
    } else {
      obj3[key] = obj2[key];
    }
  });
  return obj3;
}
