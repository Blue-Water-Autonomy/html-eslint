const rules = require("./rules");
const {
  recommendedRules,
  recommendedLegacyRules,
} = require("./configs/recommended");
const { allRules, allRulesLegacy } = require("./configs/all");
const { templRules } = require("./configs/templ");
const { HTMLLanguage } = require("./languages/html-language");
const { name, version } = require("../package.json");
const templProcessor = require("./processors/templ");
const parser = require("@html-eslint/parser");
/** @import {ESLint} from "eslint" */

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
    all: {
      rules: allRules,
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
    "flat/all": {
      plugins: {
        /** @type {ESLint.Plugin} */
        get "@html-eslint"() {
          return plugin;
        },
      },
      languageOptions: {
        parser,
      },
      rules: allRulesLegacy,
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
    },
  },
};

{
  // @ts-ignore
  plugin.configs.recommended.plugins.html = plugin;
}

module.exports = plugin;
