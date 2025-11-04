/**
 * Custom expression evaluator for i18n module
 * Replaces eval() with a secure tokenizer, parser, and AST evaluator
 * @author: Uriel Curiel <urielcuriel@outlook.com>
 */

/**
 * Token types for lexical analysis
 */
export enum TokenType {
  NUMBER = "NUMBER",
  STRING = "STRING",
  BOOLEAN = "BOOLEAN",
  IDENTIFIER = "IDENTIFIER",
  LEFT_BRACKET = "LEFT_BRACKET",
  RIGHT_BRACKET = "RIGHT_BRACKET",
  EQUAL = "EQUAL", // ==
  NOT_EQUAL = "NOT_EQUAL", // !=
  GREATER = "GREATER", // >
  GREATER_EQUAL = "GREATER_EQUAL", // >=
  LESS = "LESS", // <
  LESS_EQUAL = "LESS_EQUAL", // <=
  AND = "AND", // &&
  OR = "OR", // ||
  EOF = "EOF",
}

/**
 * Token structure
 */
export interface Token {
  type: TokenType;
  value: string | number | boolean;
  position: number;
}

/**
 * AST Node types
 */
export enum NodeType {
  LITERAL = "LITERAL",
  IDENTIFIER = "IDENTIFIER",
  BINARY_OP = "BINARY_OP",
  LOGICAL_OP = "LOGICAL_OP",
}

/**
 * AST Node base interface
 */
export interface ASTNode {
  type: NodeType;
}

/**
 * Literal node (number, string, boolean)
 */
export interface LiteralNode extends ASTNode {
  type: NodeType.LITERAL;
  value: string | number | boolean;
}

/**
 * Identifier node (variable reference)
 */
export interface IdentifierNode extends ASTNode {
  type: NodeType.IDENTIFIER;
  name: string;
}

/**
 * Binary operation node (comparison operators)
 */
export interface BinaryOpNode extends ASTNode {
  type: NodeType.BINARY_OP;
  operator:
    | TokenType.EQUAL
    | TokenType.NOT_EQUAL
    | TokenType.GREATER
    | TokenType.GREATER_EQUAL
    | TokenType.LESS
    | TokenType.LESS_EQUAL;
  left: ASTNode;
  right: ASTNode;
}

/**
 * Logical operation node (&&, ||)
 */
export interface LogicalOpNode extends ASTNode {
  type: NodeType.LOGICAL_OP;
  operator: TokenType.AND | TokenType.OR;
  left: ASTNode;
  right: ASTNode;
}

/**
 * Tokenizer class - converts expression string into tokens
 */
export class Tokenizer {
  private input: string;
  private position: number = 0;
  private current: string | null = null;

  constructor(input: string) {
    this.input = input.trim();
    this.current = this.input.length > 0 ? this.input[0] : null;
  }

  private advance(): void {
    this.position++;
    this.current =
      this.position < this.input.length ? this.input[this.position] : null;
  }

  private peek(offset: number = 1): string | null {
    const pos = this.position + offset;
    return pos < this.input.length ? this.input[pos] : null;
  }

  private skipWhitespace(): void {
    while (this.current !== null && /\s/.test(this.current)) {
      this.advance();
    }
  }

  private readNumber(): Token {
    const start = this.position;
    let numStr = "";
    while (this.current !== null && /[0-9.]/.test(this.current)) {
      numStr += this.current;
      this.advance();
    }
    return {
      type: TokenType.NUMBER,
      value: parseFloat(numStr),
      position: start,
    };
  }

  private readIdentifier(): Token {
    const start = this.position;
    let identifier = "";
    while (this.current !== null && /[a-zA-Z0-9_]/.test(this.current)) {
      identifier += this.current;
      this.advance();
    }

    // Check for boolean literals
    if (identifier === "true") {
      return { type: TokenType.BOOLEAN, value: true, position: start };
    }
    if (identifier === "false") {
      return { type: TokenType.BOOLEAN, value: false, position: start };
    }

    return {
      type: TokenType.IDENTIFIER,
      value: identifier,
      position: start,
    };
  }

