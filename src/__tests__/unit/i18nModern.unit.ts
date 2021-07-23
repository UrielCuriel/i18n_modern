import { expect } from "chai";
import { i18nModern } from "../..";
import "../fixtures/es_server";
import { en } from "../fixtures/en";
describe("i18nModern", async () => {
  let i18n: i18nModern;
  const values = { name: "Uriel", age: 25 };
  it("i18n constructor", () => {
    i18n = new i18nModern("en-US");
    expect(i18n).to.be.ok;
    expect(i18n.defaultLocale).to.equal("en-US");
  });

  it("i18n loadFromValue", () => {
    i18n.loadFromValue(en, "en-US");
    expect(i18n.get("home.greetings", { values })).to.equal("Hello Uriel");
    expect(i18n.get("profile.greetings", { values })).to.equal("Hello Uriel");
    expect(
      i18n.get("profile.greetings", { values: { ...values, gender: "male" } })
    ).to.equal("Hello Mr Uriel");
    expect(i18n.get("profile.vote", { values })).to.equal(
      "you are old enough to vote"
    );
  });

  it("i18n loadFromUrl", async () => {
    i18n.loadFromUrl("http://localhost:3710/es.json", "es-MX");
    await i18n.ready;
    expect(i18n.get("home.greetings", { locale: "es-MX", values })).to.equal(
      "Hola Uriel"
    );
    expect(i18n.get("profile.greetings", { locale: "es-MX", values })).to.equal(
      "Hola Uriel"
    );
    expect(
      i18n.get("profile.greetings", {
        locale: "es-MX",
        values: { ...values, gender: "male" },
      })
    ).to.equal("Hola Sr Uriel");
    expect(i18n.get("profile.vote", { locale: "es-MX", values })).to.equal(
      "Eres lo suficientemente viejo para votar"
    );
    expect(
      i18n.get("profile.vote", {
        locale: "es-MX",
        values: { ...values, age: 12 },
      })
    ).to.equal("you are too young to vote");
  });
});
