import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // Allow any for GM_* APIs that don't have perfect types
            "@typescript-eslint/no-explicit-any": "warn",
            // Prefer const
            "prefer-const": "error",
            // No console in production (warn only)
            "no-console": "warn",
        },
    },
    {
        ignores: ["dist/", "node_modules/", "*.config.js"],
    }
);
