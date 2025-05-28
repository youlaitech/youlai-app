   

## 环境准备

[vue-uniapp-template](https://gitee.com/youlaiorg/vue-uniapp-template)  是一个通过 `vue-cli ` 构建的跨移动端脚手架模板，结合了 `uniapp`、`vue3 `和 `typescript`。在开始之前，需要准备以下环境。如果环境准备OK，请忽略本节。

### 安装 Node

> `Node.js` 是运行 JavaScript 代码的环境，也是 `npm` 包管理器的依赖。

打开 [Node.js 官方下载页面](https://nodejs.org/zh-cn/download/prebuilt-installer)，根据你的操作系统选择合适的版本进行下载，**推荐安装 LTS 版本**，这是长期支持版本，适合开发环境，比如这里选择 `v20.18.0(LTS) ` 版本。

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20241024220508312.png) 

下载之后，双击安装包根据提示安装，通过以下命令检查是否成功安装：

```bash
node -v
```

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20241024224347056.png)



### 安装 VSCode

>`VSCode` 是一款非常流行的代码编辑器，特别适合前端开发。

访问 [Visual Studio Code 官方网站](https://code.visualstudio.com/) ,根据你的操作系统下载相应版本的 `VSCode` ,下载完成后，双击安装程序并按照提示完成安装。



 ### 安装 vue-cli

> `Vue CLI` 是 Vue.js 的命令行工具，能够快速创建、开发、构建 Vue.js 项目。

打开终端或命令提示符, 使用 `npm` 全局安装 `Vue CLI`：

```
npm install -g @vue/cli
```

安装完成后，检查 `Vue CLI` 是否安装成功：

```bash
vue --version
```

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20241024213719105.png) 

## 创建项目

### 初始化项目

按照 [uni-app 官方文档](https://uniapp.dcloud.net.cn/quickstart-cli.html#创建uni-app) 的步骤，通过 `vue-cli` 创建 `uni-app` + `vue` + `typescript` 脚手架：

```bash
npx degit dcloudio/uni-preset-vue#vite-ts vue-uniapp-template
```

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20240917083025350.png) 

如果使用命令创建失败，可以通过 Gitee 下载 ZIP 包：[vite-ts 分支](https://gitee.com/dcloud/uni-preset-vue/tree/vite-ts)。

### 配置编译器

默认生成的 `TypeScript ` 编译器配置文件 `tsconfig.json` 中继承的 `@vue/tsconfig/tsconfig.json` 文件不存在。因此，你需要移除此继承配置并添加相应的编译设置。

![](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240923143412332.png) 

根据 [TypeScript 官方配置文档](https://www.typescriptlang.org/tsconfig/)，调整后的完整配置如下：

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "node",
    "target": "esnext",
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,

    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "lib": ["esnext", "dom"],
    "types": ["@dcloudio/types"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

- `"module": "esnext"`: 指定模块系统为 `ESNext`，即最新的 ECMAScript 模块系统，支持 `import.meta` 和其他最新的特性。
- `"moduleResolution": "node"`: 模块解析策略，通常设置为 `Node` 以支持 Node.js 风格的模块解析。
- `"target": "esnext"`: 将目标 JavaScript 版本设置为 `ESNext`，编译输出现代浏览器能够支持的最新特性代码。
- `"allowJs": true`: 允许 TypeScript 编译器处理 `.js` 文件，混合使用 TypeScript 和 JavaScript 文件。
- `"skipLibCheck": true`: 跳过库文件的类型检查，提升编译速度。
- `"strict": true` : 启用所有严格类型检查选项。

### 启动项目

创建完成后，使用 `VSCode` 打开项目并启动：

```bash
# 安装依赖
pnpm install
# 启动项目
pnpm run dev:h5
```

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20240917085244593.png)

项目启动后，访问 http://localhost:5173 预览效果：

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20240917085841605.png) 

 

## 代码规范配置

为了保证项目代码的规范性和一致性，可以为项目配置 `ESLint`、`Stylelint`、`Prettier` 以及 `Husky`，从而确保代码质量和开发流程的一致性。

 ### 集成 ESLint

`ESLint` 是一款 JavaScript 和 TypeScript 的代码规范工具，能够帮助开发团队保持代码风格一致并减少常见错误。

**ESLint 中文网**：[https://eslint.nodejs.cn/](https://eslint.nodejs.cn/)

#### 安装插件

VSCode 插件市场搜索 ESLint 插件并安装

![](https://s2.loli.net/2023/04/17/C3mV14KT2vHo6ZA.png) 

#### 配置 ESLint

通过以下命令快速生成 ESLint 配置文件：

```bash
npx eslint --init
```

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20240917202516052.png)

执行该命令后，ESLint 会通过交互式问题的方式，帮助生成配置文件。针对 9.x 版本，默认会生成基于 Flat Config 格式的 `eslint.config.mjs` 文件，与之前的 `.eslintrc` 格式有所不同。

默认生成的 `eslint.config.mjs` 文件如下所示：

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20240917221647303.png)

在此基础上，可以根据项目的需求进行一些定制化配置，例如添加忽略规则或自定义的特殊规则。

```js
import globals from "globals"; // 全局变量配置
import pluginJs from "@eslint/js"; // JavaScript 的推荐配置
import tseslint from "typescript-eslint"; // TypeScript 配置
import pluginVue from "eslint-plugin-vue"; // Vue 配置

export default [
  {files: ["**/*.{js,mjs,cjs,ts,vue}"]}, // 校验的文件类型
  {languageOptions: { globals: {...globals.browser , ...globals.node} }}, // 浏览器/Node环境全局变量
  pluginJs.configs.recommended, // JavaScript 推荐配置
  ...tseslint.configs.recommended, // TypeScript 推荐配置
  ...pluginVue.configs["flat/essential"], // Vue 推荐配置
  { files: ["**/*.vue"], languageOptions: { parserOptions: { parser: tseslint.parser } } }, // 对 .vue 文件使用 TypeScript 解析器
  
  // 添加忽略的文件或目录
  {
    ignores: [
      "/dist",
      "/public",
      "/node_modules",
      "**/*.min.js",
      "**/*.config.mjs",
      "**/*.tsbuildinfo",
      "/src/manifest.json",
    ]
  },

  // 自定义规则
  {
    rules: {
      quotes: ["error", "double"], // 强制使用双引号
      "quote-props": ["error", "always"], // 强制对象的属性名使用引号
      semi: ["error", "always"], // 要求使用分号
      indent: ["error", 2], // 使用两个空格进行缩进
      "no-multiple-empty-lines": ["error", { max: 1 }], // 不允许多个空行
      "no-trailing-spaces": "error", // 不允许行尾有空格

      // TypeScript 规则
      "@typescript-eslint/no-explicit-any": "off", // 禁用 no-explicit-any 规则，允许使用 any 类型
      "@typescript-eslint/explicit-function-return-type": "off", // 不强制要求函数必须明确返回类型
      "@typescript-eslint/no-empty-interface": "off", // 禁用 no-empty-interface 规则，允许空接口声明
      "@typescript-eslint/no-empty-object-type": "off", // 允许空对象类型

      // Vue 规则
      "vue/multi-word-component-names": "off", // 关闭多单词组件名称的限制
      "vue/html-indent": ["error", 2], // Vue 模板中的 HTML 缩进使用两个空格
      "vue/no-v-html": "off", // 允许使用 v-html (根据实际项目需要)
    },
  },
];
```

#### 添加 ESLint 脚本

为了方便使用 ESLint，可以在 `package.json` 中添加 `lint` 脚本命令：

```json
{
  "scripts": {
    "lint:eslint": "eslint --fix ./src"
  }
}
```

此脚本会自动修复符合 ESLint 规则的代码问题，并输出检查结果。

####  测试效果

在 `App.vue` 文件中声明一个未使用的变量，并运行 `pnpm run lint:eslint`，可以看到 ESLint 提示该变量未使用。如下图所示：

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20240917235501951.png)

