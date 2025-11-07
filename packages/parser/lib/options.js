/**
 * @import ESHtmlParser from "es-html-parser";
 * @import {ParserOptions} from "./types"
 * @import {TemplateSyntax} from "@blue-water-autonomy/html-eslint-template-syntax-parser";
 */

const templateSyntaxParser = require("@blue-water-autonomy/html-eslint-template-syntax-parser");
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
  return (
    !!syntax &&
    typeof syntax === "object" &&
    hasSameEntries(syntax, TEMPLATE_ENGINE_SYNTAX.TEMPL)
  );
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
      const text = code.slice(info[0], info[1]);
      if (text === "{") {
        adjusted.push(adjustTemplOpenRange(code, info));
        continue;
      }
      adjusted.push(/** @type {[number, number]} */ (info));
      continue;
    }
    const openEnd = info.open[1];
    const closeStart = info.close[0];
    const inner = code.slice(openEnd, closeStart);
    const isMultiline = /[\r\n]/.test(inner);

    if (isMultiline) {
      const openRange = adjustTemplOpenRange(code, info.open);
      adjusted.push(openRange);
      adjusted.push(
        /** @type {[number, number]} */ ([info.close[0], info.close[1]])
      );
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

/**
 * @param {Record<string, string>} candidate
 * @param {Record<string, string>} reference
 * @returns {boolean}
 */
function hasSameEntries(candidate, reference) {
  const candidateEntries = Object.entries(candidate);
  const referenceEntries = Object.entries(reference);
  if (candidateEntries.length !== referenceEntries.length) {
    return false;
  }
  const referenceMap = new Map(referenceEntries);
  return candidateEntries.every(
    ([key, value]) => referenceMap.has(key) && referenceMap.get(key) === value
  );
}

/**
 * @param {string} code
 * @param {[number, number]} open
 * @returns {[number, number]}
 */
function adjustTemplOpenRange(code, open) {
  const [start, end] = open;
  let cursor = start - 1;
  while (cursor >= 0 && /\s/.test(code[cursor])) {
    cursor -= 1;
  }
  if (cursor >= 0 && code[cursor] === "=") {
    return /** @type {[number, number]} */ ([start, end]);
  }

  let statementStart = start;
  let lineCursor = start - 1;
  while (lineCursor >= 0) {
    const char = code[lineCursor];
    if (char === "\n" || char === "\r") {
      statementStart = lineCursor + 1;
      break;
    }
    lineCursor -= 1;
  }
  if (lineCursor < 0) {
    statementStart = 0;
  }

  while (statementStart < start && /\s/.test(code[statementStart])) {
    statementStart += 1;
  }

  if (code[statementStart] === "}") {
    statementStart += 1;
    while (statementStart < start && /\s/.test(code[statementStart])) {
      statementStart += 1;
    }
  }

  if (
    statementStart >= start ||
    code[statementStart] === "<" ||
    !isTemplControlKeyword(code.slice(statementStart, start).trim())
  ) {
    return /** @type {[number, number]} */ ([start, end]);
  }

  return /** @type {[number, number]} */ ([statementStart, end]);
}

/**
 * @param {string} segment
 * @returns {boolean}
 */
function isTemplControlKeyword(segment) {
  if (!segment) {
    return false;
  }
  return /^(if\b|for\b|switch\b|else\b|case\b|default\b|@)/.test(segment);
}
