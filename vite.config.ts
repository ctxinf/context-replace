import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwind from "@tailwindcss/vite";
import sqlocal from "sqlocal/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isGitHub = mode === 'github';
  const base = isGitHub ? '/context-replace/' : '/';

  return {
    base,
    server: {
      headers: {
        // "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "credentialless", // 更宽松
      },
    },
    plugins: [
      vue(),
      tailwind(),
      sqlocal(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "Context Protector",
          short_name: "Context Protector",
          description:
            "An offline tool to replace sensitive text in your context",
          theme_color: "#ffffff",
          // id: "/",  // 固定应用 ID
          start_url: isGitHub ? "/context-replace/" : "/",
          display: "fullscreen", // 👈 关键
          icons: [
            {
              src: isGitHub ? "/context-replace/icon-192.png" : "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable", // 关键！
            },
            {
              src: isGitHub ? "/context-replace/icon-512.png" : "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
      }),
    ],
  };
});