#### 推荐配置

安装 Vue 文件解析器 `vue-eslint-parser`：

```bash
pnpm add -D vue-eslint-parser
```

针对不同文件配置插件和解析器：

```javascript
// eslint.config.mjs
import globals from "globals";
import js from "@eslint/js";

// ESLint 核心插件
import pluginVue from "eslint-plugin-vue";
import pluginTypeScript from "@typescript-eslint/eslint-plugin";

// Prettier 插件及配置
import configPrettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

// 解析器
import * as parserVue from "vue-eslint-parser";
import * as parserTypeScript from "@typescript-eslint/parser";

// 定义 ESLint 配置
export default [
  // 通用 JavaScript/TypeScript 配置
  {
    ...js.configs.recommended,
    ignores: [
      "/dist",
      "/public",
      "/node_modules",
      "**/*.min.js",
      "**/*.config.mjs",
      "**/*.tsbuildinfo",
      "/src/manifest.json",
    ],
    languageOptions: {
      globals: {
        ...globals.browser, // 浏览器变量 (window, document 等)
        ...globals.node, // Node.js 变量 (process, require 等)
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      ...configPrettier.rules,
      ...pluginPrettier.configs.recommended.rules,
      "no-debug": "off", // 允许使用 debugger
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto", // 解决换行符冲突
        },
      ],
    },
  },

  // TypeScript 配置
  {
    files: ["**/*.?([cm])ts"],
    languageOptions: {
      parser: parserTypeScript,
      parserOptions: {
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": pluginTypeScript,
    },
    rules: {
      ...pluginTypeScript.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off", // 允许使用 any
      "@typescript-eslint/no-empty-function": "off", // 允许空函数
      "@typescript-eslint/no-empty-object-type": "off", // 允许空对象类型
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { disallowTypeAnnotations: false, fixStyle: "inline-type-imports" },
      ], // 统一类型导入风格
    },
  },

  // TypeScript 声明文件的特殊配置
  {
    files: ["**/*.d.ts"],
    rules: {
      "eslint-comments/no-unlimited-disable": "off", // 关闭 eslint 注释相关规则
      "unused-imports/no-unused-vars": "off", // 忽略未使用的导入
    },
  },

  // JavaScript (commonjs) 配置
  {
    files: ["**/*.?([cm])js"],
    rules: {
      "@typescript-eslint/no-var-requires": "off", // 允许 require
    },
  },

  // Vue 文件配置
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        sourceType: "module",
      },
    },
    plugins: {
      vue: pluginVue,
    },
    processor: pluginVue.processors[".vue"],
    rules: {
      ...pluginVue.configs["vue3-recommended"].rules,
      "vue/no-v-html": "off", // 允许 v-html
      "vue/require-default-prop": "off", // 允许没有默认值的 prop
      "vue/multi-word-component-names": "off", // 关闭组件名称多词要求
      "vue/html-self-closing": [
        "error",
        {
          html: { void: "always", normal: "always", component: "always" },
          svg: "always",
          math: "always",
        },
      ], // 自闭合标签
    },
  },
];
```



### 集成 Prettier

Prettier 是一个代码格式化工具，能够和 ESLint 配合使用，确保代码风格统一。

