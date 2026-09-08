import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Preserved evidence. The as-written suite must stay byte-identical to what
    // the barriered writer produced — see custody/evidence/0001. Linting it
    // would pressure somebody into editing it, which is the one action that
    // silently voids the provenance claim.
    "custody/**",
  ]),
]);

/* A test that asserts a type GUARD's false cases must be able to construct the
   inputs the type system forbids — a string where a Failure is expected, an
   object with an unknown kind. `unknown` does not help: the call site wants the
   narrow type. So `any` is the right tool in a test and a smell everywhere
   else, and the rule is relaxed exactly there. */
eslintConfig.push({
  files: ["**/*.test.ts", "**/*.test.tsx"],
  rules: { "@typescript-eslint/no-explicit-any": "off" },
});

export default eslintConfig;
