import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'dust2',
            // the proper extensions will be added
            fileName: 'dust2',
        },
        rollupOptions: {
        }
    },
})
