import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
    root: path.resolve(__dirname),
    plugins: [
        react(),
        nodePolyfills({
            include: ["buffer"],
        }) as unknown as import("vite").PluginOption, // Workaround for Plugin type incompatibility
    ],
    envDir: "../",
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "/docs": path.resolve(__dirname, "../docs"),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler",
            },
        },
    },
});
