import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            "dist/**",
            "build/**",
            "public/**",
            "*.config.js",
            "*.config.mjs",
            "lint_output.txt",
            "src_lint_output.txt",
            "final_source_bugs.txt"
        ]
    },
    {
        files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            "react-hooks": reactHooks,
            "@next/next": nextPlugin,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs["core-web-vitals"].rules,
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "no-undef": "off",
            "no-console": "warn",
            "no-constant-condition": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "@next/next/no-html-link-for-pages": "off",
            "@typescript-eslint/ban-ts-comment": "warn",
        }
    },
    {
        files: ["scripts/**/*.{js,mjs}", "tailwind.config.ts"],
        rules: {
            "@typescript-eslint/no-require-imports": "off",
            "no-undef": "off"
        }
    }
);
