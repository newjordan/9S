import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative asset URLs in the production build so one `dist/` works on
// GitHub Pages (`/<repo>/`) and at the root of a Vercel (or any static) host.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react()],
}))
