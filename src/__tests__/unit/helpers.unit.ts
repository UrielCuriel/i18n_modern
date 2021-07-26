import { expect } from "chai";
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
    expect(getDeepValue({ a: { b: { c: 1 } } }, "a.b.c")).to.equal(1);
    expect(getDeepValue({ a: { b: { c: 1 } } }, "a.b.c.d")).to.be.undefined;
    expect(getDeepValue({ a: { b: { c: 1 } } }, "a.b.c.d.e")).to.be.undefined;
  });

  it("formatValue", () => {
    expect(formatValue("Hello [name]!", values)).to.equal("Hello Uriel!");
    expect(formatValue("I'm [age] years old!", values)).to.equal(
      "I'm 25 years old!"
    );
  });

  it("isSafeString", () => {
    expect(isSafeString("name")).to.be.true;
    expect(isSafeString("[age] >= 25")).to.be.true;
    expect(isSafeString("[age] >= [maxAge]")).to.be.true;
    expect(isSafeString("<script>alert('xss')</script>")).to.be.false;
  });

  it("evalKey", () => {
    expect(evalKey("name", values)).to.equal(true);
    expect(evalKey("[age] >= 25", values)).to.equal(true);
    expect(evalKey("[age] < 25", values)).to.equal(false);
    expect(evalKey("[age] > 10 && [age] < 30", values)).to.equal(true);
    expect(evalKey("[age] > 10 || [age] < 30", values)).to.equal(true);
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
    expect(mergeDeep(obj, obj2)).to.deep.equal({
      a: {
        b: {
          c: 2,
        },
      },
    });
  });
});
