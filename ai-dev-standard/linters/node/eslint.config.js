// eslint.config.js — ESLint 9+ (flat config)
// npm i -D eslint typescript-eslint eslint-plugin-react eslint-plugin-react-hooks
//         eslint-config-prettier globals

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2022 },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // No negociables del kit de directrices
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",

      // Complejidad y tamaño — señales de alerta, no bloqueo duro
      "complexity": ["warn", 10],
      "max-lines-per-function": ["warn", { max: 60, skipBlankLines: true, skipComments: true }],

      // Seguridad básica
      "no-eval": "error",
      "no-implied-eval": "error",
    },
    settings: {
      react: { version: "detect" },
    },
  },
  prettier // desactiva reglas de formato que Prettier ya maneja — evita conflictos
);
