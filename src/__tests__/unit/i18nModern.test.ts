import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { I18nModern } from "../../index";
import { startServer, stopServer } from "../fixtures/es_server";
import { en } from "../fixtures/en";

describe("I18nModern", () => {
  const values = { name: "Uriel", age: 25 };

  beforeAll(async () => {
    await startServer();
  });

  afterAll(async () => {
    await stopServer();
  });

  it("i18n constructor", () => {
    const i18n = new I18nModern("en-US");
    expect(i18n).toBeDefined();
    expect(i18n.defaultLocale).toBe("en-US");
  });

  it("i18n loadFromValue", () => {
    const i18n = new I18nModern("en-US");
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
    const i18n = new I18nModern("en-US");
    i18n.loadFromValue(en, "en-US");
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

  it("i18n static keys combined with conditionals - notificationsCount", () => {
    const i18n = new I18nModern("en-US");
    i18n.loadFromValue(en, "en-US");

    // Test static key "0"
    expect(
      i18n.get("notificationsCount", { values: { notificationsCount: 0 } })
    ).toBe("You have no notifications");

    // Test static key "1"
    expect(
      i18n.get("notificationsCount", { values: { notificationsCount: 1 } })
    ).toBe("You have one notification");

    // Test conditional range [2-10]
    expect(
      i18n.get("notificationsCount", { values: { notificationsCount: 2 } })
    ).toBe("You have 2 notifications");

    expect(
      i18n.get("notificationsCount", { values: { notificationsCount: 5 } })
    ).toBe("You have 5 notifications");

    expect(
      i18n.get("notificationsCount", { values: { notificationsCount: 10 } })
    ).toBe("You have 10 notifications");

    // Test conditional > 10
    expect(
      i18n.get("notificationsCount", { values: { notificationsCount: 11 } })
    ).toBe("You have many notifications");

    expect(
      i18n.get("notificationsCount", { values: { notificationsCount: 100 } })
    ).toBe("You have many notifications");
  });

  it("i18n static keys combined with conditionals - Spanish locale", async () => {
    const i18n = new I18nModern("en-US");
    i18n.loadFromValue(en, "en-US");
    i18n.loadFromUrl("http://localhost:3710/es.json", "es-MX");
    await i18n.ready;

    // Test static key "0" in Spanish
    expect(
      i18n.get("notificationsCount", {
        locale: "es-MX",
        values: { notificationsCount: 0 },
      })
    ).toBe("No tienes notificaciones");

    // Test static key "1" in Spanish
    expect(
      i18n.get("notificationsCount", {
        locale: "es-MX",
        values: { notificationsCount: 1 },
      })
    ).toBe("Tienes una notificación");

    // Test conditional range [2-10] in Spanish
    expect(
      i18n.get("notificationsCount", {
        locale: "es-MX",
        values: { notificationsCount: 3 },
      })
    ).toBe("Tienes 3 notificaciones");

    expect(
      i18n.get("notificationsCount", {
        locale: "es-MX",
        values: { notificationsCount: 7 },
      })
    ).toBe("Tienes 7 notificaciones");

    // Test conditional > 10 in Spanish
    expect(
      i18n.get("notificationsCount", {
        locale: "es-MX",
        values: { notificationsCount: 15 },
      })
    ).toBe("Tienes muchas notificaciones");
  });

  it("i18n static string keys", () => {
    const i18n = new I18nModern("en-US");
    i18n.loadFromValue(en, "en-US");

    // Test static string keys
    expect(i18n.get("status", { values: { status: "active" } })).toBe(
      "Your account is active"
    );

    expect(i18n.get("status", { values: { status: "inactive" } })).toBe(
      "Your account is inactive"
    );

    expect(i18n.get("status", { values: { status: "pending" } })).toBe(
      "Your account is pending approval"
    );
  });

  it("i18n static boolean keys", () => {
    const i18n = new I18nModern("en-US");
    i18n.loadFromValue(en, "en-US");

    // Test static boolean keys
    expect(i18n.get("premium", { values: { premium: true } })).toBe(
      "You have premium access"
    );

    expect(i18n.get("premium", { values: { premium: false } })).toBe(
      "Upgrade to premium"
    );
  });

  it("i18n static keys with Spanish locale", async () => {
    const i18n = new I18nModern("en-US");
    i18n.loadFromValue(en, "en-US");
    i18n.loadFromUrl("http://localhost:3710/es.json", "es-MX");
    await i18n.ready;

    // Test static string keys in Spanish
    expect(
      i18n.get("status", { locale: "es-MX", values: { status: "active" } })
    ).toBe("Tu cuenta está activa");

    expect(
      i18n.get("status", { locale: "es-MX", values: { status: "inactive" } })
    ).toBe("Tu cuenta está inactiva");

    // Test static boolean keys in Spanish
    expect(
      i18n.get("premium", { locale: "es-MX", values: { premium: true } })
    ).toBe("Tienes acceso premium");

    expect(
      i18n.get("premium", { locale: "es-MX", values: { premium: false } })
    ).toBe("Actualiza a premium");
  });
});
