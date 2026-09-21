import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    // 图片存放在项目根目录的 image 文件夹，并通过 /assets/images/* 访问。
    publicDir: 'image',
    // 相对路径同时兼容本地预览、Gitee Pages 子目录和 GitHub Pages。
    base: env.VITE_BASE_PATH || './',
    server: {
      host: true,
      port: 5173
    },
    preview: {
      host: true,
      port: 4173
    }
  }
})
