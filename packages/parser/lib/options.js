/**
 * @import ESHtmlParser from "es-html-parser";
 * @import {ParserOptions} from "./types"
 * @import {TemplateSyntax} from "@html-eslint/template-syntax-parser";
 */

const templateSyntaxParser = require("@html-eslint/template-syntax-parser");
const TEMPLATE_ENGINE_SYNTAX = require("./template-engine-syntax-preset");
const { parseFrontmatterContent } = require("./frontmatter");
/**
 * @param {string} code
 * @param {ParserOptions | undefined} parserOptions
 * @returns {{options: Parameters<ESHtmlParser['parse']>[1], html: string}}
 */
function getOptions(code, parserOptions) {
  let html = code;
  if (!parserOptions) {
    return {
      options: undefined,
      html,
    };
  }
  /**
   * @type {((TemplateSyntax | [number, number]))[] | undefined}
   */
  let templateInfos = undefined;
  if (parserOptions.templateEngineSyntax) {
    templateInfos = templateSyntaxParser.parse(code, {
      syntax: parserOptions.templateEngineSyntax,
    }).syntax;

    if (isTemplSyntax(parserOptions.templateEngineSyntax)) {
      templateInfos = transformTemplTemplateInfos(code, templateInfos);
    }
  }

  /**
   * @type {any}
   */
  let tokenAdapter = undefined;
  if (parserOptions.frontmatter) {
    const result = parseFrontmatterContent(code);
    if (result) {
      html = result.html;
      const lineOffset = result.line - 1;
      tokenAdapter = {
        /**
         * @param {any} token
         */
        finalizeLocation(token) {
          const startLine = token.loc.start.line + lineOffset;
          const endLine = token.loc.end.line + lineOffset;
          return {
            start: {
              line: startLine,
              column: token.loc.start.column,
            },
            end: {
              line: endLine,
              column: token.loc.end.column,
            },
          };
        },
        /**
         * @param {any} token
         */
        finalizeRange(token) {
          return [token.range[0] + result.index, token.range[1] + result.index];
        },
      };
    }
  }

  /**
   * @type {string[] | undefined}
   */
  let rawContentTags;

  if (parserOptions.rawContentTags) {
    rawContentTags = parserOptions.rawContentTags;
  }

  if (templateInfos || tokenAdapter || rawContentTags) {
    return {
      options: {
        templateInfos,
        tokenAdapter,
        rawContentTags,
      },
      html,
    };
  }
  return {
    options: undefined,
    html,
  };
}

module.exports = {
  getOptions,
};

/**
 * @param {Record<string, string> | undefined} syntax
 * @returns {boolean}
 */
function isTemplSyntax(syntax) {
  if (!syntax) {
    return false;
  }
  if (syntax === TEMPLATE_ENGINE_SYNTAX.TEMPL) {
    return true;
  }
  const entries = Object.entries(syntax);
  if (entries.length !== 1) {
    return false;
  }
  const [open, close] = entries[0];
  return open === "{" && close === "}";
}

/**
 * @param {string} code
 * @param {(TemplateSyntax | [number, number])[]} infos
 * @returns {(TemplateSyntax | [number, number])[]}
 */
function transformTemplTemplateInfos(code, infos) {
  /** @type {(TemplateSyntax | [number, number])[]} */
  const adjusted = [];

  for (const info of infos) {
    if (!info) continue;
    if (Array.isArray(info)) {
      adjusted.push(/** @type {[number, number]} */ (info));
      continue;
    }
    const openEnd = info.open[1];
    const closeStart = info.close[0];
    const inner = code.slice(openEnd, closeStart);
    const isMultiline = /[\r\n]/.test(inner);

    if (isMultiline) {
      adjusted.push(/** @type {[number, number]} */ ([info.open[0], info.open[1]]));
      adjusted.push(/** @type {[number, number]} */ ([info.close[0], info.close[1]]));
      continue;
    }

    adjusted.push(info);
  }

  adjusted.sort((a, b) => getRangeStart(a) - getRangeStart(b));
  return adjusted;
}

/**
 * @param {TemplateSyntax | [number, number]} info
 * @returns {number}
 */
function getRangeStart(info) {
  return Array.isArray(info) ? info[0] : info.open[0];
}
