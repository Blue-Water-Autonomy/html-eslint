const { parse } = require("../lib/template-syntax-parser");
/**
 * @import {AST} from "eslint";
 * @import {TemplateSyntaxParserConfig} from "../lib/types";
 */

const HANDLEBAR = {
  syntax: {
    "{{{": "}}}",
    "{{": "}}",
  },
};
const ERB = {
  syntax: {
    "<%": " %>",
  },
};
const TEMPL = {
  syntax: {
    "{": "}",
  },
};

describe("basic", () => {
  /**
   * @type {[string, TemplateSyntaxParserConfig, AST.Range[]][]}
   */
  const TEST_CASES = [
    ["", HANDLEBAR, []],
    ["<div></div>", HANDLEBAR, []],
    ["{{  ", HANDLEBAR, []],
    ["{{value}}", HANDLEBAR, [[0, 9]]],
    [
      "{{value}} {{{value}}}",
      HANDLEBAR,
      [
        [0, 9],
        [10, 21],
      ],
    ],
    [
      "<div><% hello %></div><% hello %>",
      ERB,
      [
        [5, 16],
        [22, 33],
      ],
    ],
    [
      "<div>{{ {{ }} }}",
      {
        syntax: HANDLEBAR.syntax,
        skipRanges: [[8, 13]],
      },
      [[5, 16]],
    ],
  ];
  test.each(TEST_CASES)("parse(%s, %o)", (code, config, expected) => {
    expect(
      parse(code, config).syntax.map((s) => [s.open[0], s.close[1]])
    ).toStrictEqual(expected);
  });
});

describe("error", () => {
  test("nested", () => {
    expect(() => parse("{{{ {{ }} }}}", HANDLEBAR)).toThrowError();
  });
  test("unclosed", () => {
    expect(() => parse("{{{ {{", HANDLEBAR)).toThrowError();
  });
});

describe("nested", () => {
  test("handlebar supports nested braces", () => {
    const code = "{{ foo {{ bar }} baz }}";
    expect(
      parse(code, HANDLEBAR).syntax.map((s) => [s.open, s.close])
    ).toStrictEqual([
      [
        [7, 9],
        [14, 16],
      ],
      [
        [0, 2],
        [21, 23],
      ],
    ]);
  });

  test("templ supports nested braces", () => {
    const code = "{ foo { bar } }";
    expect(
      parse(code, TEMPL).syntax.map((s) => [s.open, s.close])
    ).toStrictEqual([
      [
        [6, 7],
        [12, 13],
      ],
      [
        [0, 1],
        [14, 15],
      ],
    ]);
  });
});
