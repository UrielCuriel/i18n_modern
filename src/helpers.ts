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
  const logicalOperatorsJsList = ["==", "!=", ">", "<", ">=", "<="];
  key = formatValue(key, values);
  //check if key include an operator
  if (logicalOperatorsJsList.some((logical) => key.includes(logical))) {
    return eval(key);
  } else {
    return true;
  }
}

/**
 * function to replace [value] in string with regular expression
 * @param {string} str - string to replace
 * @param {object} value - value to replace
 * @returns {string}
 */
export function formatValue(str: string, value: any): string {
  return str.replace(/\[(.*?)\]/g, (a, b) => value[a]);
}
