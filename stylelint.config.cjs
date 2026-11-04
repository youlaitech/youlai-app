module.exports = {
  extends: [
    "stylelint-config-recommended-scss",
    "stylelint-config-recess-order",
    // 提供 Vue 解析与规则，必须放在最后
    "stylelint-config-recommended-vue/scss",
  ],
  overrides: [
    {
      files: ["**/*.{vue,html}"],
      customSyntax: "postcss-html",
    },
    {
      files: ["**/*.{css,scss}"],
      customSyntax: "postcss-scss",
    },
  ],
  rules: {
    "at-rule-no-unknown": [true, { ignoreAtRules: ["apply", "use", "forward"] }],
    "custom-property-pattern": null,
    "declaration-property-value-no-unknown": null,
    "import-notation": "string",
    "keyframes-name-pattern": null,
    "no-descending-specificity": null,
    "no-empty-source": null,
    "no-invalid-position-declaration": null,
    "selector-class-pattern": null,
    "selector-pseudo-class-no-unknown": [
      true,
      { ignorePseudoClasses: ["global", "export", "deep"] },
    ],
    "selector-pseudo-element-no-unknown": [
      true,
      { ignorePseudoElements: ["deep", "slotted", "global", "v-deep", "v-slotted", "v-global"] },
    ],
    // 小程序页面根节点用 page 选择器
    "selector-type-no-unknown": [true, { ignoreTypes: ["page"] }],
    "unit-no-unknown": null,
  },
};
