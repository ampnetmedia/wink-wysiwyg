import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        alert: "readonly",
        prompt: "readonly",
        navigator: "readonly",
        URL: "readonly",
        DOMParser: "readonly",
        HTMLElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLImageElement: "readonly",
        HTMLInputElement: "readonly",
        EventTarget: "readonly",
        CustomEvent: "readonly",
        EventListener: "readonly",
        MouseEvent: "readonly",
        KeyboardEvent: "readonly",
        DragEvent: "readonly",
        ClipboardEvent: "readonly",
        File: "readonly",
        // Node.js globals
        NodeJS: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        AbortController: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Make rules more lenient for now
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-undef": "off", // TypeScript handles this
      "no-empty": "warn",
      "no-case-declarations": "warn",
      "no-regex-spaces": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js", "*.config.mjs"],
  },
];
