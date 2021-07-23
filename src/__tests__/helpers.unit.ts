import { expect } from "chai";
import { evalKey, formatValue, getDeepValue } from "../helpers";

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

  it("evalKey", () => {
    expect(evalKey("[name]", values)).to.equal(true);
    expect(evalKey("[age] >= 25", values)).to.equal(true);
    expect(evalKey("[age] < 25", values)).to.equal(false);
  });
});
