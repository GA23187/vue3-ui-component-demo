# 前端组件库

> monorepo + typescript + tsx + vitest + pnpm + eslint + husky + 自动部署 + vuepress@next
## 项目初始化
- 前置条件
  - pnpm 6.24.0 (7.0后的命令有区别 必须先过滤后命令 pnpm --filter=site dev)
  - nodejs 14.17.3

- 新建 monorepo 基本结构
- 给所有的包安装依赖 在根目录运行 pnpm add vite vitest typescript -r -D
- 只给根目录安装依赖 在根目录运行 pnpm add eslint @mistjs/eslint-config-vue -DW
- 配置`eslint` 在根目录新建.eslintrc.js 文件(这种就是全局的 也可以在某个包下进行配置)
  ```
  module.exports = {
      extends: '@mistjs/eslint-config-vue',
  }
  ```
- 配置`.gitignore`
- 配置`tsconfig`
  
  - 可以借助 vue 的配置`pnpm init vue`

## ui 组件库 TODO

- 要让 ui 组件支持全局的导入(app.use 这种)或指定的组件(import {xxx} from 'ui')
  
  > 核心代码

```
// 单独的ui组件导出时需要提供install
Button.install = (app: App) => {
  app.component(Button.name, Button)
  return app
}
```

```
// ui项目导出入口需要一下配置
export * from './components'
export default {
  install(app: App) {
    for (const component in components) {
      const Comp = components[component]
      if (Comp.install)
        app.use(Comp)
    }
    return app
  },
}
```

## site 组件文档库

