import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const githubPagesBase = process.env.GITHUB_PAGES === 'true' ? '/AI-RESUME-BUILDER/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base: githubPagesBase,
  plugins: [react(), tailwindcss()],
})
