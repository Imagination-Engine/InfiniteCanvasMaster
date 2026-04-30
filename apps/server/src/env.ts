import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env
config({ path: resolve(__dirname, "../../../.env") });
// Also try local .env in apps/server
config({ path: resolve(__dirname, "../.env") });
