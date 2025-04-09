import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        favorites: resolve(__dirname, "src/favorites/index.html"),
        compare: resolve(__dirname, "src/compare/index.html"),
        detail: resolve(__dirname, "src/detail/index.html"),
      },
    },
  },
});
