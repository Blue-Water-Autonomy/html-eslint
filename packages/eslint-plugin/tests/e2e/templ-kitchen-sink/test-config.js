const parser = require("@blue-water-autonomy/html-eslint-parser");

const plugin = require("../../../lib/index.js");

module.exports = {
  sourceFileName: `source.templ`,
  fixedFileName: `fixed.templ`,
  languageOptions: {
    templateEngineSyntax: parser.TEMPLATE_ENGINE_SYNTAX.TEMPL,
  },
  processor: "html/templ",
  rules: {
    ...plugin.configs.all.rules,
    ...plugin.configs.templ.rules,
  },
};
