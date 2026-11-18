
import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const frontendPath = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    root: frontendPath,

    server: {
        host: "0.0.0.0",
        port: 5173,
        allowedHosts: [".ngrok-free.dev"],

        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true
            }
        }
    },

    build: {
        outDir: "dist",
        emptyOutDir: true
    }
});