**prettier 中文网**：[https://prettier.nodejs.cn/](https://prettier.nodejs.cn/)

#### 安装插件

VSCode 插件市场搜索 `Prettier - Code formatter` 插件安装 

![](https://s2.loli.net/2023/02/12/cBHDxNGzCaoeqvW.png) 

#### 安装依赖

```bash
pnpm install -D prettier eslint-config-prettier eslint-plugin-prettier 
```

- **prettier**：主要的 Prettier 格式化库。

- **eslint-plugin-prettier**：将 Prettier 的规则作为 ESLint 的规则来运行。

- **eslint-config-prettier**：禁用所有与格式相关的 ESLint 规则，以避免和 Prettier 的冲突。

#### 配置 Prettier

项目根目录下新建配置文件 `prettier.config.mjs`，添加常用规则：

```js
export default {
  printWidth: 100, // 每行最多字符数量，超出换行(默认80)
  tabWidth: 2, // 缩进空格数，默认2个空格
  useTabs: false, // 指定缩进方式，空格或tab，默认false，即使用空格
  semi: true, // 使用分号
  singleQuote: false, // 使用单引号 (true:单引号;false:双引号)
  trailingComma: 'all', // 末尾使用逗号
};
```

#### 配置忽略文件

项目根目录新建 `.prettierignore` 文件指定 Prettier 不需要格式化的文件和文件夹

```bash
# .prettierignore
node_modules
dist
public
*.min.js
```

#### 添加格式化脚本

在 `package.json` 文件中添加：

```json
{
  "scripts": {
    "format": "prettier --write ./src"
  }
}
```

#### 保存自动格式化

打开 VSCode 的 `File` → `Preferences` → `Settings`，然后选择 `Open Settings (JSON)`，添加以下配置

```json
{
  "editor.formatOnSave": true, // 保存格式化文件
  "editor.defaultFormatter": "esbenp.prettier-vscode" // 指定 prettier 为所有文件默认格式化器
}
```

####  测试

下图演示了保存时的自动格式化效果，展示了代码中引号和换行的自动调整：

![](https://raw.gitmirror.com/youlaitech/images/main/docs/PixPin_2024-09-18_15-45-29.gif) 



### 集成 Stylelint 

Stylelint 一个强大的 CSS linter(检查器)，可帮助您避免错误并强制执行约定。

**Stylelint 官网**：[https://stylelint.io/](https://stylelint.io/)

#### 安装插件

VSCode 插件搜索 `Stylelint` 并安装

![](https://s2.loli.net/2023/04/08/azfOTp4K12c3PvQ.png)



#### 安装依赖

```bash
pnpm install -D postcss postcss-html postcss-scss stylelint stylelint-config-recommended stylelint-config-recommended-scss stylelint-config-recommended-vue stylelint-config-recess-order stylelint-config-html stylelint-prettier
```

| 依赖                              | 说明                                                         | 备注                                                         |
| --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| postcss                           | CSS 解析工具，允许使用现代 CSS 语法并将其转换为兼容的旧语法  |                                                              |
| postcss-html                      | 解析 HTML (类似 HTML) 的 PostCSS 语法                        | [postcss-html 文档](https://github.com/gucong3000/postcss-html) |
| postcss-scss                      | PostCSS 的 SCSS 解析器                                       | [postcss-scss 文档](https://github.com/postcss/postcss-scss)，支持 CSS 行类注释 |
| stylelint                         | stylelint 核心库                                             | [stylelint ](https://stylelint.io/)                          |
| stylelint-config-standard         | Stylelint 标准共享配置                                       | [stylelint-config-standard 文档](https://github.com/stylelint/stylelint-config-standard) |
| stylelint-config-recommended      |                                                              |                                                              |
| stylelint-config-recommended-scss | 扩展 stylelint-config-recommended 共享配置并为 SCSS 配置其规则 | [stylelint-config-recommended-scss 文档](https://github.com/stylelint-scss/stylelint-config-recommended-scss) |
| stylelint-config-recommended-vue  | 扩展 stylelint-config-recommended 共享配置并为 Vue 配置其规则 | [stylelint-config-recommended-vue 文档](https://github.com/ota-meshi/stylelint-config-recommended-vue) |
| stylelint-config-recess-order     | 提供优化样式顺序的配置                                       | [CSS 书写顺序规范](https://jingyan.baidu.com/article/647f0115cf48957f2148a8a3.html) |
| stylelint-config-html             | 共享 HTML (类似 HTML) 配置，捆绑 postcss-html 并对其进行配置 | [stylelint-config-html 文档](https://github.com/ota-meshi/stylelint-config-html) |
| stylelint-prettier                |                                                              |                                                              |



#### 配置 Stylelint

根目录新建 `.stylelintrc.cjs` 文件，配置如下：

```javascript
{
  "extends": [
    "stylelint-config-recommended",
    "stylelint-config-recommended-scss",
    "stylelint-config-recommended-vue/scss",
    "stylelint-config-html/vue",
    "stylelint-config-recess-order"
  ],
  "plugins": ["stylelint-prettier"],
  "overrides": [
    {
      "files": ["**/*.{vue,html}"],
      "customSyntax": "postcss-html"
    },
    {
      "files": ["**/*.{css,scss}"],
      "customSyntax": "postcss-scss"
    }
  ],

  "rules": {
    "import-notation": "string",
    "selector-class-pattern": null,
    "custom-property-pattern": null,
    "keyframes-name-pattern": null,
    "no-descending-specificity": null,
    "no-empty-source": null,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        "ignorePseudoClasses": ["global", "export", "deep"]
      }
    ],
       "unit-no-unknown": [true, {
      "ignoreUnits": ["rpx"]
    }]   
    "property-no-unknown": [
      true,
      {
        "ignoreProperties": []
      }
    ],
    "at-rule-no-unknown": [
      true,
      {
        "ignoreAtRules": ["apply", "use", "forward"]
      }
    ]
  }
}
```

#### 配置忽略文件

根目录创建 .stylelintignore 文件，配置忽略文件如下：

```basic
*.min.js
dist
public
node_modules
```

#### 添加 Stylelint 脚本

package.json 添加 Stylelint 检测指令：

```json
  "scripts": {
      "lint:stylelint": "stylelint  \"**/*.{css,scss,vue,html}\" --fix"
  }
```

#### 保存自动修复

项目根目录下`.vscode/settings.json` 文件添加配置：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.stylelint": true 
  },
  "stylelint.validate": ["css", "scss", "vue", "html"]
}
```

为了验证把尺寸属性 width 放置在定位属性 position 前面，根据 [CSS 书写顺序规范](https://jingyan.baidu.com/article/647f0115cf48957f2148a8a3.html) 推断是不符合规范的，在保存时 Stylelint 自动将属性重新排序，达到预期。

![](https://raw.gitmirror.com/youlaitech/image/main/blog/PixPin_2024-09-18_20-39-04.gif)

#### 测试

执行以下命令进行检测

```bash
npm run lint:stylelint
```

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20240918203537608.png)

## Git提交规范配置



配置 Husky 的 `pre-commit` 和 `commit-msg` 钩子，实现代码提交的自动化检查和规范化。

- **pre-commit**: 使用 Husky + Lint-staged，在提交前进行代码规范检测和格式化。确保项目已配置 ESLint、Prettier 和 Stylelint。
- **commit-msg**: 结合 Husky、Commitlint、Commitizen 和 cz-git，生成规范化且自定义的 Git commit 信息。

![](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240919150854229.png)



### 集成 Husky

Husky 是 Git 钩子工具，可以设置在 git 各个阶段（`pre-commit`、`commit-msg` 等）触发。

**Husky官网**：[https://typicode.github.io](https://typicode.github.io/husky/zh/get-started.html)

![](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240919094059492.png)

#### 安装依赖

```bash
pnpm add -D husky
```

#### 初始化

`init` 命令简化了项目中的 husky 设置。它会在 `.husky/` 中创建 `pre-commit` 脚本，并更新 `package.json` 中的 `prepare` 脚本。

```bash
pnpm exec husky init
```

#### 测试

![image-20240919100633078](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240919100633078.png) 

通过 `pre-commit` 钩子，可以自动运行各种代码检查工具，在提交代码前强制执行代码质量和样式检查。常见的工具包括：

- **`eslint`**：用于检查和修复 JavaScript/TypeScript 代码中的问题。
- **`stylelint`**：用于检测和修复 CSS/SCSS 样式问题。

接下来，集成 **`lint-staged`** 和 **`commitlint`** 来进一步完善开发体验。

### 集成 lint-staged

`lint-staged` 是一个工具，专门用于只对 Git 暂存区的文件运行 lint 或其他任务，确保只检查和修复被修改或新增的代码部分，而不会影响整个代码库。这样可以显著提升效率，尤其是对于大型项目。

#### 安装依赖

使用以下命令安装 `lint-staged`：

```json
pnpm add -D lint-staged
```

#### 配置 lint-staged

在 `package.json` 中添加 `lint-staged` 配置，确保在 `pre-commit` 阶段自动检测暂存的文件：

```json
{
  "name": "vue-uniapp-template",
  "version": "0.0.0",
  "lint-staged": {
    "*.{js,ts}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{cjs,json}": [
      "prettier --write"
    ],
    "*.{vue,html}": [
      "eslint --fix",
      "prettier --write",
      "stylelint --fix"
    ],
    "*.{scss,css}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.md": [
      "prettier --write"
    ]
  }
}
```

在 `package.json` 的 `scripts` 部分中，添加用于运行 `lint-staged` 的命令：

```json
"scripts": {
   "lint:lint-staged": "lint-staged"
}
```

#### 添加 Husky 钩子

在项目根目录的 `.husky/pre-commit` 中添加以下命令，确保在提交代码前执行 `lint-staged`：

```bash
pnpm run lint:lint-staged
```

#### 测试

提交代码时，`lint-staged` 会自动对暂存的文件运行相应的 lint 任务。

![](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240919112617112.png)

通过这种集成方式，确保代码在提交前经过自动格式化和校验，提高代码质量和一致性。

### 集成 Commitlint

`commitlint` 用于检查 Git 提交信息是否符合特定规范（如 Angular 提交规范），从而保证提交信息的一致性。

**Commitlint官网**：[https://commitlint.js.org/](https://commitlint.js.org/)

#### 安装依赖

```bash
pnpm add -D  @commitlint/cli @commitlint/config-conventional
```

#### 配置 Commitlint

在项目根目录下创建 `commitlint.config.cjs` 文件，添加以下内容来启用 Angular 规范：

```json
module.exports = {
  // 继承的规则
  extends: ["@commitlint/config-conventional"],
  // 自定义规则
  rules: {
    // 提交类型枚举，git提交type必须是以下类型 @see https://commitlint.js.org/#/reference-rules
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新增功能
        "fix", // 修复缺陷
        "docs", // 文档变更
        "style", // 代码格式（不影响功能，例如空格、分号等格式修正）
        "refactor", // 代码重构（不包括 bug 修复、功能新增）
        "perf", // 性能优化
        "test", // 添加疏漏测试或已有测试改动
        "build", // 构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）
        "ci", // 修改 CI 配置、脚本
        "revert", // 回滚 commit
        "chore", // 对构建过程或辅助工具和库的更改（不影响源文件、测试用例）
      ],
    ],
    "subject-case": [0], // subject大小写不做校验
  },
};
```

#### 添加 Husky 钩子

将 `commitlint` 与 Husky 集成，在 `.husky/commit-msg` 文件中添加以下内容，确保提交信息符合规范：

```bash
npx --no-install commitlint --edit $1
```

#### 测试

根据 Angular 的提交规范，提交信息由以下部分组成：

1. **类型**：表示本次提交的类型，例如 `feat` (新功能)、`fix` (修复 bug)、`docs` (文档更新)。
2. **作用域**（可选）：说明本次提交影响的模块，例如 `auth`、`ui`。
3. **简短描述**：简洁明了的提交描述，限定在 50 字符以内。

当你尝试提交不符合规范的提交信息时，提交会被阻止，并显示相关错误提示。如下图所示：

![](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240919134921181.png) 

### 集成 Commitizen  和  cz-git

- **commitizen**:  是一个帮助开发者以标准化格式生成提交信息的工具。--[Commitizen 官方文档](https://commitizen.github.io/cz-cli/)

- **cz-git**: `cz-git` 是 `Commitizen` 的适配器之一，它基于 `Commitizen`，提供了更多自定义功能和增强的交互体验。--[cz-git 官方文档](https://cz-git.qbb.sh/zh/)

#### 安装依赖

```bash
pnpm add -D commitizen cz-git
```

#### 配置 cz-git

在项目中初始化 `Commitizen`，并配置使用 `cz-git` 作为适配器。在 `package.json` 中添加以下配置：

```json
"config": {
    "commitizen": {
        "path": "node_modules/cz-git"
    }
}
```

在`commitlint` 的配置文件 `commitlint.config.cjs` 中添加配置，commitlint 配置模板：[https://cz-git.qbb.sh/zh/config/](https://cz-git.qbb.sh/zh/config/)

```javascript
module.exports = {
  // 继承的规则
  extends: ["@commitlint/config-conventional"],
  // 自定义规则
  rules: {
    // ...
  },
  // cz-git 配置
  prompt: {
    messages: {
      type: "选择你要提交的类型 :",
      scope: "选择一个提交范围（可选）:",
      customScope: "请输入自定义的提交范围 :",
      subject: "填写简短精炼的变更描述 :\n",
      body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footerPrefixesSelect: "选择关联issue前缀（可选）:",
      customFooterPrefix: "输入自定义issue前缀 :",
      footer: "列举关联issue (可选) 例如: #31, #I3244 :\n",
      generatingByAI: "正在通过 AI 生成你的提交简短描述...",
      generatedSelectByAI: "选择一个 AI 生成的简短描述:",
      confirmCommit: "是否提交或修改commit ?",
    },
    // prettier-ignore
    types: [
        { value: "feat",     name: "特性:     ✨  新增功能", emoji: ":sparkles:" },
        { value: "fix",      name: "修复:     🐛  修复缺陷", emoji: ":bug:" },
        { value: "docs",     name: "文档:     📝  文档变更", emoji: ":memo:" },
        { value: "style",    name: "格式:     💄  代码格式（不影响功能，例如空格、分号等格式修正）", emoji: ":lipstick:" },
        { value: "refactor", name: "重构:     ♻️  代码重构（不包括 bug 修复、功能新增）", emoji: ":recycle:" },
        { value: "perf",     name: "性能:     ⚡️  性能优化", emoji: ":zap:" },
        { value: "test",     name: "测试:     ✅  添加疏漏测试或已有测试改动", emoji: ":white_check_mark:"},
        { value: "build",    name: "构建:     📦️  构建流程、外部依赖变更（如升级 npm 包、修改 vite 配置等）", emoji: ":package:"},
        { value: "ci",       name: "集成:     🎡  修改 CI 配置、脚本",  emoji: ":ferris_wheel:"},
        { value: "revert",   name: "回退:     ⏪️  回滚 commit",emoji: ":rewind:"},
        { value: "chore",    name: "其他:     🔨  对构建过程或辅助工具和库的更改（不影响源文件、测试用例）", emoji: ":hammer:"},
      ],
    useEmoji: true,
    emojiAlign: "center",
    useAI: false,
    aiNumber: 1,
    themeColorCode: "",
    scopes: [],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: "bottom",
    customScopesAlias: "custom",
    emptyScopesAlias: "empty",
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ["feat", "fix"],
    breaklineNumber: 100,
    breaklineChar: "|",
    skipQuestions: [],
    issuePrefixes: [{ value: "closed", name: "closed:   ISSUES has been processed" }],
    customIssuePrefixAlign: "top",
    emptyIssuePrefixAlias: "skip",
    customIssuePrefixAlias: "custom",
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    maxHeaderLength: Infinity,
    maxSubjectLength: Infinity,
    minSubjectLength: 0,
    scopeOverrides: undefined,
    defaultBody: "",
    defaultIssues: "",
    defaultScope: "",
    defaultSubject: "",
  },
};

```

#### 添加 cz-git 脚本

在`package.json` 文件中添加 `commit` 脚本命令

```json
 "scripts": {
     "commit": "git-cz"
 }
```

#### 测试

执行 `pnpm run commit` 命令后，按照提示输入相关信息，最终生成符合规范的提交信息。

![](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240919150854229.png) 

## 整合 Sass

**Sass**是帮助开发者编写、管理和维护样式的强大工具，通过 `<style lang="scss">` 使用。它提供变量、嵌套、混合等功能，提升了样式的可维护性和开发效率，尤其在复杂项目中减少重复代码、提高复用性。

```
pnpm add -D sass sass-loader
```





## 整合 UnoCSS

UnoCSS 是一个高性能、灵活且按需生成的原子化 CSS 引擎。

**官方网站**：[https://unocss.net/](https://unocss.net/)

先比较下

| 内部样式                                                     | UnoCSS原子样式                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| ![](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240920174025912.png) | ![image-20240920174419861](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240920174419861.png) |

### 安装插件

`VSCode` 安装 `UnoCSS` 插件

 ![VSCode安装UnoCSS插件](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240920114534560.png)

### 安装依赖

本次整合基于官网提供的社区预设 [unocss-preset-weapp](https://github.com/MellowCo/unocss-preset-weapp)。该预设内置了 `transformer`，用于解决小程序的兼容性问题。

![UnoCSS 整合](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240920093428222.png)

进一步参考 [unocss-preset-weapp 的 uniapp_vue3 使用与配置指南](https://github.com/MellowCo/unocss-preset-weapp/blob/main/examples/uniapp_vue3/README.md)，使用以下命令安装 UnoCSS 和 `unocss-preset-weapp`：

```bash
pnpm add -D unocss unocss-preset-weapp
```

### 配置 UnoCSS

参考 [unocss-preset-weapp 的 uniapp_vue3 使用与配置指南](https://github.com/MellowCo/unocss-preset-weapp/blob/main/examples/uniapp_vue3/README.md)，配置如下：

- **vite.config.ts**

  > 在 `vite.config.ts` 中添加如下配置，整合 UnoCSS 到 UniApp 项目：

  ```bash
  import { defineConfig } from 'vite'
  import uni from '@dcloudio/vite-plugin-uni'
  
  export default defineConfig(async () => {
    const UnoCss = await import('unocss/vite').then(i => i.default)
  
    return {
      plugins: [
        uni(),
        // 配置 UnoCSS
        UnoCss(),
      ],
    }
  })
  ```

- **unocss.config.ts**

  > 添加unocss.config.ts文件，搭配 [unocss vscode](https://marketplace.visualstudio.com/items?itemName=antfu.unocss) 插件，智能提示

  ```typescript
  import presetWeapp from "unocss-preset-weapp";
  import { extractorAttributify, transformerClass } from "unocss-preset-weapp/transformer";
  
  const { presetWeappAttributify, transformerAttributify } = extractorAttributify();
  
  export default {
    presets: [
      // https://github.com/MellowCo/unocss-preset-weapp
      presetWeapp(),
      // attributify autocomplete
      presetWeappAttributify(),
    ],
    shortcuts: [
      {
        "flex-center": "flex justify-center items-center",
        "flex-col": "flex flex-col",
      },
    ],
  
    transformers: [
      // https://github.com/MellowCo/unocss-preset-weapp/tree/main/src/transformer/transformerAttributify
      transformerAttributify(),
  
      // https://github.com/MellowCo/unocss-preset-weapp/tree/main/src/transformer/transformerClass
      transformerClass(),
    ],
  };
  
  ```

​		**`shortcuts` 自定义样式组合**：可以在 `shortcuts` 中定义常用的样式组合，以便简化项目中的样式使用和维护，避免冗余和重复的样式。

- **main.ts**

  ```
  import 'uno.css'
  ```

  

### 测试

下图展示了在 VSCode 中测试 UnoCSS 时，智能提示和样式设置功能已经正常生效。

![img](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240920123246893.png)

此外，在 `unocss.config.ts` 文件中预设的 `shortcuts` 组合样式也得到了正确应用。

![image-20240920175138557](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240920175138557.png) 



## 添加 TabBar

在 APP 开发中，底部导航栏（TabBar）是移动端应用的重要部分，方便用户在不同页面间进行切换。

### 添加页面

在初始化的模板项目中，`src/pages` 目录下默认有一个 `index/index.vue` 页面。为了更好地演示 `TabBar` 的切换效果，我们在 `pages` 目录下再新增两个页面：

- **工作台页面**（`src/pages/work/index.vue`）：

  ```vue
  <template>
    <view class="flex-center flex-col">
      <view>
        <text class="text-cyan font-bold text-lg">工作台</text>
      </view>
    </view>
  </template>
  ```

- **我的页面**（`src/pages/my/index.vue`）：

  ```vue
  <template>
    <view class="flex-center flex-col">
      <view>
        <text class="text-blue font-bold text-lg">我的</text>
      </view>
    </view>
  </template>
  ```

### 添加图标

在 `src/static` 目录下创建一个 `tabbar` 文件夹，存放从 iconfont 获取的图标。每个图标都需要有未激活和激活两种状态的样式。

 ![](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240923115902874.png) 

### 配置 TabBar

在 UniApp 项目中，底部导航栏（TabBar）通过配置 `pages.json` 文件来实现。首先，找到并打开项目根目录下的 `src/pages.json` 文件。在该文件中，可以为每个页面配置导航栏，同时定义 TabBar。

下面是完整的配置示例，注意 `tabBar` 中的 `pagePath` 必须对应 `pages` 目录下的实际页面路径。

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    },
    {
      "path": "pages/work/index",
      "style": {
        "navigationBarTitleText": "工作台"
      }
    },
    {
      "path": "pages/mine/index",
      "style": {
        "navigationBarTitleText": "我的"
      }
    }
  ],
  "tabBar": {
    "color": "#474747",
    "selectedColor": "#3B8DFF",
    "backgroundColor": "#F8F8F8",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "static/tabbar/home.png",
        "selectedIconPath": "static/tabbar/home-active.png"
      },
      {
        "pagePath": "pages/work/index",
        "text": "工作台",
        "iconPath": "static/tabbar/work.png",
        "selectedIconPath": "static/tabbar/work-active.png"
      },
      {
        "pagePath": "pages/mine/index",
        "text": "我的",
        "iconPath": "static/tabbar/mine.png",
        "selectedIconPath": "static/tabbar/mine-active.png"
      }
    ]
  }
}
```

### 测试

![](https://raw.gitmirror.com/youlaitech/images/main/docs/PixPin_2024-09-20_18-36-33.gif) 



## 按需自动导入

在传统的 Vue 开发中，我们通常需要在每个页面手动导入 Vue 组合式 API（如 `ref`, `reactive`, `onMounted` 等）。随着项目的增大，手动导入会增加代码的冗余度，降低开发体验。

通过对比，来看一下手动导入与按需自动导入的区别：

| 手动导入                                                     | 按需自动导入                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| ![手动导入](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20240921171309833.png) | ![按需导入](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20240921171422590.png) |

**手动导入：** 每个页面都需要显式地引入 `ref`, `reactive`, `onMounted` 等组合式 API。
**按需自动导入：** 配置了自动导入插件后，这些 API 无需显式导入即可直接使用，减少了重复代码，提高了开发效率。

由于当前还未整合按需自动导入插件，所以右图的代码仍然报错，提示未找到 `ref` 和 `reactive` 的定义。这展示了按需自动导入的重要性：一旦整合插件，这类错误将被消除，代码更加简洁易维护。

### 安装依赖

首先使用以下命令安装 `unplugin-auto-import` 插件：

```bash
pnpm add -D unplugin-auto-import
```

### 配置自动导入

接着，在 `vite.config.ts` 中配置 `unplugin-auto-import` 插件，确保 Vue 和 UniApp 的 API 能够自动按需导入。

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import AutoImport from "unplugin-auto-import/vite";

export default defineConfig(async () => {
  return {
    plugins: [
      uni(), // 这里是你的 uni-app 插件
      AutoImport({
        imports: ["vue", "uni-app"], // 自动导入 Vue 和 UniApp 的 API
        dts: "src/types/auto-imports.d.ts", // 自动生成类型声明文件
        eslintrc: {
          enabled: true, // 生成 ESLint 配置文件
          filepath: './.eslintrc-auto-import.json', // ESLint 配置文件路径
        },
      }),
    ],
  };
});
```

### 配置 ESLint 规则

为了让 ESLint 能识别这些通过 `unplugin-auto-import` 自动导入的 API，需要在 ESLint 的配置中引入 `unplugin-auto-import` 生成的 `.eslintrc-auto-import.json` 文件。

在 ESLint 9.x 版本中，使用 Flat Config 时不再支持 `extends` 关键字。因此，**不能**使用以下配置：

```typescript
// 错误示例
export default [
  {
    extends: ["./.eslintrc-auto-import.json"], // 这种扩展方式在 Flat Config 中不再支持
  },
];
```

![](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240923123316040.png) 

取而代之的是直接引入 `.eslintrc-auto-import.json` 文件内容，通过解析文件的方式将自动导入的全局变量配置整合进 ESLint 配置。

在 `eslint.config.mjs` 中添加如下配置：

```typescript
// eslint.config.mjs 正确的配置
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// 动态读取 .eslintrc-auto-import.json 文件内容
const autoImportConfig = JSON.parse(
  readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), ".eslintrc-auto-import.json"),
    "utf-8",
  ),
);
export default [
  {
   // 语言选项配置，定义全局变量
    languageOptions: {
      globals: {
      	// ...
        ...autoImportConfig.globals, // 自动导入的全局变量
      },
    },
  },
];
```

这样配置后，ESLint 将能够识别通过自动导入的 API，避免例如 `'ref' is not defined` 这样的错误，从而使项目的开发更加顺畅。

### 测试

通过上述步骤配置后，原先在未手动导入情况下报错的页面，现在可以正常使用 `ref`, `reactive` 等 API，而无需显式导入。

以下是最终的效果：

![按需自动导入](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20240921182221737.png) 

整合按需自动导入后，你将不再需要在每个页面显式导入 Vue 或 UniApp 的组合式 API，大幅度减少了重复的代码，提升了开发体验。

## 环境变量

> Vite 环境变量主要是为了区分开发、测试、生产等环境的变量

下面的整合过程参考 [Vite 环境变量配置官方文档 ](https://cn.vitejs.dev/guide/env-and-mode.html)

### 配置环境变量

项目根目录新建 `.env.development` 、`.env.production`

- 开发环境变量配置：.env.development

  ```properties
  # 变量必须以 VITE_ 为前缀才能暴露给外部读取
  
  # 项目运行的端口号
  VITE_APP_PORT = 5173
  
  # API 基础路径，开发环境下的请求前缀
  VITE_APP_BASE_API = '/dev-api'
  
  # API 服务器的 URL
  VITE_APP_API_URL = https://api.youlai.tech
  ```

- 生产环境变量配置：.env.production

  ```properties
  # API 基础路径，生产环境下的请求前缀
  VITE_APP_BASE_API = '/prod-api'
  
  # API 服务器的 URL
  VITE_APP_API_URL = https://api.youlai.tech
  ```



 ### 智能提示

首先，在 `src/types/env.d.ts` 文件中添加环境变量的类型声明：

```typescript
// src/types/env.d.ts
interface ImportMetaEnv {
  /**
   * 应用端口
   */
  VITE_APP_PORT: number;
  /**
   * API 基础路径
   */
  VITE_APP_BASE_API: string;
  /**
   * API 服务器的 URL
   */
  VITE_APP_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

确保 TypeScript 编译器使用的模块系统支持 `import.meta`。在 `tsconfig.json` 文件中，你可以指定 `es2020`、`es2022` 或 `esnext` 等模块系统。例如：

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "esnext",  // 支持 import.meta
    // ...
  }
}
```

在任意页面中测试 `import.meta` 是否能够智能提示环境变量：

```typescript
console.log(import.meta.env.VITE_APP_PORT);
```

![](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240923150054556.png) 



## 整合 HTTP 请求

通过一个登录案例演示如何在Uniapp中整合HTTP请求。这里未使用**axios**和**alova**请求库的原因在于，Uniapp自身提供了跨平台的**uni.request**方法，该方法在不同平台（如小程序、App和H5）下表现一致，且无需额外安装第三方库，从而减少了项目的依赖复杂性和体积。

### 封装请求工具

在 `global.d.ts` 中定义全局响应数据类型 `ResponseData`：

```typescript
// src/types/global.d.ts
declare global {
  /**
   * 响应数据结构
   */
  interface ResponseData<T = any> {
    code: string;  // 业务状态码
    data: T;       // 返回数据
    msg: string;   // 消息
  }
}
export {};
```

在 `src/utils/request.ts` 下创建一个 HTTP 请求工具，用于与 API 服务器进行通信：

```typescript
// src/utils/request.ts
export default function request<T>(options: UniApp.RequestOptions): Promise<T> {
  const token = uni.getStorageSync("token"); // 从本地缓存获取 token

  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      // VITE_APP_API_URL 是在 Vite 项目的 .env.development 文件中配置的环境变量，表示 API 的路径
      url: `${import.meta.env.VITE_APP_API_URL}${options.url}`,
      header: {
        ...options.header,
        Authorization: token,
      },
      success: (response) => {
        const resData = response.data as ResponseData<T>;
        // 业务状态码 00000 表示成功
        if (resData.code === "00000") {
          resolve(resData.data);
        } else {
          uni.showToast({
            title: resData.msg || "业务处理失败",
            icon: "none",
            duration: 2000,
          });
          reject({
            message: resData.msg || "业务处理失败",
            code: resData.code,
          });
        }
      },
      fail: (error) => {
        uni.showToast({
          title: "网络请求失败",
          icon: "none",
          duration: 2000,
        });
        reject({
          message: "网络请求失败",
          error,
        });
      },
    });
  });
}
```

**注意事项**

当首次使用该请求工具类时，可能会出现 `'uni' is not defined` 的 ESLint 错误，如下图所示：

![](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240923124237153.png) 

为解决此问题，需要在 ESLint 配置文件中定义 `uni` 为全局变量：

```javascript
// eslint.config.mjs
export default [
  {
   // 语言选项配置，定义全局变量
    languageOptions: {
      globals: {
        // ...
        ...{
          uni: "readonly", // uni-app 全局对象
        },
      },
    },
  },
];
```



### 登录接口定义

**请求URL**: https://api.youlai.tech/api/v1/auth/login

**请求参数：**

| 参数名   | 参数值 |
| -------- | ------ |
| username | admin  |
| password | 123456 |

**返回响应：**

```json
{
    "code": "00000",
    "data": {
        "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIxxx.xxxxxxx",
        "tokenType": "Bearer"
    },
    "msg": "一切ok"
}
```



根据上述登录接口信息，创建 `AuthAPI` 类用于处理登录请求：

```typescript
import request from "@/utils/request";

const AuthAPI = {
  /**
   * 登录接口
   *
   * @param username 用户名
   * @param password 密码
   * @returns 返回 token
   */
  login(username: string, password: string): Promise<LoginResult> {
    return request<LoginResult>({
      url: "/api/v1/auth/login",
      method: "POST",
      data: {
        username,
        password,
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  /**
   * 登出接口
   */
  logout(): Promise<void> {
    return request({
      url: "/api/v1/auth/logout",
      method: "DELETE",
    });
  },
};

export default AuthAPI;

/** 登录响应 */
export interface LoginResult {
  /** 访问token */
  accessToken?: string;
  /** token 类型 */
  tokenType?: string;
}

```



### 登录页面

新建 `src/pages/login/index.vue` 文件，编写登录页面及逻辑：

```vue
<template>
  <view class="flex-col">
    <input v-model="username" placeholder="请输入用户名" />
    <input v-model="password" placeholder="请输入密码" type="password" />
    <button @click="handleLogin">登录</button>
  </view>
</template>

<script lang="ts" setup>
import AuthAPI, { LoginResult } from '@/api/auth';

const username = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = async () => {
  try {
    const response: LoginResult = await AuthAPI.login(username.value, password.value);
    if (response.accessToken) {
      uni.setStorageSync('token', response.accessToken);
      uni.showToast({ title: '登录成功', icon: 'success' });
    } else {
      uni.showToast({ title: '登录失败', icon: 'none' });
    }
  } catch (err) {
    uni.showToast({ title: '登录失败', icon: 'none' });
  }
};
</script>

<style scoped>
</style>
```

在 `pages.json` 文件中，声明登录页面的路由：

```json
// src/pages.json
{
  "pages": [
    {
      "path": "pages/login/index",
      "style": {
        "navigationBarTitleText": "登录"
      }
    }
  ]
}
```



### 登录测试

访问登录页面：http://localhost:5173/#/pages/login/index，输入用户名和密码 (`admin`/`123456`) 测试登录接口，登录成功后可以看到返回的访问令牌。

![](https://raw.gitmirror.com/youlaitech/image/main/blog/PixPin_2024-09-22_17-21-05.gif)

### 整合源码

整合`HTTP请求`代码版本：[vue-uniapp-template#737f6a](hhttps://gitee.com/youlaiorg/vue-uniapp-template/commit/737f6a3ee5217dcad006fa06b6fae63374d9826b)。



## 整合 Pinia

> Pinia 是 Vue 的状态管理库，专为跨组件或页面共享状态设计。

- **Pinia 官方文档**: https://pinia.vuejs.org/zh/getting-started.html

  ![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20240921102456261.png)

### 安装依赖

首先，安装 `pinia` 依赖：

```bash
pnpm add pinia
```

### 全局注册

在项目的 `src` 目录下创建 `store` 文件夹，并新建 `index.ts` 文件，初始化并注册 Pinia 实例。

```typescript
// src/store/index.ts
import type { App } from "vue";
import { createPinia } from "pinia";

const store = createPinia();
// 注册 Pinia
export function setupStore(app: App<Element>) {
  app.use(store); // 全局注册 Pinia
}
```

接着，将 `store` 在项目入口文件 `main.ts` 中引入，并将其作为全局插件传递给应用：

```typescript
// src/main.ts
import { createSSRApp } from "vue";
import App from "./App.vue";

import { setupStore } from "@/store";

export function createApp() {
  const app = createSSRApp(App);
  // 全局注册 store
  setupStore(app);

  return {
    app,
  };
}

```

接下来，我们通过 Pinia 管理登录状态和用户信息，并在多个页面共享状态。

### 用户信息接口

编写一个 API 来获取当前登录用户的信息：

```typescript
import request from "@/utils/request";

const USER_BASE_URL = "/api/v1/users";

const UserAPI = {
  /**
   * 获取当前登录用户信息
   *
   * @returns 登录用户昵称、头像信息，包括角色和权限
   */
  getUserInfo(): Promise<UserInfo> {
    return request<UserInfo>({
      url: `${USER_BASE_URL}/me`,
      method: "GET",
    });
  },
};
export default UserAPI;

/** 登录用户信息 */
export interface UserInfo {
  /** 用户ID */
  userId?: number;

  /** 用户名 */
  username?: string;

  /** 昵称 */
  nickname?: string;

  /** 头像URL */
  avatar?: string;

  /** 角色 */
  roles: string[];

  /** 权限 */
  perms: string[];
}
```



### 用户状态管理

通过 Pinia 定义 `user` 模块，管理登录状态、用户信息等。

```typescript
//  src/store/module/user.ts
import { defineStore } from "pinia";
import AuthAPI from "@/api/auth";
import UserAPI, { UserInfo } from "@/api/user";

export const useUserStore = defineStore("user", () => {
  // 确保 token 是响应式的
  const token = ref<string>(uni.getStorageSync("token") || "");
  const userInfo = ref<UserInfo | null>(null);

  // 登录
  const login = async (username: string, password: string) => {
    const { tokenType, accessToken } = await AuthAPI.login(username, password);
    token.value = `${tokenType} ${accessToken}`; // Bearer token
    uni.setStorageSync("token", token.value);
  };

  // 获取用户信息
  const getUserInfo = async () => {
    const info = await UserAPI.getUserInfo();
    userInfo.value = info;
  };

  // 登出
  const logout = async () => {
    await AuthAPI.logout();
    userInfo.value = null;
    token.value = ""; // 清空 token
    uni.removeStorageSync("token"); // 从本地缓存移除 token
  };

  return {
    token,
    userInfo,
    login,
    logout,
    getUserInfo,
  };
});
```

### 个人中心页面

个人中心页面展示用户的头像和昵称，未登录时引导用户去登录。

```vue
<template>
  <view class="flex-center flex-col">
    <text class="text-blue font-bold text-lg">我的</text>

    <!-- 判断是否已登录 -->
    <template v-if="isLoggedIn">
      <image :src="userInfo?.avatar" class="w100 h100 mb-5 rounded-full" />
      <text class="text-lg font-bold">{{ userInfo?.nickname }}</text>
      <button @click="handleLogout" class="mt-5">退出登录</button>
    </template>

    <!-- 未登录时显示去登录按钮 -->
    <template v-else>
      <text>您还未登录，请先登录</text>
      <button @click="goToLoginPage" class="mt-5">去登录</button>
    </template>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user";

// 使用 pinia
const userStore = useUserStore();

const isLoggedIn = computed(() => userStore.token);
const userInfo = computed(() => userStore.userInfo);

// 跳转到登录页面
const goToLoginPage = () => {
  uni.navigateTo({ url: "/pages/login/index" });
};

// 退出登录处理
const handleLogout = async () => {
  await userStore.logout();
  uni.showToast({ title: "已退出登录", icon: "success" });
};
</script>
```

登录页通过 `Pinia` 实现用户信息的全局状态管理，并在登录成功后跳转到个人中心页面。

```vue
<template>
  <view class="flex-col items-center">
    <input v-model="username" placeholder="请输入用户名" />
    <input v-model="password" placeholder="请输入密码" type="password" />
    <button class="mt-5" @click="handleLogin">登录</button>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user";

// 登录表单
const username = ref("admin");
const password = ref("123456");

// 使用 pinia
const userStore = useUserStore();

// 登录处理
const handleLogin = async () => {
  await userStore.login(username.value, password.value);

  if (!!userStore.token) {
    await userStore.getUserInfo(); // 登录成功后获取用户信息
    uni.showToast({ title: "登录成功", icon: "success" });
    uni.navigateBack(); // 登录成功后返回上一页
  } else {
    uni.showToast({ title: "登录失败", icon: "none" });
  }
};
</script>

<style scoped>
input {
  width: 80%;
  padding: 10px;
  margin-top: 16px;
  border: 1px solid #ccc;
}
</style>
```



### 测试效果

登录后，个人中心会显示用户的头像和昵称。通过 Pinia 实现了登录状态的共享和跨页面传递。

![](https://raw.gitmirror.com/youlaitech/image/main/blog/PixPin_2024-09-22_17-21-011.gif)



### 整合源码

整合`Pinia`代码版本：[vue-uniapp-template#737f6a3](https://gitee.com/youlaiorg/vue-uniapp-template/commit/737f6a3ee5217dcad006fa06b6fae63374d9826b)。

## 反向代理

在开发中，若服务端没有启用 CORS（跨域资源共享），浏览器会基于安全策略拦截跨域请求，导致无法访问接口。为了绕过这个问题，我们可以通过 Vite 的反向代理功能，将开发阶段的请求代理到真实的 API 服务器上，伪装成同源请求。

本节将介绍如何配置 Vite 的反向代理来处理跨域请求。

---

### 环境变量配置

我们将通过环境变量来管理项目端口和 API 请求地址，以下是 `.env.development` 中的相关配置：

```bash
# .env.development

# 项目运行的端口号
VITE_APP_PORT=5173

# API 请求的基础路径（开发环境）
VITE_APP_BASE_API=/dev-api

# 真实 API 服务器的 URL
VITE_APP_API_URL=https://api.youlai.tech
```

### 请求工具的调整

为了让请求走代理，我们需要在请求工具中将 `VITE_APP_API_URL` 替换为 `VITE_APP_BASE_API`。这样，所有对 `API` 的请求都会通过代理标识 `/dev-api` 进行转发。

```typescript
export default function request<T>(options: UniApp.RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      // 原请求方式: 使用真实 API URL
      // url: `${import.meta.env.VITE_APP_API_URL}${options.url}`, // 示例: https://api.youlai.tech/login
      
      // 修改后：使用代理标识，实际转发到真实 API
      url: `${import.meta.env.VITE_APP_BASE_API}${options.url}`, // 示例: http://localhost:5173/dev-api/login
    });
  });
}
```

### Vite 反向代理配置

接下来，在 `vite.config.ts` 中添加反向代理配置，将 `/dev-api` 的请求代理到 `VITE_APP_API_URL`，通过 `http-proxy` 实现请求的转发。

```typescript
// vite.config.ts
import { defineConfig, UserConfig, ConfigEnv, loadEnv } from "vite";

export default defineConfig(async ({ mode }: ConfigEnv): Promise<UserConfig> => {
  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      host: "0.0.0.0",
      port: +env.VITE_APP_PORT,
      open: true,
      // 反向代理配置
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_APP_API_URL, // 目标服务器
          changeOrigin: true,           // 支持跨域
          rewrite: (path) => path.replace(new RegExp("^" + env.VITE_APP_BASE_API), ""), // 去掉前缀
        },
      },
    },
    plugins: [
      // 插件配置...
    ],
  };
});
```

### 测试与验证

在配置好反向代理后，浏览器发出的请求将被 Vite 的代理服务器拦截并转发至真实的 API 地址。例如，浏览器请求 `http://localhost:5173/dev-api/api/v1/auth/login` 时，Vite 会将该请求代理到 `https://api.youlai.tech/api/v1/auth/login`。

