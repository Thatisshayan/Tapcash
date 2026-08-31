import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-config-next sets settings.react.version = "detect", which makes
    // eslint-plugin-react call context.getFilename() to locate the installed
    // React package. ESLint 10 removed that legacy API outright, so any rule
    // that needs the React version (display-name, no-direct-mutation-state,
    // prop-types, etc.) crashes the whole lint run instead of just failing
    // itself. Pinning an explicit version here skips the auto-detect path
    // entirely — this is also just correct config regardless of the bug.
    settings: {
      react: { version: "19.2.8" },
    },
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
      "react/display-name": "off",
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",
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
