/** @import {SyntaxConfig} from "@blue-water-autonomy/html-eslint-template-syntax-parser" */

/** @type {SyntaxConfig} */
const HANDLEBAR = {
  "{{": "}}",
};

/** @type {SyntaxConfig} */
const TWIG = [
  { open: "{{", close: "}}" },
  { open: "{%", close: "%}" },
  { open: "{#", close: "#}", isComment: true },
];

/** @type {SyntaxConfig} */
const ERB = {
  "<%": "%>",
};
/** @type {SyntaxConfig} */
const TEMPL = {
  "{": "}",
  "{{": "}}",
};

module.exports = {
  HANDLEBAR,
  TWIG,
  ERB,
  TEMPL,
};
