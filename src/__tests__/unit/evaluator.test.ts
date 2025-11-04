import { describe, expect, it } from "bun:test";
import {
  evaluateExpression,
  Tokenizer,
  Parser,
  Evaluator,
  TokenType,
  NodeType,
} from "../../evaluator";

describe("Tokenizer", () => {
  it("should tokenize numbers", () => {
    const tokenizer = new Tokenizer("42");
    const tokens = tokenizer.tokenize();
    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe(42);
  });

  it("should tokenize strings", () => {
    const tokenizer = new Tokenizer('"hello"');
    const tokens = tokenizer.tokenize();
    expect(tokens[0].type).toBe(TokenType.STRING);
    expect(tokens[0].value).toBe("hello");
  });

  it("should tokenize booleans", () => {
    const tokenizer = new Tokenizer("true false");
    const tokens = tokenizer.tokenize();
    expect(tokens[0].type).toBe(TokenType.BOOLEAN);
    expect(tokens[0].value).toBe(true);
    expect(tokens[1].type).toBe(TokenType.BOOLEAN);
    expect(tokens[1].value).toBe(false);
  });

  it("should tokenize identifiers", () => {
    const tokenizer = new Tokenizer("myVar");
    const tokens = tokenizer.tokenize();
    expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[0].value).toBe("myVar");
  });

  it("should tokenize bracketed identifiers", () => {
    const tokenizer = new Tokenizer("[age]");
    const tokens = tokenizer.tokenize();
    expect(tokens[0].type).toBe(TokenType.LEFT_BRACKET);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].value).toBe("age");
    expect(tokens[2].type).toBe(TokenType.RIGHT_BRACKET);
  });

  it("should tokenize comparison operators", () => {
    const tokenizer = new Tokenizer("== != > < >= <=");
    const tokens = tokenizer.tokenize();
    expect(tokens[0].type).toBe(TokenType.EQUAL);
    expect(tokens[1].type).toBe(TokenType.NOT_EQUAL);
    expect(tokens[2].type).toBe(TokenType.GREATER);
    expect(tokens[3].type).toBe(TokenType.LESS);
    expect(tokens[4].type).toBe(TokenType.GREATER_EQUAL);
    expect(tokens[5].type).toBe(TokenType.LESS_EQUAL);
  });

  it("should tokenize logical operators", () => {
    const tokenizer = new Tokenizer("&& ||");
    const tokens = tokenizer.tokenize();
    expect(tokens[0].type).toBe(TokenType.AND);
    expect(tokens[1].type).toBe(TokenType.OR);
  });

  it("should tokenize complete expression", () => {
    const tokenizer = new Tokenizer("[age] >= 18");
    const tokens = tokenizer.tokenize();
    expect(tokens.length).toBe(6); // [, age, ], >=, 18, EOF
    expect(tokens[0].type).toBe(TokenType.LEFT_BRACKET);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[2].type).toBe(TokenType.RIGHT_BRACKET);
    expect(tokens[3].type).toBe(TokenType.GREATER_EQUAL);
    expect(tokens[4].type).toBe(TokenType.NUMBER);
    expect(tokens[5].type).toBe(TokenType.EOF);
  });
});

describe("Parser", () => {
  it("should parse literal number", () => {
    const tokenizer = new Tokenizer("42");
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(ast.type).toBe(NodeType.LITERAL);
    expect((ast as any).value).toBe(42);
  });

  it("should parse identifier", () => {
    const tokenizer = new Tokenizer("name");
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(ast.type).toBe(NodeType.IDENTIFIER);
    expect((ast as any).name).toBe("name");
  });

  it("should parse bracketed identifier", () => {
    const tokenizer = new Tokenizer("[age]");
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(ast.type).toBe(NodeType.IDENTIFIER);
    expect((ast as any).name).toBe("age");
  });

  it("should parse binary comparison", () => {
    const tokenizer = new Tokenizer("[age] >= 18");
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(ast.type).toBe(NodeType.BINARY_OP);
    expect((ast as any).operator).toBe(TokenType.GREATER_EQUAL);
    expect((ast as any).left.type).toBe(NodeType.IDENTIFIER);
    expect((ast as any).right.type).toBe(NodeType.LITERAL);
  });

  it("should parse logical AND", () => {
    const tokenizer = new Tokenizer("[age] > 10 && [age] < 30");
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(ast.type).toBe(NodeType.LOGICAL_OP);
    expect((ast as any).operator).toBe(TokenType.AND);
  });

  it("should parse logical OR", () => {
    const tokenizer = new Tokenizer("[age] < 10 || [age] > 30");
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(ast.type).toBe(NodeType.LOGICAL_OP);
    expect((ast as any).operator).toBe(TokenType.OR);
  });
});

