import path from "node:path";
import process from "node:process";
import { concurrently } from "concurrently";

const root = path.resolve(import.meta.dirname, "..");
const quote = (value) => `"${value}"`;
const node = quote(process.execPath);

const { result } = concurrently(
  [
    {
      command: `${node} node_modules/vite/bin/vite.js --host 127.0.0.1`,
      name: "FRONTEND",
      cwd: path.join(root, "frontend"),
    },
    {
      command: `${node} node_modules/tsx/dist/cli.mjs watch src/server.ts`,
      name: "BACKEND",
      cwd: path.join(root, "backend"),
    },
    {
      command: `.venv\\Scripts\\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`,
      name: "AI",
      cwd: path.join(root, "ai-service"),
    },
  ],
  {
    killOthersOn: ["failure"],
    prefix: "name",
    prefixColors: ["cyan", "magenta", "yellow"],
  },
);

try {
  await result;
} catch {
  process.exitCode = 1;
}
