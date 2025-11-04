import { bench, run } from "mitata";
import { evaluateExpression } from "../evaluator";

// ============================================
// SUITE DE CASOS DE USO REALISTAS
// ============================================

// 1. CASOS SIMPLES (Lo que probablemente usan)
const simpleCases = [
  { expr: "[age] >= 18", ctx: { age: 25 }, name: "Comparación simple" },
  {
    expr: "[status] == 'active'",
    ctx: { status: "active" },
    name: "Igualdad string",
  },
  { expr: "[count] > 0", ctx: { count: 42 }, name: "Mayor que" },
];

// 2. CASOS COMPLEJOS (Expresiones más realistas)
const complexCases = [
  {
    expr: "[age] >= 18 && [status] == 'active'",
    ctx: { age: 25, status: "active" },
    name: "AND con 2 condiciones",
  },
  {
    expr: "[role] == 'admin' || [role] == 'moderator'",
    ctx: { role: "admin" },
    name: "OR con 2 condiciones",
  },
  {
    expr: "[age] >= 18 && [status] == 'active' && [verified] == true",
    ctx: { age: 25, status: "active", verified: true },
    name: "AND con 3 condiciones",
  },
  {
    expr: "([age] >= 18 && [status] == 'active') || [admin] == true",
    ctx: { age: 15, status: "inactive", admin: true },
    name: "AND/OR combinado",
  },
];

// 3. CASOS EDGE (Límites y casos especiales)
const edgeCases = [
  {
    expr: "[value] == null",
    ctx: { value: null },
    name: "Null check",
  },
  {
    expr: "[value] == undefined",
    ctx: { value: undefined },
    name: "Undefined check",
  },
  {
    expr: "[text] == ''",
    ctx: { text: "" },
    name: "Empty string",
  },
  {
    expr: "[num] == 0",
    ctx: { num: 0 },
    name: "Zero value",
  },
];

// 4. CASOS CON MUCHAS VARIABLES
const manyVarCase = {
  expr: "[a] > 5 && [b] < 10 && [c] == 'test' && [d] >= 1 && [e] != 'skip'",
  ctx: { a: 7, b: 8, c: "test", d: 1, e: "process" },
  name: "Muchas variables (5)",
};

// 5. COMPARACIÓN CON NATIVE EVAL PARA CADA CASO
function createNativeEvalBench(expr: string, ctx: Record<string, any>) {
  return () => {
    const keys = Object.keys(ctx);
    const values = Object.values(ctx);
    new Function(...keys, `return ${expr}`)(...values);
  };
}

// ============================================
// BENCHMARKS
// ============================================

console.log("📊 BENCHMARK SUITE - Evaluador de Expresiones\n");

// Simple cases
console.log("=== CASOS SIMPLES ===\n");
simpleCases.forEach(({ expr, ctx, name }) => {
  bench(`native eval - ${name}`, createNativeEvalBench(expr, ctx));
  bench(`custom eval - ${name}`, () => evaluateExpression(expr, ctx));
});

// Complex cases
console.log("\n=== CASOS COMPLEJOS ===\n");
complexCases.forEach(({ expr, ctx, name }) => {
  bench(`native eval - ${name}`, createNativeEvalBench(expr, ctx));
  bench(`custom eval - ${name}`, () => evaluateExpression(expr, ctx));
});

// Edge cases
console.log("\n=== CASOS EDGE ===\n");
edgeCases.forEach(({ expr, ctx, name }) => {
  bench(`native eval - ${name}`, createNativeEvalBench(expr, ctx));
  bench(`custom eval - ${name}`, () => evaluateExpression(expr, ctx));
});

// Many variables
console.log("\n=== MUCHAS VARIABLES ===\n");
bench(
  `native eval - ${manyVarCase.name}`,
  createNativeEvalBench(manyVarCase.expr, manyVarCase.ctx)
);
bench(`custom eval - ${manyVarCase.name}`, () =>
  evaluateExpression(manyVarCase.expr, manyVarCase.ctx)
);

// ============================================
// MEMORY & CONSISTENCY TESTS (Opcionales pero útiles)
// ============================================

console.log("\n=== TEST DE CONSISTENCIA ===\n");

const testExpr = "[age] >= 18 && [name] == 'Uriel'";
const testCtx = { age: 25, name: "Uriel" };

// Verificar que ambos dan el mismo resultado
const nativeResult = (() => {
  const keys = Object.keys(testCtx);
  const values = Object.values(testCtx);
  return new Function(...keys, `return ${testExpr}`)(...values);
})();

const customResult = evaluateExpression(testExpr, testCtx);

console.log(`Native eval resultado: ${nativeResult}`);
console.log(`Custom eval resultado: ${customResult}`);
console.log(`✓ Resultados consistentes: ${nativeResult === customResult}\n`);

await run();
