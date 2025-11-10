const { TEMPLATE_ENGINE_SYNTAX } = require("@blue-water-autonomy/html-eslint-parser");
module.exports = {
    overrides: [
        {
            files: ["**/*.js"],
            plugins: ["@html-eslint"],
            parserOptions: {
                ecmaVersion: 6
            },
            rules: {
                "@html-eslint/indent": ["error", 2],
            }
        },
        {
            files: ["**/*.html"],
            parser: "@blue-water-autonomy/html-eslint-parser",
            parserOptions: {
                templateEngineSyntax: TEMPLATE_ENGINE_SYNTAX.HANDLEBAR
            },
            plugins: ["@html-eslint"],
            rules: {
                "@html-eslint/indent": ["error", 2],
                "@html-eslint/sort-attrs": ["error"],
                "@html-eslint/quotes": ["error"]
            }
        },
        {
            files: ["**/*.html"],
            parser: "@blue-water-autonomy/html-eslint-parser",
            parserOptions: {
                frontmatter: true,
            },
            plugins: ["@html-eslint"],
            extends: ["plugin:@html-eslint/recommended-legacy"],
            rules: {
                "@html-eslint/indent": ["error", 2],
            }
        }
    ]
}