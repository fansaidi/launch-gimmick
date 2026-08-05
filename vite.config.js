import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        basicSsl()
    ],
    // Deployed as a subpath on the same GitHub Pages site as the builder,
    // which now takes the root (see .github/workflows/main.yml).
    base: '/launch-gimmick/player/'
})