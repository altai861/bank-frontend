import { defineConfig } from "vite";
import { resolve } from "path"

export default defineConfig({
    base: "/bank-frontend/",
    build: {
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html')
          }
        }
    },
})