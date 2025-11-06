/** @satisfies {import('eslint').Linter.Config['rules']} */
const templRules = {
  "html/attrs-newline": "off",
  "html/element-newline": "off",
  "html/indent": "off",
  "html/no-duplicate-attrs": "off", // Challenging to validate due to Templ's conditional syntax
  "html/quotes": "off", // Challenging to validate due to Templ's conditional syntax
};

module.exports = {
  templRules,
};
