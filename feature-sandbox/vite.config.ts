import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
import path from "path";

// Load root .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "import.meta.env.VITE_GEMINI_API_KEY": JSON.stringify(
      process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
    ),
  },
});