describe("Evaluator", () => {
  it("should evaluate literal values", () => {
    const tokenizer = new Tokenizer("42");
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const evaluator = new Evaluator({});
    expect(evaluator.evaluate(ast)).toBe(42);
  });

  it("should evaluate identifiers from context", () => {
    const tokenizer = new Tokenizer("[name]");
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const evaluator = new Evaluator({ name: "Uriel" });
    expect(evaluator.evaluate(ast)).toBe("Uriel");
  });

  it("should evaluate comparison operators", () => {
    const evaluator = new Evaluator({ age: 25 });

    const testCases = [
      { expr: "[age] >= 18", expected: true },
      { expr: "[age] > 30", expected: false },
      { expr: "[age] <= 25", expected: true },
      { expr: "[age] < 20", expected: false },
      { expr: "[age] == 25", expected: true },
      { expr: "[age] != 30", expected: true },
    ];

    testCases.forEach(({ expr, expected }) => {
      const tokenizer = new Tokenizer(expr);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      expect(evaluator.evaluate(ast)).toBe(expected);
    });
  });

  it("should evaluate logical AND", () => {
    const evaluator = new Evaluator({ age: 25 });
    const tokenizer = new Tokenizer("[age] > 10 && [age] < 30");
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(evaluator.evaluate(ast)).toBe(true);
  });

  it("should evaluate logical OR", () => {
    const evaluator = new Evaluator({ age: 25 });
    const tokenizer = new Tokenizer("[age] < 10 || [age] > 20");
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(evaluator.evaluate(ast)).toBe(true);
  });

  it("should short-circuit AND evaluation", () => {
    const evaluator = new Evaluator({ age: 5 });
    const tokenizer = new Tokenizer("[age] > 10 && [age] < 30");
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(evaluator.evaluate(ast)).toBe(false);
  });

  it("should short-circuit OR evaluation", () => {
    const evaluator = new Evaluator({ age: 25 });
    const tokenizer = new Tokenizer("[age] > 20 || [age] < 10");
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    expect(evaluator.evaluate(ast)).toBe(true);
  });
});

describe("evaluateExpression", () => {
  it("should evaluate simple comparisons", () => {
    expect(evaluateExpression("[age] >= 18", { age: 25 })).toBe(true);
    expect(evaluateExpression("[age] < 18", { age: 25 })).toBe(false);
  });

  it("should evaluate complex logical expressions", () => {
    const values = { age: 25, name: "Uriel" };
    expect(evaluateExpression("[age] > 10 && [age] < 30", values)).toBe(true);
    expect(evaluateExpression("[age] < 10 || [age] > 30", values)).toBe(false);
  });

  it("should handle string comparisons", () => {
    const values = { name: "Uriel" };
    expect(evaluateExpression("[name] == Uriel", values)).toBe(true);
    expect(evaluateExpression('[name] == "Uriel"', values)).toBe(true);
  });

  it("should handle type coercion", () => {
    const values = { age: 25 };
    expect(evaluateExpression('[age] == "25"', values)).toBe(true);
    expect(evaluateExpression("[age] == 25", values)).toBe(true);
  });

  it("should handle missing variables", () => {
    expect(evaluateExpression("[unknown] >= 18", {})).toBe(false);
  });

  it("should handle invalid expressions gracefully", () => {
    expect(evaluateExpression("invalid expression @@", {})).toBe(false);
  });

  it("should handle boolean values", () => {
    const values = { active: true };
    expect(evaluateExpression("[active] == true", values)).toBe(true);
    expect(evaluateExpression("[active] == false", values)).toBe(false);
  });

  it("should work with all test cases from helpers.test.ts", () => {
    const values = { name: "Uriel", age: 25 };
    expect(evaluateExpression("name", values)).toBe("Uriel");
    expect(evaluateExpression("[age] >= 25", values)).toBe(true);
    expect(evaluateExpression("[age] < 25", values)).toBe(false);
    expect(evaluateExpression("[age] > 10 && [age] < 30", values)).toBe(true);
    expect(evaluateExpression("[age] > 10 || [age] < 30", values)).toBe(true);
  });
});