下图展示了这一过程，浏览器认为请求的 URL 与应用的主机地址一致，因此不会阻止该请求，即便真实请求已通过代理转发到外部服务器。

![反向代理跨域](https://raw.gitmirror.com/youlaitech/images/main/docs/%E5%8F%8D%E5%90%91%E4%BB%A3%E7%90%86%E8%B7%A8%E5%9F%9F.gif)

需要注意，反向代理的目标是伪装请求来源，虽然它绕过了浏览器的同源策略，但有时也会让开发者误以为请求地址错误。实际上，这是由于代理转发过程造成的表面请求地址与真实请求地址的差异。

### 整合源码

整合`反向代理`和`环境变量`代码版本：[vue-uniapp-template#272d643](https://gitee.com/youlaiorg/vue-uniapp-template/tree/272d643744b3b009a90a54e9344a0fc827f8b9fc)。

## 整合 `wot-design-uni`

`wot-design-uni` 是基于 `Vue 3` 和 `TypeScript` 构建的高质量组件库。组件库遵循 `Wot Design` 的设计规范，提供 70 多个组件，支持暗黑模式、国际化和自定义主题，旨在为开发者提供一致的 UI 交互，同时提高开发效率。

> **说明：** 本文档整合步骤基于 `wot-design-uni` 官方文档编写，建议开发者参考 [官方文档](https://wot-design-uni.pages.dev/guide/quick-use.html#npm-%E5%AE%89%E8%A3%85) 进行安装和配置，以确保组件库的正确使用。

---

### 安装依赖

根据官方文档，使用 `pnpm` 安装组件库的依赖：

```bash
pnpm add wot-design-uni
```

### 配置自动引入组件

在传统的 `Vue` 项目中，使用组件需要手动安装、引用、注册。而使用 `easycom` 可以简化这些操作。只要组件路径符合规范，就可以直接在页面中使用，无需手动导入和注册。

在 `pages.json` 文件中配置 `easycom` 自动引入：

```json
// pages.json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^wd-(.*)": "wot-design-uni/components/wd-$1/wd-$1.vue"
    }
  },
  "pages": [
    // 这里是项目已有的内容
  ]
}
```

**关于 `easycom`：**  
`easycom` 是 `uni-app` 提供的自动化引入功能，更多细节请参考 [easycom 官方文档](https://uniapp.dcloud.net.cn/collocation/pages.html#easycom)。

### Volar 支持

为了让 `Volar` 正确识别和提示全局组件，你需要在项目的 `tsconfig.json` 文件中配置全局组件类型支持：

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["wot-design-uni/global"]
  }
}
```

这将确保你在 `TypeScript` 项目中编写代码时，Volar 能提供完整的类型支持和代码提示。

### 测试组件

安装和配置完成后，你可以开始使用 `wot-design-uni` 的组件。在页面中，直接写组件标签即可，无需手动导入和注册：

```vue
<template>
  <view>
    <wd-button size="small">主要按钮</wd-button>
    <wd-button type="success" size="small">成功按钮</wd-button>
    <wd-button type="info" size="small">信息按钮</wd-button>
    <wd-button type="warning" size="small">警告按钮</wd-button>
    <wd-button type="error" size="small">危险按钮</wd-button>
  </view>
</template>
```

你将看到如下按钮效果：

![](https://raw.gitmirror.com/youlaitech/images/main/docs/image-20240925122808028.png) 

### 整合源码

整合`wot-design-uni` 代码版本：[vue-uniapp-template#a775721](https://gitee.com/youlaiorg/vue-uniapp-template/tree/a7757213f282a6414a3cf2cc13aa2c54a9479ae4)。



## 项目部署



### H5 部署

执行 `pnpm run build:h5` 命令来完成项目的打包：

```bash
pnpm run build:h5
```

打包后生成的静态文件位于 `dist/build/h5` 目录下。将该目录下的文件复制到服务器的 `/usr/share/nginx/html/vue-uniapp-template` 目录。

接下来，配置 nginx：

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    location / {
        root /usr/share/nginx/html/vue-uniapp-template;
        index index.html index.htm;
    }
    # 反向代理配置
    location /prod-api/ {
        # 将 api.youlai.tech 替换为后端 API 地址，注意保留后面的斜杠 /
        proxy_pass http://api.youlai.tech/; 
    }
}
```

这样配置完成后，就可以通过 `nginx `服务器来访问你的项目了。

### 小程序发布

### 下载工具

下载 [ HBuilder X ](https://www.dcloud.io/hbuilderx.html) 编辑器

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20241024232438606.png)



下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/stable.html)

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20241024232328575.png) 

