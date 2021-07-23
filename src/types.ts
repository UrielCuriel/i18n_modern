export interface ILocales {
  [key: string]: ILocales | string | undefined | null;
}

export interface IFormatParam {
  [x: string]: string | number | boolean | Date;
}
