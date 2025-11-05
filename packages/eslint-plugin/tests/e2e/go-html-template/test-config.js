const parser = require("@blue-water-autonomy/html-eslint-parser");
const plugin = require("../../../lib/index.js");

const allRules = Object.fromEntries(
  Object.keys(plugin.rules).map((ruleName) => [`html/${ruleName}`, "error"])
);

module.exports = {
  sourceFileName: `source.html`,
  fixedFileName: `fixed.html`,
  languageOptions: {
    templateEngineSyntax: parser.TEMPLATE_ENGINE_SYNTAX.GO_HTML_TEMPLATE,
  },
  rules: {
    ...allRules,
  },
};
