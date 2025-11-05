const parser = require("@html-eslint/parser");

const plugin = require("../../../lib/index.js");

const allRules = Object.fromEntries(
  Object.keys(plugin.rules).map((ruleName) => [
    `html/${ruleName}`,
    "error",
  ])
);

module.exports = {
  sourceFileName: `source.templ`,
  fixedFileName: `fixed.templ`,
  languageOptions: {
    parserOptions: {
      templateEngineSyntax: parser.TEMPLATE_ENGINE_SYNTAX.TEMPL,
    },
  },
  processor: 'html/templ',
  rules: {
    ...allRules,
    ...plugin.configs.templ.rules,
  },
};
