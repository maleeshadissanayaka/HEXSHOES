import type { Server } from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";

const server: Server = app.listen(env.port, () => {
  console.log(`HEXSHOES API running on http://localhost:${env.port}`);
});

let isShuttingDown = false;
const shutdown = (signal: NodeJS.Signals): void => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received; shutting down HEXSHOES API`);
  server.close((error) => {
    if (error !== undefined) {
      console.error("Failed to close HTTP server", error);
      process.exitCode = 1;
    }
  });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
