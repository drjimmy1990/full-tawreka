import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        host: true,  // Expose to network (0.0.0.0)
        port: 5173
    }
})
