import { bench, run, group } from "mitata";
import { I18nModern } from "../index";
import { clearExpressionCache } from "../evaluator";

// ============================================
// FIXTURE DE LOCALES REALISTAS
// ============================================

const testLocales = {
  // Traducciones simples (sin evaluación)
  simple: {
    hello: "Hello",
    welcome: "Welcome [name]",
    goodbye: "Goodbye [name]",
  },

  // Traducciones con evaluación (usan el evaluador)
  conditional: {
    age_check: {
      "[age] >= 18": "You are an adult",
      "[age] < 18": "You are a minor",
    },
    status_check: {
      "[status] == 'active'": "Account is active",
      "[status] == 'inactive'": "Account is inactive",
      default: "Unknown status",
    },
    complex_check: {
      "[age] >= 18 && [verified] == true": "Verified adult user",
      "[age] >= 18 && [verified] == false": "Unverified adult user",
      "[age] < 18": "Minor user",
    },
    role_based: {
      "[role] == 'admin' || [role] == 'moderator'": "Staff member",
      "[role] == 'user'": "Regular user",
      default: "Guest",
    },
  },

  // Traducciones anidadas con múltiples niveles
  profile: {
    greeting: {
      default: "Hello [name]",
      gender: {
        male: {
          "[age] >= 18": "Hello Mr [name]",
          "[age] < 18": "Hello [name]",
        },
        female: {
          "[age] >= 18": "Hello Ms [name]",
          "[age] < 18": "Hello [name]",
        },
      },
    },
    permissions: {
      "[role] == 'admin'": "Full access",
      "[role] == 'user' && [verified] == true": "Standard access",
      "[role] == 'user' && [verified] == false": "Limited access",
      default: "No access",
    },
  },
};

// ============================================
// CASOS DE PRUEBA
// ============================================

const testCases = {
  simple: [
    {
      name: "Simple static text",
      key: "simple.hello",
      values: {} as Record<string, string | number | boolean>,
    },
    {
      name: "Simple interpolation",
      key: "simple.welcome",
      values: { name: "John" } as Record<string, string | number | boolean>,
    },
  ],

  conditional: [
    {
      name: "Single condition - adult",
      key: "conditional.age_check",
      values: { age: 25 } as Record<string, string | number | boolean>,
    },
    {
      name: "Single condition - minor",
      key: "conditional.age_check",
      values: { age: 15 } as Record<string, string | number | boolean>,
    },
    {
      name: "Status check - active",
      key: "conditional.status_check",
      values: { status: "active" } as Record<string, string | number | boolean>,
    },
    {
      name: "Complex AND condition",
      key: "conditional.complex_check",
      values: { age: 25, verified: true } as Record<
        string,
        string | number | boolean
      >,
    },
    {
      name: "Complex OR condition",
      key: "conditional.role_based",
      values: { role: "admin" } as Record<string, string | number | boolean>,
    },
  ],

  nested: [
    {
      name: "Nested with evaluation",
      key: "profile.greeting",
      values: { name: "Jane", gender: "female", age: 25 } as Record<
        string,
        string | number | boolean
      >,
    },
    {
      name: "Deep nested with multiple conditions",
      key: "profile.permissions",
      values: { role: "user", verified: true } as Record<
        string,
        string | number | boolean
      >,
    },
  ],
};

// ============================================
// BENCHMARKS
// ============================================

console.log("📊 I18nModern - Benchmark Completo\n");
console.log("Objetivo: Medir el impacto del cacheo de AST en evaluaciones\n");

// ============================================
// GRUPO 1: TRADUCCIONES SIMPLES (baseline)
// ============================================

group("1️⃣ Traducciones Simples (sin evaluación)", () => {
  const i18n = new I18nModern("en");
  i18n.loadFromValue(testLocales, "en");

  testCases.simple.forEach(({ name, key, values }) => {
    bench(name, () => {
      i18n.get(key, { values });
    });
  });
});

// ============================================
// GRUPO 2: TRADUCCIONES CON EVALUACIÓN (primera vez)
// ============================================

group(
  "2️⃣ Traducciones con Evaluación - Primera llamada (sin cache AST)",
  () => {
    testCases.conditional.forEach(({ name, key, values }) => {
      bench(name, () => {
        clearExpressionCache(); // Limpia cache para simular primera llamada
        const i18n = new I18nModern("en");
        i18n.loadFromValue(testLocales, "en");
        i18n.get(key, { values });
      });
    });
  }
);

// ============================================
// GRUPO 3: TRADUCCIONES CON EVALUACIÓN (con cache)
// ============================================

group(
  "3️⃣ Traducciones con Evaluación - Con cache AST (llamadas subsecuentes)",
  () => {
    const i18n = new I18nModern("en");
    i18n.loadFromValue(testLocales, "en");

    // Pre-calentamiento: ejecutar una vez para popular el cache
    testCases.conditional.forEach(({ key, values }) => {
      i18n.get(key, { values });
    });

    testCases.conditional.forEach(({ name, key, values }) => {
      bench(name, () => {
        i18n.get(key, { values });
      });
    });
  }
);

// ============================================
// GRUPO 4: COMPARACIÓN DIRECTA - CACHE vs NO CACHE
// ============================================

