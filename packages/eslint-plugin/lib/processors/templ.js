/**
 * Basic processor to extract HTML bodies from Go templ declarations.
 * Each `templ name(...) { ... }` block is emitted as an individual virtual file.
 */

const metadataCache = new Map();

/**
 * @param {string} code
 * @param {number} openIndex
 * @returns {number}
 */
function findClosingBrace(code, openIndex) {
  let depth = 1;
  let index = openIndex + 1;
  const length = code.length;
  /** @type {null | { type: "string"; quote: string } | { type: "line" } | { type: "block" }} */
  let inhibitor = null;

  while (index < length) {
    const char = code[index];
    const next = code[index + 1];

    if (!inhibitor) {
      if (char === '"' || char === "'" || char === "`") {
        inhibitor = { type: "string", quote: char };
        index += 1;
        continue;
      }
      if (char === "/" && next === "/") {
        inhibitor = { type: "line" };
        index += 2;
        continue;
      }
      if (char === "/" && next === "*") {
        inhibitor = { type: "block" };
        index += 2;
        continue;
      }
      if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          return index;
        }
      }
      index += 1;
      continue;
    }

    if (inhibitor.type === "string") {
      if (char === inhibitor.quote && !isEscaped(code, index)) {
        inhibitor = null;
      }
      index += 1;
      continue;
    }

    if (inhibitor.type === "line") {
      if (char === "\n" || char === "\r") {
        inhibitor = null;
      }
      index += 1;
      continue;
    }

    if (inhibitor.type === "block") {
      if (char === "*" && next === "/") {
        inhibitor = null;
        index += 2;
        continue;
      }
      index += 1;
      continue;
    }
  }
  return -1;
}

/**
 * @param {string} text
 * @param {number} index
 * @returns {boolean}
 */
function isEscaped(text, index) {
  let cursor = index - 1;
  let backslashes = 0;
  while (cursor >= 0 && text[cursor] === "\\") {
    backslashes += 1;
    cursor -= 1;
  }
  return backslashes % 2 === 1;
}

/**
 * @param {string} text
 * @param {number} index
 * @returns {{ line: number, column: number }}
 */
function computeLocation(text, index) {
  let line = 1;
  let column = 1;
  for (let i = 0; i < index; i += 1) {
    const char = text[i];
    if (char === "\n") {
      line += 1;
      column = 1;
    } else if (char === "\r") {
      if (text[i + 1] === "\n") {
        i += 1;
      }
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

/**
 * @param {string} code
 * @param {string} filename
 * @returns {string[]}
 */
function preprocess(code, filename) {
  const blocks = [];
  /**
   * @type {{ startIndex: number; startLine: number; startColumn: number }[]}
   */
  const metadata = [];
  const templPattern =
    /\btempl\s+[A-Za-z_][A-Za-z0-9_]*\s*\([^)]*\)\s*{/g;

  let match;
  while ((match = templPattern.exec(code))) {
    const openIndex = match.index + match[0].length - 1;
    const closeIndex = findClosingBrace(code, openIndex);
    if (closeIndex === -1) {
      continue;
    }
    const bodyStart = openIndex + 1;
    const body = code.slice(bodyStart, closeIndex);
    blocks.push(body);

    const loc = computeLocation(code, bodyStart);
    metadata.push({
      startIndex: bodyStart,
      startLine: loc.line,
      startColumn: loc.column,
    });

    templPattern.lastIndex = closeIndex + 1;
  }

  metadataCache.set(filename, metadata);
  return blocks;
}

/**
 * @param {import("eslint").Linter.LintMessage[][]} blockMessages
 * @param {string} filename
 * @returns {import("eslint").Linter.LintMessage[]}
 */
function postprocess(blockMessages, filename) {
  const metadata = metadataCache.get(filename) || [];
  metadataCache.delete(filename);

  const results = [];
  for (let i = 0; i < blockMessages.length; i += 1) {
    const meta = metadata[i];
    if (!meta) {
      continue;
    }
    for (const message of blockMessages[i]) {
      const adjusted = { ...message };
      const messageLine = message.line || 1;
      const messageColumn = message.column || 1;

      adjusted.line = meta.startLine + messageLine - 1;
      adjusted.column =
        messageLine === 1
          ? meta.startColumn + messageColumn - 1
          : messageColumn;

      if (message.endLine != null) {
        adjusted.endLine = meta.startLine + message.endLine - 1;
      }
      if (message.endColumn != null) {
        adjusted.endColumn =
          message.endLine === 1
            ? meta.startColumn + message.endColumn - 1
            : message.endColumn;
      }

      if (message.fix) {
        adjusted.fix = {
          range: [
            meta.startIndex + message.fix.range[0],
            meta.startIndex + message.fix.range[1],
          ],
          text: message.fix.text,
        };
      }

      if (message.suggestions) {
        adjusted.suggestions = message.suggestions.map((suggestion) => {
          if (!suggestion.fix) {
            return suggestion;
          }
          return {
            ...suggestion,
            fix: {
              range: [
                meta.startIndex + suggestion.fix.range[0],
                meta.startIndex + suggestion.fix.range[1],
              ],
              text: suggestion.fix.text,
            },
          };
        });
      }

      results.push(adjusted);
    }
  }

  return results;
}

module.exports = {
  supportsAutofix: true,
  preprocess,
  postprocess,
};
