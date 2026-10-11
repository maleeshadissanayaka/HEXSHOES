import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const offline = process.argv.includes("--offline");
const executable = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
].find(existsSync);
assert(executable, "An installed Chromium browser is required.");
const profile = path.join(frontendRoot, "node_modules", ".cache", `visual-search-${Date.now()}`);
await mkdir(profile, { recursive: true });
const browser = spawn(executable, [
  "--headless=new", "--remote-debugging-port=0", "--remote-debugging-address=127.0.0.1",
  `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "about:blank",
], { windowsHide: true, stdio: "ignore" });
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

class DevTools {
  constructor(socket) {
    this.socket = socket; this.nextId = 0; this.pending = new Map(); this.consoleErrors = [];
    socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const pending = this.pending.get(message.id); this.pending.delete(message.id);
        if (message.error) pending?.reject(new Error(message.error.message)); else pending?.resolve(message.result);
      } else if (message.method === "Runtime.exceptionThrown") this.consoleErrors.push(message.params.exceptionDetails.text);
    });
  }
  send(method, params = {}) {
    const id = ++this.nextId;
    const result = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.socket.send(JSON.stringify({ id, method, params })); return result;
  }
  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  }
}

let client;
try {
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { port = Number((await readFile(path.join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]); break; }
    catch { await pause(100); }
  }
  assert(port, "Browser did not start.");
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = targets.find((candidate) => candidate.type === "page");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  client = new DevTools(socket);
  await client.send("Page.enable"); await client.send("Runtime.enable"); await client.send("DOM.enable");
  await client.send("Page.navigate", { url: "http://127.0.0.1:5173/visual-search" });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await client.evaluate(`location.pathname === '/visual-search' && !!document.querySelector('.discovery-console__upload input')`)) break;
    await pause(100);
  }

  async function uploadAndSearch(filename) {
    const documentNode = await client.send("DOM.getDocument", { depth: -1 });
    const input = await client.send("DOM.querySelector", { nodeId: documentNode.root.nodeId, selector: ".discovery-console__upload input[type=file]" });
    await client.send("DOM.setFileInputFiles", { files: [path.join(frontendRoot, "public", "media", "presentation", filename)], nodeId: input.nodeId });
    assert(await client.evaluate(`document.querySelector('.discovery-console__image img').src.startsWith('blob:')`));
    await client.evaluate(`document.querySelector('.discovery-console__actions .button').click()`);
  }
  async function waitFor(expression, attempts = 240) {
    for (let attempt = 0; attempt < attempts; attempt++) { if (await client.evaluate(expression)) return; await pause(250); }
    throw new Error(`Timed out waiting for: ${expression}`);
  }
  async function results() {
    return client.evaluate(`[...document.querySelectorAll('.discovery-console__results li')].map(item => ({ href: item.querySelector('a').getAttribute('href'), score: item.querySelector('strong').textContent }))`);
  }

  if (offline) {
    await uploadAndSearch("runner-960.webp");
    await waitFor(`document.querySelector('.discovery-console__drop [role="alert"]')?.textContent.includes('temporarily unavailable')`);
    assert.equal(client.consoleErrors.length, 0);
    console.log(JSON.stringify({ offlineMessage: await client.evaluate(`document.querySelector('.discovery-console__drop [role="alert"]').textContent`), consoleErrors: client.consoleErrors }, null, 2));
  } else {
    await uploadAndSearch("runner-960.webp"); await waitFor(`document.querySelectorAll('.discovery-console__results li').length === 4`);
    const runner = await results(); assert.equal(runner[0].href, "/product/hx-01");
    await uploadAndSearch("trail-960.webp"); await waitFor(`document.querySelector('.discovery-console__results li:first-child a')?.getAttribute('href') === '/product/hx-02'`);
    const trail = await results(); assert.equal(trail[0].href, "/product/hx-02");
    await client.evaluate(`(() => { const input = document.querySelector('.discovery-console__text-search input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'slide sandal'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await client.evaluate(`document.querySelector('.discovery-console__text-search').requestSubmit()`);
    await waitFor(`document.querySelector('.discovery-console__results li:first-child a')?.getAttribute('href') === '/product/hx-03'`);
    const text = await results(); assert.equal(text[0].href, "/product/hx-03");
    assert([runner, trail, text].flat().every((item) => /^Similarity -?\d+\.\d{3}$/.test(item.score)));
    assert.equal(client.consoleErrors.length, 0);
    console.log(JSON.stringify({ runner, trail, text, consoleErrors: client.consoleErrors }, null, 2));
  }
} finally {
  if (client) await client.send("Browser.close").catch(() => {}); else browser.kill();
}
