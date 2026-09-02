import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

// 배포된 버전 식별용 커밋 해시. Vercel 빌드에서는 VERCEL_GIT_COMMIT_SHA를 쓰고,
// 로컬 빌드에서는 현재 git HEAD를 씀 (설정 화면의 버전 표시/최신 여부 체크에 사용).
function getVersion() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
}
const appVersion = getVersion();

// dist/version.json으로 같이 배포해서, 실행 중인 클라이언트가 자기 버전과 비교해
// "최신 버전인지"를 확인할 수 있게 함.
function versionFilePlugin() {
  return {
    name: "write-version-json",
    closeBundle() {
      writeFileSync("dist/version.json", JSON.stringify({ version: appVersion }));
    },
  };
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    react(),
    versionFilePlugin(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      injectManifest: {
        // heic2any(1.3MB)는 아이폰 HEIC 사진을 올릴 때만 동적 import되는데, 프리캐시에
        // 들어가 있으면 배포할 때마다 모든 기기가 쓰지도 않을 1.3MB를 미리 받는다.
        // 필요할 때 네트워크에서 받게 두는 편이 훨씬 싸다 (업로드는 어차피 온라인 전용).
        globIgnores: ["**/heic2any-*.js"],
      },
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "favicon-16.png", "favicon-32.png", "apple-touch-icon.png"],
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        name: "오늘의 우리",
        short_name: "오늘의 우리",
        description: "커플이 함께 쓰는 캘린더 다이어리",
        theme_color: "#D98763",
        background_color: "#FBF4EE",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
});
