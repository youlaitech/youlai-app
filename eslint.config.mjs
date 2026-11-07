import eslint from "@eslint/js";
import globals from "globals";
import * as typescriptEslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "unpackage/**",
      "public/**",
      "src/static/**",
      "**/u-charts/**",
      "**/qiun-**/**",
      "**/*.d.ts",
    ],
  },

  eslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  ...typescriptEslint.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        // uni-app 运行时注入的全局
        uni: "readonly",
        UniApp: "readonly",
        getCurrentPages: "readonly",
        wx: "readonly",
        UniHelper: "readonly",
        definePage: "readonly",
        // 全局类型，无需导入
        ApiResponse: "readonly",
        PageResult: "readonly",
        PageQuery: "readonly",
        OptionType: "readonly",
        // @wot-ui/ui 的自动导入方法
        useToast: "readonly",
        useDialog: "readonly",
        useNotify: "readonly",
      },
    },
    plugins: {
      vue: pluginVue,
      "@typescript-eslint": typescriptEslint.plugin,
    },
    rules: {
      "no-console": ["error", { allow: ["warn", "error", "debug"] }],
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],
      // 未定义与未使用由 TypeScript 检查兜底
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-redeclare": "off",
      // 项目内多处直接调用 Object.prototype 方法
      "no-prototype-builtins": "off",
    },
  },

  // 纯 JS 文件没有类型检查兜底，保留未定义变量检查
  {
    files: ["**/*.{js,mjs,cjs}"],
    rules: { "no-undef": "error" },
  },

  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: typescriptEslint.parser,
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
      "vue/require-default-prop": "off",
      "vue/block-order": ["error", { order: ["template", "script", "style"] }],
    },
  },

  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },

  {
    files: ["**/*.{ts,tsx,mts,cts,vue}"],
    rules: {
      // 条件编译块（#ifdef）在静态分析里表现为"赋值后立即覆盖"，规则不适用
      "no-useless-assignment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^[A-Z0-9_]+$",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // 关闭与 prettier 冲突的格式化规则
  skipFormatting,
];
