import { describe, expect, it } from "bun:test";
import {
  evalKey,
  formatValue,
  getDeepValue,
  isSafeString,
  mergeDeep,
} from "../../helpers";

describe("helpers", () => {
  const values = { name: "Uriel", age: 25 };

  it("getDeepValue", () => {
    expect(getDeepValue({ a: { b: { c: 1 } } }, "a.b.c")).toBe(1);
    expect(getDeepValue({ a: { b: { c: 1 } } }, "a.b.c.d")).toBeUndefined();
    expect(getDeepValue({ a: { b: { c: 1 } } }, "a.b.c.d.e")).toBeUndefined();
  });

  it("formatValue", () => {
    expect(formatValue("Hello [name]!", values)).toBe("Hello Uriel!");
    expect(formatValue("I'm [age] years old!", values)).toBe(
      "I'm 25 years old!"
    );
  });

  it("isSafeString", () => {
    expect(isSafeString("name")).toBe(true);
    expect(isSafeString("[age] >= 25")).toBe(true);
    expect(isSafeString("[age] >= [maxAge]")).toBe(true);
    expect(isSafeString("<script>alert('xss')</script>")).toBe(false);
  });

  it("evalKey", () => {
    expect(evalKey("name", values)).toBe(true);
    expect(evalKey("[age] >= 25", values)).toBe(true);
    expect(evalKey("[age] < 25", values)).toBe(false);
    expect(evalKey("[age] > 10 && [age] < 30", values)).toBe(true);
    expect(evalKey("[age] > 10 || [age] < 30", values)).toBe(true);
  });

  it("mergeDeep", () => {
    const obj = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    const obj2 = {
      a: {
        b: {
          c: 2,
        },
      },
    };
    expect(mergeDeep(obj, obj2)).toEqual({
      a: {
        b: {
          c: 2,
        },
      },
    });
  });
});
