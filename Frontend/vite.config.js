import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Maps @ to src directory
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"], // Handles JS and JSX files
  },
  logLevel: "info", // Enables detailed logging for debugging
});
