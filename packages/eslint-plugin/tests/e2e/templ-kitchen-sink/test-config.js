const allRules = require("../../../lib//rules/index.js");

const rules = Object.fromEntries(
  Object.keys(allRules).map((ruleName) => [
    `@html-eslint/${ruleName}`,
    "error",
  ])
);

module.exports = {
  sourceFileName: `source.templ`,
  languageOptions: {
    parserOptions: {
      // Parser currently only works when this is unset
      // templateEngineSyntax: parser.TEMPLATE_ENGINE_SYNTAX.TEMPL,
    },
  },
  processor: '@html-eslint/templ',
  rules: {
    ...rules,
    "@html-eslint/attrs-newline": "off",
    "@html-eslint/element-newline": "off",
    "@html-eslint/id-naming-convention": "off",
    "@html-eslint/indent": "off",
    "@html-eslint/lowercase": "off",
    "@html-eslint/no-duplicate-attrs": "off",
    "@html-eslint/quotes": "off",
    "@html-eslint/require-closing-tags": ["error", {"selfClosing": "always"}],
    "@html-eslint/require-open-graph-protocol": "off",
    "@html-eslint/sort-attrs": "off",
  },
};
