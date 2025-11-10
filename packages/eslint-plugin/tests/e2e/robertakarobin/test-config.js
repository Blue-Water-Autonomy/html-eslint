module.exports = {
  sourceFileName: `source.html`,
  fixedFileName: `fixed.html`,
  rules: {
    "html/attrs-newline": [
      `error`,
      {
        closeStyle: `newline`,
        ifAttrsMoreThan: 2,
      },
    ],
    "html/element-newline": [`error`],
    "html/indent": [`error`, `tab`],
    "html/lowercase": `error`,
    "html/no-abstract-roles": `error`,
    "html/no-accesskey-attrs": `error`,
    "html/no-aria-hidden-body": `error`,
    "html/no-duplicate-attrs": `error`,
    "html/no-duplicate-id": `error`,
    "html/no-extra-spacing-attrs": [
      `error`,
      {
        disallowMissing: true,
        disallowTabs: true,
        enforceBeforeSelfClose: true,
      },
    ],
    "html/no-inline-styles": `off`,
    "html/no-multiple-empty-lines": [
      `error`,
      {
        max: 2,
      },
    ],
    "html/no-multiple-h1": `warn`,
    "html/no-non-scalable-viewport": `warn`,
    "html/no-obsolete-tags": `error`,
    "html/no-positive-tabindex": `warn`,
    "html/no-script-style-type": `error`,
    "html/no-skip-heading-levels": `warn`,
    "html/no-target-blank": `error`,
    "html/no-trailing-spaces": `error`,
    "html/quotes": [`error`, `double`],
    "html/require-button-type": `error`,
    "html/require-closing-tags": [
      `error`,
      {
        selfClosing: `always`,
      },
    ],
    "html/require-doctype": `error`,
    "html/require-frame-title": `error`,
    "html/require-img-alt": `error`,
    "html/require-lang": `error`,
    "html/require-li-container": `error`,
    "html/require-meta-charset": `warn`,
    "html/require-meta-description": `warn`,
    "html/require-meta-viewport": `warn`,
    "html/require-title": `error`,
    "html/sort-attrs": [
      `error`,
      {
        priority: [],
      },
    ],
  },
};
