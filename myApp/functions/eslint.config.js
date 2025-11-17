import tseslint from "typescript-eslint";
import pluginImport from "eslint-plugin-import";

export default [
  {
    ignores: ["lib/**", "generated/**"],
  },
  // Use the official recommended configs
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: pluginImport,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "no-unused-expressions": "off",
      quotes: ["error", "double"],
      indent: ["error", 2],
      "import/no-unresolved": "off",
    },
  },
];
