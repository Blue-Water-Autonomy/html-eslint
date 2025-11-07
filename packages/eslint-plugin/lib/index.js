const rules = require("./rules");
const {
  recommendedRules,
  recommendedLegacyRules,
} = require("./configs/recommended");
const { templRules } = require("./configs/templ");
const { HTMLLanguage } = require("./languages/html-language");
const { name, version } = require("../package.json");
const parser = require("@blue-water-autonomy/html-eslint-parser");
const templProcessor = require("./processors/templ");
/**
 * @import { ESLint } from "eslint";
 */

/**
 * @satisfies {ESLint.Plugin}
 */
const plugin = {
  meta: {
    name,
    version,
  },
  languages: {
    html: new HTMLLanguage(),
  },
  processors: {
    templ: templProcessor,
  },
  rules,
  configs: {
    recommended: {
      rules: recommendedRules,
      plugins: {},
    },
    ["recommended-legacy"]: {
      rules: recommendedLegacyRules,
    },
    "flat/recommended": {
      plugins: {
        /** @type {ESLint.Plugin} */
        get "@html-eslint"() {
          return plugin;
        },
      },
      languageOptions: {
        parser,
      },
      rules: recommendedLegacyRules,
    },
    templ: {
      rules: templRules,
      languageOptions: {
        parser: parser,
        // For `language: 'html/html'`
        templateEngineSyntax: parser.TEMPLATE_ENGINE_SYNTAX.TEMPL,
        parserOptions: {
          // For configs without `language: 'html/html'`
          templateEngineSyntax: parser.TEMPLATE_ENGINE_SYNTAX.TEMPL,
        },
      },
      processor: templProcessor,
    },
  },
};

{
  // @ts-ignore
  plugin.configs.recommended.plugins.html = plugin;
}

module.exports = plugin;
