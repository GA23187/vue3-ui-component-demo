import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
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
    // 这一块是不会被使用的 真正使用的是rollup实现的打包
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    dts(),
  ],
})
