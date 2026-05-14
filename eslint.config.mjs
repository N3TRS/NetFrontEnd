import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Codebase uses `any` intentionally in socket/Excalidraw interop layers
      "@typescript-eslint/no-explicit-any": "warn",
      // Hook naming convention: warn to allow gradual migration
      "react-hooks/rules-of-hooks": "warn",
      // Missing deps: warn, not block
      "react-hooks/exhaustive-deps": "warn",
      // React Compiler rules — pre-existing violations, warn only
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
]);

export default eslintConfig;