  private readString(quote: string): Token {
    const start = this.position;
    this.advance(); // skip opening quote
    let str = "";
    while (this.current !== null && this.current !== quote) {
      str += this.current;
      this.advance();
    }
    if (this.current === quote) {
      this.advance(); // skip closing quote
    }
    return {
      type: TokenType.STRING,
      value: str,
      position: start,
    };
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.current !== null) {
      this.skipWhitespace();

      if (this.current === null) break;

      // Numbers
      if (/[0-9]/.test(this.current)) {
        tokens.push(this.readNumber());
        continue;
      }

      // Strings
      if (this.current === '"' || this.current === "'") {
        tokens.push(this.readString(this.current));
        continue;
      }

      // Identifiers and keywords
      if (/[a-zA-Z_]/.test(this.current)) {
        tokens.push(this.readIdentifier());
        continue;
      }

      // Brackets
      if (this.current === "[") {
        tokens.push({
          type: TokenType.LEFT_BRACKET,
          value: "[",
          position: this.position,
        });
        this.advance();
        continue;
      }
      if (this.current === "]") {
        tokens.push({
          type: TokenType.RIGHT_BRACKET,
          value: "]",
          position: this.position,
        });
        this.advance();
        continue;
      }

      // Operators
      if (this.current === "=" && this.peek() === "=") {
        tokens.push({
          type: TokenType.EQUAL,
          value: "==",
          position: this.position,
        });
        this.advance();
        this.advance();
        continue;
      }
      if (this.current === "!" && this.peek() === "=") {
        tokens.push({
          type: TokenType.NOT_EQUAL,
          value: "!=",
          position: this.position,
        });
        this.advance();
        this.advance();
        continue;
      }
      if (this.current === ">" && this.peek() === "=") {
        tokens.push({
          type: TokenType.GREATER_EQUAL,
          value: ">=",
          position: this.position,
        });
        this.advance();
        this.advance();
        continue;
      }
      if (this.current === ">") {
        tokens.push({
          type: TokenType.GREATER,
          value: ">",
          position: this.position,
        });
        this.advance();
        continue;
      }
      if (this.current === "<" && this.peek() === "=") {
        tokens.push({
          type: TokenType.LESS_EQUAL,
          value: "<=",
          position: this.position,
        });
        this.advance();
        this.advance();
        continue;
      }
      if (this.current === "<") {
        tokens.push({
          type: TokenType.LESS,
          value: "<",
          position: this.position,
        });
        this.advance();
        continue;
      }
      if (this.current === "&" && this.peek() === "&") {
        tokens.push({
          type: TokenType.AND,
          value: "&&",
          position: this.position,
        });
        this.advance();
        this.advance();
        continue;
      }
      if (this.current === "|" && this.peek() === "|") {
        tokens.push({
          type: TokenType.OR,
          value: "||",
          position: this.position,
        });
        this.advance();
        this.advance();
        continue;
      }

      // Unknown character - skip it
      this.advance();
    }

    tokens.push({ type: TokenType.EOF, value: "", position: this.position });
    return tokens;
  }
}

/**
 * Parser class - converts tokens into an Abstract Syntax Tree
 */
export class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private current(): Token {
    return this.tokens[this.position];
  }

  private advance(): void {
    if (this.position < this.tokens.length - 1) {
      this.position++;
    }
  }

  private expect(type: TokenType): Token {
    const token = this.current();
    if (token.type !== type) {
      throw new Error(
        `Expected token type ${type}, got ${token.type} at position ${token.position}`
      );
    }
    this.advance();
    return token;
  }

  /**
   * Parse primary expressions: literals, identifiers, bracketed identifiers
   */
  private parsePrimary(): ASTNode {
    const token = this.current();

    // Literal values
    if (
      token.type === TokenType.NUMBER ||
      token.type === TokenType.STRING ||
      token.type === TokenType.BOOLEAN
    ) {
      this.advance();
      return {
        type: NodeType.LITERAL,
        value: token.value,
      } as LiteralNode;
    }

    // Bracketed identifier: [varName]
    if (token.type === TokenType.LEFT_BRACKET) {
      this.advance();
      const identifier = this.expect(TokenType.IDENTIFIER);
      this.expect(TokenType.RIGHT_BRACKET);
      return {
        type: NodeType.IDENTIFIER,
        name: identifier.value as string,
      } as IdentifierNode;
    }

    // Plain identifier
    if (token.type === TokenType.IDENTIFIER) {
      this.advance();
      return {
        type: NodeType.IDENTIFIER,
        name: token.value as string,
      } as IdentifierNode;
    }

    throw new Error(
      `Unexpected token ${token.type} at position ${token.position}`
    );
  }

  /**
   * Parse comparison expressions: ==, !=, >, <, >=, <=
   */
  private parseComparison(): ASTNode {
    let left = this.parsePrimary();

    const token = this.current();
    if (
      token.type === TokenType.EQUAL ||
      token.type === TokenType.NOT_EQUAL ||
      token.type === TokenType.GREATER ||
      token.type === TokenType.GREATER_EQUAL ||
      token.type === TokenType.LESS ||
      token.type === TokenType.LESS_EQUAL
    ) {
      const operator = token.type;
      this.advance();
      const right = this.parsePrimary();
      return {
        type: NodeType.BINARY_OP,
        operator,
        left,
        right,
      } as BinaryOpNode;
    }

    return left;
  }

  /**
   * Parse logical AND expressions
   */
  private parseLogicalAnd(): ASTNode {
    let left = this.parseComparison();

    while (this.current().type === TokenType.AND) {
      this.advance();
      const right = this.parseComparison();
      left = {
        type: NodeType.LOGICAL_OP,
        operator: TokenType.AND,
        left,
        right,
      } as LogicalOpNode;
    }

    return left;
  }

  /**
   * Parse logical OR expressions (lowest precedence)
   */
  private parseLogicalOr(): ASTNode {
    let left = this.parseLogicalAnd();

    while (this.current().type === TokenType.OR) {
      this.advance();
      const right = this.parseLogicalAnd();
      left = {
        type: NodeType.LOGICAL_OP,
        operator: TokenType.OR,
        left,
        right,
      } as LogicalOpNode;
    }

    return left;
  }

  /**
   * Main parse method - entry point
   */
  public parse(): ASTNode {
    const ast = this.parseLogicalOr();
    this.expect(TokenType.EOF);
    return ast;
  }
}