### 获取小程序 AppID

访问 [微信公众平台](https://mp.weixin.qq.com/)申请小程序，获取 `AppID`。如果已申请，可在 `首页` → `小程序信息` → `查看详情` 查看 AppID

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20241024231827075.png)

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20241024232218176.png) 

### 配置项目

使用 HBuilder X 打开项目，修改 `manifest.json` 文件中的小程序配置，并填写获取的 AppID。

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20241024232920676.png) 

### 设置微信开发者工具

使用微信扫码登录微信开发者工具，开启服务端口：点击工具栏`设置`→`安全设置`→`安全`→`服务端口`，选择打开。

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20241024233058539.png) 

### 运行项目

在 HBuilder X 中，点击 `运行`→`运行到小程序模拟器`→`微信开发者工具`。

![image-20241024233326086](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20241024233326086.png)

项目编译完成后，微信开发者工具会自动启动并呈现页面。

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20241024233741449.png)

### 上传发布

在微信开发者工具中，点击 `上传` 将应用发布到小程序平台。

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20241024234052335.png)

![](https://raw.gitmirror.com/youlaitech/image/main/blog/image-20241024234313807.png)

### 查看效果

最后，使用手机打开小程序查看效果：

![](https://raw.gitmirror.com/youlaitech/image/main/blog/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20241024234523.jpg)  