- 根目录新建一个 site 文件夹作为开发目录，同时修改`pnpm-workspace.yaml`添加`site`，修改完这个后需要重新`pnpm i`
- 安装 vuepress@next

  - 根据官方文档提示使用 pnpm 需要在当前包目录下创建一个`.npmrc`文件 添加如下`shamefully-hoist=true`(扁平化) [2.0.0-beta.40以上不用？]
  - 在根目录下执行`pnpm add vuepress@next --filter=site`
    - 这里会出现`miss peer webpack`类似的提示 因为 vuepress 中的 sass-loader 依赖了它，但是在我们的项目中使用的 vite 可以不管它
    - 当然可以配置忽视它，在根目录下的`package.json`中添加
    ```
      "pnpm": {
       "peerDependencyRules": {
         "ignoreMissing": [
           "webpack"
         ]
       }
     }
    ```
  - `site`文件夹根目录下添加`.gitignore` 忽略.temp .cache 文件夹
  - `site`文件夹根目录下添加`README.md`作为文档首页
  - `site`文件夹下`package.json`配置好启动文档站点的 script `"dev": "vuepress dev"`
  - 根目录下`package.json`配置 `"site": "pnpm --filter=site dev"`，这样就可以在根目录下直接运行文档站点了
  - 这时候就可以在运行启动下了,可以正常看到页面，同时`site`文件夹下会多一个`.vuepress`文件夹（后续的文档配置文件就在这下面）
  - `site`文件夹下的`.vuepress`文件夹创建`config.ts`文件
    - 安装组件预览插件`pnpm add @yanyu-fe/vuepress-plugin-code-block -D --filter=site` 在 config.ts 中引入并配置
    - 配置文档侧边导航 顶部导航，可以提前拆分出来方便维护
    > 注意vuepress更新到2.0.0-beta.40以上版本，用法发生变化 [2.0.0-beta.40](https://github.com/vuepress/vuepress-next/blob/main/CHANGELOG.md) 
    
    ```
    title:"前端组件库",
    plugins: [
        codeBlockPlugin()
    ],
    locales:{
        "/":{
            lang:"zh-CN",
            title:"ui-design",
        }
    },
    lang: "zh-CN",
    theme: defaultTheme({
        locales: {
            "/": {
                navbar: navbar.zh,
                sidebar: sidebar.zh
            }
        }
    }),
    ```
- `site`文件夹下创建`components`文件夹用于存放组件描述文档及 demo 组件

  - 这里的 demo 组件用的是我们 ui 库中封装的组件，所以还需要注册组件
  - 创建`clientAppEnhance.ts`文件 类似于 vue 项目中的 main.js 文件 用于注册组件
  - 安装依赖`pnpm add @vuepress/client -D --filter=site`
  - 安装依赖`pnpm add @vitejs/plugin-vue-jsx -D --filter=site` 因为我们的组件是 jsx 写的

    ```
    import { defineClientAppEnhance } from "@vuepress/client";
    import uiDesign from "ui-design";
    import "ui-design/style";
    console.log(uiDesign,'uiDesignuiDesignuiDesign');

    export default defineClientAppEnhance(({app})=>{
      app.use(uiDesign);
    })
    ```

  - 同时还需要修改`config.ts`文件

        bundler:viteBundler({
          viteOptions:{
              plugins:[vueJsx()],
              resolve:{
                  alias:{
                      "ui-design/style":resolve(__dirname,"../../packages/ui/src/ style.ts"),
                      "ui-design":resolve(__dirname,"../../packages/ui/src/index. ts"),
                  }
              }
          }
        })
  
## util 工具库

- 目的：让 ui 库可以直接调用 utils 库中的方法
- 在 ui 库同级下创建`utils`文件夹
- 在`utils`文件夹下创建`tsconfig.ts`文件
- 创建`src`文件夹，并在其下面再创建`tools`文件夹 (这里的结构可以自我调整)
- 打包库方法
  - `unbuild`打包库
  - 安装`pnpm add unbuild -D --filter=utils`
  - 修改 package.json 文件
    - `"main": "dist/index.cjs"` 打包格式 cjs
    - `"module": "dist/index.mjs"` 打包格式 es
    - `"types": "dist/index.d.ts"` 打包后文件声明文件
    - `"scripts": {"build": "unbuild"}`
  - 创建`build.config.ts`文件用于配置`unbuild`
    ```
    import { defineBuildConfig } from 'unbuild'
    export default defineBuildConfig({
      entries: [
        './src/index',
      ],
      declaration: true,
      rollup: {
        emitCJS: true,
      },
    })
    ```
  - 测试打包 根目录运行 `pnpm build --filter=utils`
- 在 ui 库中使用
  - 修改 ui 库中的 package.json 文件中的 dependencies 添加` "@yanyu-fe/utils": "workspace:^1.0.0"`
    - 前面那个字段是你的 utils 库下 package.json 文件 name 值 后面那个代表版本
    - 根目录下运行`pnpm i` 就会发现 ui 库 node_modules 下有了 utils 包

## 打包

es //分包 import 默认走 es6 按需加载 vite tree shaking
lib // ssr 会走 lib commonjs
dist //完整包 cdn bundle

- ui 库下新建`vite.config.ts`

  - 安装 vite 插件 根目录运行`pnpm add @vitejs/plugin-vue @vitejs/plugin-vue-jsx -D --filter=ui-design`
  - 添加如下配置，`package.json定义`"build": "vite build",运行就可以看到打包后的文件了，但是发现少了.d.ts声明文件
  ```
  import { defineConfig } from 'vite'
  import vueJsx from '@vitejs/plugin-vue-jsx'
  import vue from '@vitejs/plugin-vue'
  
  export default defineConfig({
    build: {
      target: 'modules',
      outDir: 'es',
      emptyOutDir: false,
      minify: false,
      rollupOptions: {
        external: [
          'vue',
          '@ga23187/utils',
        ],
        input: ['src/index.ts'],
        output: [
          // esm
          {
            format: 'es',
            dir: 'es',
            entryFileNames: '[name].js',
            preserveModules: true,
            preserveModulesRoot: 'src',
          },
          // cjs
          {
            format: 'cjs',
            dir: 'lib',
            entryFileNames: '[name].js',
            preserveModules: true,
            preserveModulesRoot: 'src',
          },
        ],
      },
      lib: {
        entry: 'src/index.ts',
        formats: ['es', 'cjs'],
      },
    },
    plugins: [
      vue(),
      vueJsx(),
    ],
  })

  ```
  - 借助vite插件 根目录运行`pnpm add vite-plugin-dts -D --filter=ui-design`
    - 在`vite.config.ts`中引入`import dts from 'vite-plugin-dts'` 修改 plugins添加 dts()
    - 在lib和es下都生成.d.ts文件 但其实只需要es下就可以了 因为我们可以在package.json文件下指定types位置
      dts({
        entryRoot: 'src',
        outputDir:'es'
      })
      dts({
        entryRoot: 'src',
        outputDir:'lib'
      })
  - 测试打包发现就有了.d.ts文件
  - 修改package.json文件
    ```
    "main": "lib/index.js",
    "module": "es/index.js",
    "types": "es/index.d.ts",
    "files": [ // 为npm 发布准备 只会发布这几个目录
      "lib",
      "es",
      "dist"
    ],
    ```

  - 根目录下新建`.eslintignore`文件 忽略packages/ui/lib packages/ui/es dist
  - `ui`文件夹根目录下添加`.gitignore` 忽略es lib文件夹


## 工作流
### 代码提交规范检查
> // 如果新增了一个文件，那么必须要用 git add 命令跟踪新文件，再用 git commit -m 命令提交暂存区的文件；
> 如果只是修改了已跟踪的文件，那么可以用 git commit -am 命令一起完成“提交文件到暂存区、提交暂存区的文件”
> git commit -am "update"

> 根据功能模块去提交代码
> feat: 新特性或者新功能
  fix: 修复 bug
  chore: 构建过程或者其他无关的改动
  refactor: 重构
  ci: 持续集成,自动部署
  注意：feat: xxx这里是英文:并且有空格与后面文字隔开1

- 根目录运行`pnpm add husky -Dw` `pnpm add @commitlint/cli @commitlint/config-angular`
- 根目录新建 `.commitlintrc.js`
  - 在`.eslintignore`中新增.commitlintrc.js
  - 配置`commitlintrc.js`
  ```
  module.exports = {
    extends:[
        "@commitlint/config-angular"
    ]
  };
  ```
  - `pnpm i`一下？
  - 修改package.json中的script添加`"prepare": "husky install"`
  - 运行一下会发现多个`.husky`文件夹
  - 配置下
    
    - 根目录运行`npx husky add .husky/commit-msg 'npx commitlint --edit'`会在`.husky`文件夹下生成一个`commit-msg`文件
      - 注意windows下上面这个指令的后面写入内容到问文件中无效，需要先创建文件再手动写入命令
      - https://blog.csdn.net/qq_41308489/article/details/121734786
  - 提交测试下
    - 发现失败 提示`type must be one of [build,ci ,docs ...]`,修改下`commitlintrc`配置,添加
    ```
    rules:{
        'type-enum':[
            2,
            'always',
            [
                'build',
                'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'chore'
            ]
        ]
    }
    ```

    - 踩坑`git commit -m 'feat: 单引号提交报错'`信息如下

      `error: pathspec '123'' did not match any file(s) known to git`

      - 需要双引号包裹

      - https://blog.csdn.net/watercatmiao/article/details/81396088
### eslint规则检查
- 根目录运行`pnpm add lint-staged -Dw` 安装lint-staged 用于提交时进行eslint检查

- `package.json`中配置下
  ```
    "lint-staged": {
    "*.{ts,tsx,vue}": "eslint . --fix"
    },
  ```
  
- 配置提交前检查钩子 `npx husky add .husky/pre-commit 'npx --no-install lint-staged'`会在`.husky`文件夹下生成一个`pre-commit`文件

- 提交测试运行 发现多了` eslint . --fix`等等步骤


### 补充TODO

- 可以借助一个插件`commitizen`实现符合格式的commit信息
- https://www.cnblogs.com/qdlhj/p/14579218.html

### vitest简单使用
- 之前已经在所以包下安装了`vitest` utils库下新建一个test文件夹 书写test用例


## 部署
- github pages
- github中的settings下pages开启
- 根目录创建`.github/workflows/site.yaml`文件
  - github/actions使用
  - 修改vueprss配置文件 打包后的路径`/vue3-ui-component-demo/`就是上面我们的git仓库名
  ```
    base: process.env.NODE_ENV === "production" ? "/vue3-ui-component-demo/" : "/",
  ```
  - `site.yaml`文件
  ```
  name: site
  on:
    push:
      tags:
        - site*

  jobs:
    site:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - uses: pnpm/action-setup@v2.1.0
          with:
            version: 7
        - uses: actions/setup-node@v3
          with:
            node-version: 16
        - run: pnpm install --no-frozen-lockfile
        - run: pnpm site:build
        - uses: crazy-max/ghaction-github-pages@v2
          with:
            target_branch: gh-pages
            build_dir: site/.vuepress/dist
          env:
            GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    "packageManager": "pnpm@7.0.0",
  ```
  - 提交代码
  - 本地打tag `git tag site@v0.0.1` 提交分支触发部署`git push origin site@v0.0.1`
  - 测试github pages
## pnpm 升级到7
  - `pnpm up -r` 升级依赖
  - 重新安装依赖发现`@babel/traverse 7.17.10`被撤包了，需要在package.json重写包
  ```
    "resolutions": {
      "@babel/traverse": "7.17.9"
    }
  ```
 - `pnpm add vue -F site`


 ## less打包
 ### nodejs脚本实现迁移style文件 与 把less文件编译成css文件
 - ui库下的`src`下创建`style`文件夹,里面创建`index.less`入口文件 `dark.less`暗黑模式 `default.less`默认模式
 - 参考`@ant-design/colors`这个颜色包 然后通过nodejs修改达到自己想要的`colors.less`
  - 根目录运行`pnpm add @ant-design/colors -D -F ui-design`
  - ui库下的`src`下新建script文件夹 创建`genColor.ts`
  - 根目录运行 `pnpm add esno -D -F ui-design` 通过这个工具去直接运行ts文件
  - 修改ui库下`package.json`下的script新增`"genColor": "esno scripts/genColor.ts"`（用于生成自定义颜色）
  ```
      import { promises as fs } from 'fs'
      import { blue, generate, gold, green, red } from '@ant-design/colors'
      import { dir_path } from './tools'

      const genColor = (color: string, prefix = 'blue') => {
        const colors = generate(color)
        const darkColors = generate(color, {
          theme: 'dark',
          backgroundColor: '#222728',
        })
        // 默认颜色
        let code = `@${prefix}-base: ${colors[5]};\n`
        for (let i = 0; i < colors.length; i++) {
          if (i === 5)
            code += `@${prefix}-${i + 1}: @${prefix}-base;\n`
          else
            code += `@${prefix}-${i + 1}: ${colors[i]};\n`
        }
        // 暗黑颜色
        code += `\n\n@${prefix}-dark-base: ${darkColors[5]};\n`
        for (let i = 0; i < darkColors.length; i++) {
          if (i === 5)
            code += `@${prefix}-dark-${i + 1}: @${prefix}-dark-base;\n`
          else
            code += `@${prefix}-dark-${i + 1}: ${darkColors[i]};\n`
        }
        return code
      }

      const run = async() => {
        let code = ''
        // 主色
        code += genColor(blue[5], 'blue')
        code += '\n\n'
        // 警告
        code += genColor(gold[5], 'gold')
        code += '\n\n'
        // 成功
        code += genColor(green[5], 'green')
        code += '\n\n'
        // 失败
        code += genColor(red[5], 'red')
        code += '\n\n'

        // 生成一个colors.less的文件放到src/style文件夹下
        // dir_path =>自定义的reslove(__dirname,'../src/style/colors.less')
        await fs.writeFile(dir_path('../src/style/colors.less'), code, 'utf8')
      }

      run()

  ```
  - scripts下新建tool.ts文件 主要是es模式下没有`__dirname` cjs下才有这个 
  ```
    import { dirname, resolve } from 'path'
    import { fileURLToPath } from 'url'

    export const __dirname = dirname(fileURLToPath(import.meta.url))
    export const dir_path = (...args: string[]) => resolve(__dirname, ...args)
    export const SRC_DIR = dir_path('../src')
    export const ES_DIR = dir_path('../es')
    export const LIB_DIR = dir_path('../lib')
  ```
- 完善button组件样式
  - button文件夹下新建style文件夹 在style下新建`index.ts` `index.less`
  - `index.ts`中引入`index.less` 这个文件为后期的样式按需加载做准备
  - `index.less`
    ```
      @import "../../style/index.less";
      @btn-prefix:~"@{ui-prefix}-btn";
      .@{btn-prefix}{
        &-primary{
          background: @primary-color;
        }
      }
    ```
  - 修改下`button.tsx`文件 定义class
- 到这里我们发现其实button组件并没有引入对应的样式文件,可以ui库`src`下新建`style.ts`文件导出组件样式文件`import './button/style'` 在其他地方使用时，只有引入这个`style.ts`文件就会联动的引入button的样式
- site站点使用样式
  - `config.ts`修改配置`viteOptions.resolve.alias下` 新增`"ui-design": resolve(__dirname, "../../packages/ui/src/index.ts"),`
  - `clientAppEnhance.ts`文件新增引入 `import "ui-design/style";`
  - 根目录运行`pnpm add less -D -F site` 添加less支持
  - 同时注意在vuepress中的前缀和我们ui中定义的是不一样的,需要覆盖下修改vuepress的`config.ts`中的viteOptions
    ```
      css: {
        preprocessorOptions: {
          less: {
            modifyVars: {
              "html-dark-selector": "~'html.dark'",
            },
          },
        },
      },
    ```



- 移动less文件到打包后的文件中 同时生成css文件
  - 根目录运行`pnpm add cpy -D -F ui-design` 移动文件库 `pnpm add fast-glob -D -F ui-design`查找文件库
  `pnpm add @types/less @types/node -D -F ui-design` less与node类型包
  - ui库下的`src`下的script文件夹下创建`bundleLess.ts`
  - 修改ui库下`package.json`下的script新增`"bundleLess": "esno scripts/bundleLess.ts"`
  ```
    import { promises as fs } from 'fs'
    import { dirname, resolve } from 'path'
    import cpy from 'cpy'
    import fg from 'fast-glob'
    import less from 'less'
    import { ES_DIR, LIB_DIR, SRC_DIR } from './tools'

    export const bundleLess = async() => {
      // 将src下面的所有less文件按照原路径移动到es与lib文件加下
      await cpy(`${SRC_DIR}/**/*.less`, ES_DIR)
      await cpy(`${SRC_DIR}/**/*.less`, LIB_DIR)

      // 获取所有的index.less文件
      const lessFiles = await fg('**/index.less', {
        cwd: SRC_DIR,
        onlyFiles: true,
      })
      // less文件转css文件
      for (const lessFile of lessFiles) {
        const filePath = `${SRC_DIR}/${lessFile}`
        const lessContent = await fs.readFile(filePath, 'utf8')
        const code = await less.render(lessContent, {
          paths: [SRC_DIR, dirname(filePath)],
        })
        await fs.writeFile(resolve(ES_DIR, lessFile.replace('.less', '.css')), code.css)
        await fs.writeFile(resolve(LIB_DIR, lessFile.replace('.less', '.css')), code.css)
      }
    }

    bundleLess()
  ```

### 更新vuepress@next
> 因为2.0.0-beta44更新了.vuepress/clientAppEnhance.{js,ts} has been renamed to .vuepress/client.{js,ts}
- 根目录运行`pnpm up -r`
- 修改`clientAppEnhance.ts`文件名为`client.ts`,并修改里面的方法

### 样式打包
- ui库下新建`vite.config.style.ts`文件用于样式打包配置
  ```
  import { defineConfig } from 'vite'
  import fg from 'fast-glob' 

  // 需要打包的文件
  const files = fg.sync('**/style/index.ts', {
    cwd: process.cwd(),
    onlyFiles: true,
  })

  export default defineConfig({
    build: {
      target: 'modules',
      outDir: 'es',
      emptyOutDir: false,
      minify: false,
      rollupOptions: {
        external: /\.less$/, // 忽略.less结尾文件
        input: files,
        output: [
          // esm
          {
            format: 'es',
            dir: 'es',
            entryFileNames: '[name].js',
            preserveModules: true,
            preserveModulesRoot: 'src',
          },
          // cjs
          {
            format: 'cjs',
            dir: 'lib',
            entryFileNames: '[name].js',
            preserveModules: true,
            preserveModulesRoot: 'src',
          },
        ],
      },
      lib: {
        entry: '',
        formats: ['es', 'cjs'],
      },
    }
  })
  ```
- ui库下修改package.json文件新增script`"bundleStyle": "vite build --config vite.config.style.ts"`
- 运行测试bundleStyle
  - es/button/style/index.js
    ```
      import "./style/index.less";
      import "../../index.less";
    ```
- 按需引入的二种方式 引入index.less 或者index.css,但目前我们打出的包中index.js只提供了导出less文件
- 所以我们接下来可以借助插件实现 另外打包出一个和index.js类似只是导出的是css文件
- 修改vite.config.style.ts 利用插件
    ```
      plugins: [
          {
            name: 'vite-plugin-style',
            generateBundle(config, bundle) {
              const keys = Object.keys(bundle)
              for (const key of keys) {
                const bundler: any = bundle[key]
                // 输出文件（rollup内置方法）
                this.emitFile({
                  type: 'asset',
                  fileName: key.replace('index.js', 'css.js'),
                  source: bundler.code.replace(/\.less/g, '.css'),
                })
              }
            },
          },
      ]
    ```
- 运行测试bundleStyle
  
  - 得到es/button/style/index.js | css.js

### bundle包
- ui库下新建`vite.config.bundle.ts`文件用于打包bundle配置
  ```
  import { defineConfig } from 'vite'
  import vueJsx from '@vitejs/plugin-vue-jsx'
  import vue from '@vitejs/plugin-vue'

  export default defineConfig({
    plugins: [vueJsx(), vue()],
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      minify: true,
      rollupOptions: {
        external: [
          'vue',
          '@ga23187/utils',
        ],
        output: {
          exports: 'named',
          globals: {
            'vue': 'Vue',
            '@ga23187/utils': 'yanyuUtils',
          },
        },
      },
      lib: {
        entry: 'src/index.ts',
        formats: ['umd', 'cjs', 'es'],
        name: 'uiDesign',
      },
    },
  })

  ```
- ui库下修改`package.json`文件新增script`"bundle": "vite build --config vite.config.bundle.ts"`
- 测试打包 bundle
  - 发现出现dist/ui-design.cjs.js | ui-design.es.js | ui-design.umd.js 3种格式的包
  - 其中es模式的包未被压缩，需要借助插件实现压缩
  - 注意单独这个命令 其中并没有打包进去样式
- 新建`vite.config.bundle.style.ts`文件 修改package.json文件新增script`"bundleLessMin": "vite build --config vite.config.bundle.style.ts"`
  - 运行会发现 出现dist/style.css | ui-design.cjs.js | ui-design.es.js | ui-design.umd.js
  - 所以可以投机取巧下 先运行这个命令生成上面4个文件后，再运行bundle命令 替换后面的3个格式包达到bundle与样式都存在的包
  - `"bundleMin": "pnpm bundleLessMin && pnpm bundle"`

- 整理下ui库下package.json中的script
  - `pnpm add npm-run-all -D -F ui-design`
  ```
    "scripts": {
      "build:comp": "vite build", // 组件打包
      "genColor": "esno scripts/genColor.ts", // 生成基本色阶
      "bundleLess": "esno scripts/bundleLess.ts", // 移动less文件到打包文件夹 并生成css文件
      "bundleStyle": "vite build --config vite.config.style.ts", // 样式打包
      "bundle": "vite build --config vite.config.bundle.ts", // bundle
      "bundleLessMin": "vite build --config vite.config.bundle.style.ts",
      "bundleMin": "pnpm bundleLessMin && pnpm bundle",
      "build": "run-s build:comp genColor  bundleLess bundleStyle bundleMin"
    },
  ```

## 发布到npm
- 我们使用的pnpm工具 里面定义了workspace的前置包名，所以发包方式和npm发包有差异
- 注册一个npm账号
- npm 发包必须使用 npm 的源镜像如果你的 npm 源设置了淘宝镜像则需要切换回来
  - 方式一 会有点麻烦 但是其实你如果使用了nrm 镜像管理工具还是比较简单的(我们先使用这种方式)
  ```
    淘宝镜像：npm config set registry https://registry.npm.taobao.org
    npm镜像：npm config set registry https://registry.npmjs.org
  ```
  - 还有一种方式是package.json文件中添加这个配置，指定发布到的地址
    ```
      "publishConfig":{
        "registry": "https://registry.npmjs.org/"
      }
    ```
    配合下面的登录`npm login --registry=https://registry.npmjs.org/`
- 根目录下运行`npm login`会让你输入
  ```
    λ npm login
    Username: xxxx
    Password:
    Email: (this IS public) xxxxx@qq.com
    npm notice Please check your email for a one-time password (OTP)
    Enter one-time password from your authenticator app: xxxx
    Logged in as xxxx on https://registry.npmjs.org/.
  ```
- 发布`pnpm publish --filter=utils` 
  - 提示 因为本地有代码修改了还未提交
    ```
      ERR_PNPM_GIT_NOT_UNCLEAN  Unclean working tree. Commit or stash changes first.
        If you want to disable Git checks on publish, set the "git-checks" setting to "false", orrun again with "--no-git-checks".
    ```
  - 先提交下代码,接着执行发现如下错误
  ```
    npm ERR! code E402
    npm ERR! 402 Payment Required - PUT https://registry.npmjs.org/@xxxx%2futils - You must sign up for private packages
  ```
    - 原因是@前置的包是私有的 需要收费，我们可以修改下该包的package.json文件 指定其为公共的
      ```
      "publishConfig": {
        "access": "public"
      }
      ```
  - 再次发布 这次可以带上--no-git-checks `pnpm publish --filter=utils --no-git-checks`
  - 其他 补充npm包bug地址等等
  - sideEffects：让 webpack 去除 tree shaking 带来副作用的代码
    sideEffects 支持两种写法，一种是 false，一种是数组。
    - false 为了告诉 webpack 我这个 npm 包里的所有文件代码都是没有副作用的
    - 数组则表示告诉 webpack 我这个 npm 包里指定文件代码是没有副作用的
    https://github.com/happylindz/blog/issues/15
    - ui库下package.json文件添加 主要作用是webpack打包时会剔除下面列出的文件
      ```
      "sideEffects":[
        "es/**/style/**.less",
        "lib/**/style/**.less",
        "dist/**.css"
      ]
      ```
  - 其他npm发布相关指令
    - 比如判断自己是否已经登录 npm whoami
    - 参考：https://blog.csdn.net/u011194386/article/details/109714164

# 来源 github 地址

https://github.com/yanyu-fe/vue3-component-demo