/**
 * Evaluator class - executes the AST with provided context
 */
export class Evaluator {
  private context: Record<string, any>;

  constructor(context: Record<string, any> = {}) {
    this.context = context;
  }

  /**
   * Compare two values with type coercion
   */
  private compare(left: any, right: any, operator: TokenType): boolean {
    // Convert to comparable types
    const leftVal = left;
    const rightVal = right;

    switch (operator) {
      case TokenType.EQUAL:
        return leftVal == rightVal; // intentional == for type coercion
      case TokenType.NOT_EQUAL:
        return leftVal != rightVal; // intentional != for type coercion
      case TokenType.GREATER:
        return leftVal > rightVal;
      case TokenType.GREATER_EQUAL:
        return leftVal >= rightVal;
      case TokenType.LESS:
        return leftVal < rightVal;
      case TokenType.LESS_EQUAL:
        return leftVal <= rightVal;
      default:
        throw new Error(`Unknown comparison operator: ${operator}`);
    }
  }

  /**
   * Evaluate a node in the AST
   */
  public evaluate(node: ASTNode): any {
    switch (node.type) {
      case NodeType.LITERAL:
        return (node as LiteralNode).value;

      case NodeType.IDENTIFIER: {
        const name = (node as IdentifierNode).name;
        if (name in this.context) {
          return this.context[name];
        }
        // Return the identifier name itself if not found in context
        // This allows checking if the identifier exists in values
        return name;
      }

      case NodeType.BINARY_OP: {
        const binOp = node as BinaryOpNode;
        const left = this.evaluate(binOp.left);
        const right = this.evaluate(binOp.right);
        return this.compare(left, right, binOp.operator);
      }

      case NodeType.LOGICAL_OP: {
        const logOp = node as LogicalOpNode;
        const left = this.evaluate(logOp.left);

        if (logOp.operator === TokenType.AND) {
          // Short-circuit evaluation for AND
          if (!left) return false;
          return this.evaluate(logOp.right);
        } else if (logOp.operator === TokenType.OR) {
          // Short-circuit evaluation for OR
          if (left) return true;
          return this.evaluate(logOp.right);
        }
        throw new Error(`Unknown logical operator: ${logOp.operator}`);
      }

      default:
        throw new Error(`Unknown node type: ${(node as any).type}`);
    }
  }
}

/**
 * Main function to evaluate an expression string with context
 * @param expression - The expression string to evaluate
 * @param context - Context object with variable values
 * @returns The result of the evaluation
 */
export function evaluateExpression(
  expression: string,
  context: Record<string, any> = {}
): any {
  try {
    const tokenizer = new Tokenizer(expression);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const evaluator = new Evaluator(context);
    return evaluator.evaluate(ast);
  } catch (error) {
    console.error(`Failed to evaluate expression "${expression}":`, error);
    return false;
  }
}
