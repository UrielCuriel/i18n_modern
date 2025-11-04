# Security Refactor: Custom Expression Evaluator

## Overview

This refactor replaces the unsafe `eval()` function with a custom-built tokenizer, parser, and evaluator for secure expression evaluation in the i18n module.

## Security Problem

The original implementation used JavaScript's `eval()` function to evaluate conditional expressions like:

- `[age] >= 18`
- `[age] > 10 && [age] < 30`

Even with validation via `isSafeString()`, using `eval()` poses significant security risks:

- **Code Injection**: Malicious input could execute arbitrary JavaScript code
- **Access to Scope**: `eval()` has access to the entire execution scope
- **Hard to Audit**: Dynamic code execution is difficult to analyze for security vulnerabilities

## Solution

We implemented a complete expression evaluation system with four components:

### 1. Tokenizer (`Tokenizer` class)

Converts expression strings into tokens:

- **Literals**: numbers (42), strings ("hello"), booleans (true/false)
- **Identifiers**: variable names (age, name) and bracketed variables ([age])
- **Operators**: comparison (==, !=, >, <, >=, <=) and logical (&&, ||)

### 2. Parser (`Parser` class)

Builds an Abstract Syntax Tree (AST) from tokens:

- Handles operator precedence: Comparison > AND > OR
- Creates structured representation of expressions
- Validates syntax during parsing

### 3. AST Node Types

Defines the structure of expressions:

- `LiteralNode`: Constant values (numbers, strings, booleans)
- `IdentifierNode`: Variable references
- `BinaryOpNode`: Comparison operations
- `LogicalOpNode`: Logical AND/OR operations

### 4. Evaluator (`Evaluator` class)

Safely executes the AST:

- Looks up variables from provided context only
- No access to global scope or execution context
- Implements short-circuit evaluation for logical operators
- Handles type coercion safely

## API

### Main Function

```typescript
evaluateExpression(expression: string, context: Record<string, any>): any
```

**Example:**

```typescript
evaluateExpression("[age] >= 18", { age: 25 }); // Returns: true
evaluateExpression("[age] > 10 && [age] < 30", { age: 25 }); // Returns: true
```

## Security Benefits

1. **No Code Execution**: Expressions are parsed and evaluated, never executed as code
2. **Controlled Scope**: Only variables from the provided context are accessible
3. **Input Validation**: Invalid expressions fail gracefully without side effects
4. **Auditability**: Clear, structured code that can be security audited
5. **Type Safety**: TypeScript types provide additional safety guarantees

## Performance

- **Bundle Size**: Increased by ~1KB (14.24 KB → 14.62 KB)
- **Execution Speed**: Comparable to `eval()` for typical expressions
- **Caching**: Existing memoization in `I18nModern` class reduces evaluation frequency

## Supported Features

- Variable substitution: `[variableName]`
- Comparison operators: `==`, `!=`, `>`, `<`, `>=`, `<=`
- Logical operators: `&&`, `||`
- Type coercion: `"25" == 25` evaluates to `true`
- Short-circuit evaluation: `false && anything` evaluates to `false` without evaluating the right side
- Number, string, and boolean literals
- Mixed expressions: `[age] > 10 && [name] == "Uriel"`

## Testing

Comprehensive test suite with 37 tests covering:

- Tokenization of all token types
- Parsing of all expression types
- Evaluation of literals, identifiers, and operations
- Edge cases (missing variables, type coercion, invalid expressions)
- Integration with existing i18n functionality

## Migration

This is a drop-in replacement for the previous implementation:

- **No API changes**: All existing code continues to work
- **No configuration changes**: Uses the same expression syntax
- **Backward compatible**: All existing translations work without modification

## Future Enhancements

Potential improvements that could be added:

- Array membership checking: `[value] in [array]`
- String methods: `[string].includes("substring")`
- Mathematical operations: `[price] * 1.2`
- Parentheses for grouping: `([a] || [b]) && [c]`
