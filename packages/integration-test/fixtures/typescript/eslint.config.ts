import { defineConfig } from "eslint/config";
import html from "@blue-water-autonomy/html-eslint-plugin";

defineConfig(html.configs['flat/recommended']);

defineConfig([{
    files: ["**/*.html"],
    plugins: {
        html,
    },
    extends: ["html/recommended"],
    language: "html/html",
    rules: {
        "html/no-duplicate-class": "error",
    }
}]);
