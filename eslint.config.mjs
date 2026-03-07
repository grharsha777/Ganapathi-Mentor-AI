import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
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
            "final_source_bugs.txt",
            "source_bugs.txt",
            "real_bugs.txt"
        ]
    },
    {
        files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            "react": reactPlugin,
            "react-hooks": reactHooks,
            "@next/next": nextPlugin,
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs["core-web-vitals"].rules,
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "no-undef": "off",
            "no-console": "off",
            "no-constant-condition": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@next/next/no-html-link-for-pages": "off",
            "@next/next/no-img-element": "off",
            "@typescript-eslint/ban-ts-comment": "off",
        },
        settings: {
            react: {
                version: "detect"
            }
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
