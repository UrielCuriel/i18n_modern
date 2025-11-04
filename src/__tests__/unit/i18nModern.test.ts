import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { i18nModern } from "../../index";
import { startServer, stopServer } from "../fixtures/es_server";
import { en } from "../fixtures/en";

describe("i18nModern", () => {
  let i18n: i18nModern;
  const values = { name: "Uriel", age: 25 };

  beforeAll(async () => {
    await startServer();
  });

  afterAll(async () => {
    await stopServer();
  });

  it("i18n constructor", () => {
    i18n = new i18nModern("en-US");
    expect(i18n).toBeDefined();
    expect(i18n.defaultLocale).toBe("en-US");
  });

  it("i18n loadFromValue", () => {
    i18n.loadFromValue(en, "en-US");
    expect(i18n.get("home.greetings", { values })).toBe("Hello Uriel");
    expect(i18n.get("profile.greetings", { values })).toBe("Hello Uriel");
    expect(
      i18n.get("profile.greetings", { values: { ...values, gender: "male" } })
    ).toBe("Hello Mr Uriel");
    expect(i18n.get("profile.vote", { values })).toBe(
      "you are old enough to vote"
    );
  });

  it("i18n loadFromUrl", async () => {
    i18n.loadFromUrl("http://localhost:3710/es.json", "es-MX");
    await i18n.ready;
    expect(i18n.get("home.greetings", { locale: "es-MX", values })).toBe(
      "Hola Uriel"
    );
    expect(i18n.get("profile.greetings", { locale: "es-MX", values })).toBe(
      "Hola Uriel"
    );
    expect(
      i18n.get("profile.greetings", {
        locale: "es-MX",
        values: { ...values, gender: "male" },
      })
    ).toBe("Hola Sr Uriel");
    expect(i18n.get("profile.vote", { locale: "es-MX", values })).toBe(
      "Eres lo suficientemente viejo para votar"
    );
    // Expecting fallback to English message since Spanish translation for age 12 is missing
    expect(
      i18n.get("profile.vote", {
        locale: "es-MX",
        values: { ...values, age: 12 },
      })
    ).toBe("you are too young to vote");
  });
});
