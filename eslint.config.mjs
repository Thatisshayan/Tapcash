import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "react-hooks/set-state-in-effect": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // eslint-plugin-react@7.37.5 (latest published, pulled in transitively
      // by eslint-config-next) calls the legacy `context.getFilename()` API
      // that ESLint 10 removed outright, crashing lint on every file instead
      // of just failing this one rule. No newer eslint-plugin-react exists
      // yet with an ESLint-10-compatible fix. Disable until upstream ships one.
      "react/display-name": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Orphan components staged for deletion (2026-08-06 cleanup pass) — not
    // part of the build, kept only for Shayan's review before removal.
    "_cleanup-2026-08-06/**",
  ]),
]);

export default eslintConfig;