group("4️⃣ Comparación: Impacto del Cache AST", () => {
  const complexKey = "conditional.complex_check";
  const complexValues = { age: 25, verified: true } as Record<
    string,
    string | number | boolean
  >;

  bench("❌ SIN cache AST (recrea cada vez)", () => {
    clearExpressionCache();
    const i18n = new I18nModern("en");
    i18n.loadFromValue(testLocales, "en");
    i18n.get(complexKey, { values: complexValues });
  });

  bench("✅ CON cache AST (reutiliza)", () => {
    const i18n = new I18nModern("en");
    i18n.loadFromValue(testLocales, "en");
    // Pre-calentamiento
    i18n.get(complexKey, { values: complexValues });

    return () => {
      i18n.get(complexKey, { values: complexValues });
    };
  });
});

// ============================================
// GRUPO 5: TRADUCCIONES ANIDADAS COMPLEJAS
// ============================================

group("5️⃣ Traducciones Anidadas con Múltiples Evaluaciones", () => {
  const i18n = new I18nModern("en");
  i18n.loadFromValue(testLocales, "en");

  testCases.nested.forEach(({ name, key, values }) => {
    bench(name, () => {
      i18n.get(key, { values });
    });
  });
});

// ============================================
// GRUPO 6: STRESS TEST - Mismo key, diferentes valores
// ============================================

group("6️⃣ Stress Test - Evaluación con diferentes valores (mismo AST)", () => {
  const i18n = new I18nModern("en");
  i18n.loadFromValue(testLocales, "en");
  const key = "conditional.age_check";

  // Pre-calentamiento: el AST se cachea una vez
  i18n.get(key, { values: { age: 25 } });

  bench("100 evaluaciones - edades diferentes (AST cacheado)", () => {
    for (let age = 1; age <= 100; age++) {
      i18n.get(key, { values: { age } });
    }
  });
});

// ============================================
// GRUPO 7: CACHE DE TRADUCCIONES (separado del AST)
// ============================================

group("7️⃣ Cache de Traducciones (I18nModern interno)", () => {
  const i18n = new I18nModern("en");
  i18n.loadFromValue(testLocales, "en");
  const key = "conditional.complex_check";
  const values = { age: 25, verified: true } as Record<
    string,
    string | number | boolean
  >;

  bench("Primera llamada (sin cache de traducción)", () => {
    // Crear nueva instancia para evitar cache
    const freshI18n = new I18nModern("en");
    freshI18n.loadFromValue(testLocales, "en");
    freshI18n.get(key, { values });
  });

  bench("Segunda llamada (con cache de traducción)", () => {
    // Pre-calentar
    i18n.get(key, { values });

    return () => {
      i18n.get(key, { values });
    };
  });
});

// ============================================
// GRUPO 8: COMPARACIÓN CON EVAL NATIVO (referencia)
// ============================================

group("8️⃣ Comparación con eval nativo (solo para referencia)", () => {
  const expr = "[age] >= 18 && [verified] == true";
  const values = { age: 25, verified: true } as Record<
    string,
    string | number | boolean
  >;

  bench("eval nativo (inseguro)", () => {
    const keys = Object.keys(values);
    const vals = Object.values(values);
    new Function(...keys, `return ${expr}`)(...vals);
  });

  bench("Custom evaluator CON cache AST", () => {
    const i18n = new I18nModern("en");
    i18n.loadFromValue(testLocales, "en");
    i18n.get("conditional.complex_check", { values });
  });
});

// ============================================
// ANÁLISIS DE MEMORIA (informativo)
// ============================================

console.log("\n=== 📊 ANÁLISIS DE MEMORIA Y RENDIMIENTO ===\n");

const memBefore = (process as any).memoryUsage?.();

// Simular carga de trabajo realista
const i18n = new I18nModern("en");
i18n.loadFromValue(testLocales, "en");
const iterations = 10000;

console.log(`Ejecutando ${iterations} traducciones mixtas...`);

const startTime = performance.now();

for (let i = 0; i < iterations; i++) {
  // Mix de operaciones
  i18n.get("simple.hello");
  i18n.get("simple.welcome", { values: { name: "Test" } });
  i18n.get("conditional.age_check", { values: { age: i % 100 } });
  i18n.get("conditional.complex_check", {
    values: { age: i % 100, verified: i % 2 === 0 },
  });
  i18n.get("profile.permissions", {
    values: { role: i % 2 ? "admin" : "user", verified: true },
  });
}

const endTime = performance.now();
const totalTime = endTime - startTime;

console.log(`✓ Completado en ${totalTime.toFixed(2)}ms`);
console.log(
  `✓ Promedio por operación: ${(totalTime / (iterations * 5)).toFixed(4)}ms`
);

if (memBefore && (process as any).memoryUsage) {
  const memAfter = (process as any).memoryUsage();
  const heapDiff = (
    (memAfter.heapUsed - memBefore.heapUsed) /
    1024 /
    1024
  ).toFixed(2);
  console.log(`✓ Uso de memoria heap: ${heapDiff}MB`);
}

console.log("\n=== 🎯 CONCLUSIONES ESPERADAS ===\n");
console.log(
  "1. Las traducciones simples son más rápidas (no requieren evaluación)"
);
console.log(
  "2. El cache AST mejora significativamente las llamadas subsecuentes"
);
console.log("3. Las expresiones complejas se benefician más del cacheo");
console.log(
  "4. El cache de traducciones de I18nModern añade otra capa de optimización"
);
console.log(
  "5. El evaluador custom es competitivo con eval() pero más seguro\n"
);

await run();
