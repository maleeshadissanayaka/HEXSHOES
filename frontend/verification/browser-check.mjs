import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Lightweight Chromium verification using its native DevTools protocol.
// No browser automation library is included in the application dependencies.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const prePushReview = process.argv.includes("--pre-push-final");
const finalReview =
  process.argv.includes("--frontend-final") || prePushReview;
const premium = process.argv.includes("--premium") || finalReview;
const baseUrl =
  process.argv.find((argument) => argument.startsWith("--base-url="))?.slice(11) ??
  "http://127.0.0.1:5173";
const phase = prePushReview
  ? "pre-push-final"
  : finalReview
    ? "frontend-final"
  : premium
    ? "premium-redesign"
  : process.argv.includes("--phase1-5")
    ? "phase1-5"
    : "phase1";
const output = path.join(root, "verification", phase);
const profile = path.join(
  root,
  "node_modules",
  ".cache",
  `phase1-browser-${Date.now()}`,
);
const executable =
  process.env.HEXSHOES_BROWSER_PATH ??
  [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ].find(existsSync);
assert(
  executable,
  "Set HEXSHOES_BROWSER_PATH to an installed Chromium browser.",
);
await mkdir(output, { recursive: true });
await mkdir(profile, { recursive: true });
const browser = spawn(
  executable,
  [
    "--headless=new",
    "--remote-debugging-port=0",
    "--remote-debugging-address=127.0.0.1",
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ],
  { windowsHide: true, stdio: "ignore" },
);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const consoleErrors = [];
const networkErrors = [];
const failedResponses = [];
const mutationRequests = [];
const checks = [];

class DevTools {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 0;
    this.pending = new Map();
    this.onEvent = () => {};
    socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const request = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) request?.reject(new Error(message.error.message));
        else request?.resolve(message.result);
      } else this.onEvent(message);
    });
  }
  async send(method, params = {}) {
    const id = ++this.nextId;
    const result = new Promise((resolve, reject) =>
      this.pending.set(id, { resolve, reject }),
    );
    this.socket.send(JSON.stringify({ id, method, params }));
    return result;
  }
  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
}

let client;
try {
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      port = Number(
        (
          await readFile(path.join(profile, "DevToolsActivePort"), "utf8")
        ).split("\n")[0],
      );
      break;
    } catch {
      await pause(100);
    }
  }
  assert(port, "Browser did not start.");
  const targets = await (
    await fetch(`http://127.0.0.1:${port}/json/list`)
  ).json();
  const target = targets.find((item) => item.type === "page");
  assert(target, "No browser page target.");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  client = new DevTools(socket);
  client.onEvent = (event) => {
    if (event.method === "Runtime.exceptionThrown")
      consoleErrors.push(event.params.exceptionDetails);
    if (
      event.method === "Runtime.consoleAPICalled" &&
      event.params.type === "error"
    )
      consoleErrors.push(
        event.params.args.map((arg) => arg.value ?? arg.description),
      );
    if (event.method === "Network.loadingFailed")
      networkErrors.push({
        error: event.params.errorText,
        canceled: event.params.canceled ?? false,
      });
    if (
      event.method === "Network.responseReceived" &&
      event.params.response.status >= 400
    )
      failedResponses.push({
        status: event.params.response.status,
        url: event.params.response.url,
      });
    if (
      event.method === "Network.requestWillBeSent" &&
      !["GET", "HEAD"].includes(event.params.request.method)
    )
      mutationRequests.push({
        method: event.params.request.method,
        url: event.params.request.url,
      });
  };
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Network.enable");

  async function navigate(route) {
    await client.send("Page.navigate", {
      url: `${baseUrl}${route}`,
    });
    for (let attempt = 0; attempt < 100; attempt++) {
      const ready = await client.evaluate(
        `location.pathname + location.search === ${JSON.stringify(route)} && document.querySelectorAll('main h1').length === 1`,
      );
      if (ready) {
        await client.evaluate("document.fonts.ready.then(() => true)");
        await pause(400);
        return;
      }
      await pause(50);
    }
    throw new Error(`Route failed to render: ${route}`);
  }
  async function key(keyName, code = keyName, modifiers = 0) {
    await client.send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: keyName,
      code,
      modifiers,
      windowsVirtualKeyCode:
        {
          Tab: 9,
          Escape: 27,
          Enter: 13,
          ArrowDown: 40,
          ArrowRight: 39,
          End: 35,
          Home: 36,
        }[keyName] ?? 0,
    });
    await client.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: keyName,
      code,
      modifiers,
      windowsVirtualKeyCode:
        {
          Tab: 9,
          Escape: 27,
          Enter: 13,
          ArrowDown: 40,
          ArrowRight: 39,
          End: 35,
          Home: 36,
        }[keyName] ?? 0,
    });
  }
  async function screenshot(name, fullPage = false) {
    const metrics = await client.send("Page.getLayoutMetrics");
    const { width, height } = metrics.cssContentSize;
    const screenshot = await client.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: fullPage,
      ...(fullPage ? { clip: { x: 0, y: 0, width, height, scale: 1 } } : {}),
    });
    await writeFile(
      path.join(output, name),
      Buffer.from(screenshot.data, "base64"),
    );
  }
  async function revealPage() {
    await client.evaluate(
      `(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 60)); } window.scrollTo({ top: 0, behavior: 'instant' }); })()`,
    );
    await pause(800);
    const imagesLoaded = await client.evaluate(
      `Promise.all([...document.images].map(image => image.decode().then(() => image.naturalWidth > 0).catch(() => false))).then(results => results.every(Boolean))`,
    );
    assert(imagesLoaded, "A presentation image failed to load or decode");
  }

  const viewports = process.argv.includes("--mobile-only")
    ? [[390, 844]]
    : [[1440, 900], [1280, 800], [1024, 768], [768, 1024], [390, 844]];
  for (const [width, height] of viewports) {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await navigate("/");
    await revealPage();
    const layout = await client.evaluate(
      `({ width: innerWidth, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, title: document.title, headings: document.querySelectorAll('main h1').length, categoryColumns: getComputedStyle(document.querySelector('.categories__grid')).gridTemplateColumns, productColumns: getComputedStyle(document.querySelector('.products-grid')).gridTemplateColumns, fontsLoaded: document.fonts.check('800 20px Archivo') && document.fonts.check('400 20px "Space Grotesk"') })`,
    );
    if (layout.scrollWidth > layout.clientWidth) {
      console.log(
        await client.evaluate(
          `Array.from(document.querySelectorAll('header,main,footer,section,div,p,h1,h2,h3,a,span,form,input')).filter(node => !node.closest('.hero__visual,.category__art,.product-card__image')).map(node => ({ tag: node.tagName, class: node.getAttribute('class'), text: node.textContent.slice(0,30), left: node.getBoundingClientRect().left, right: node.getBoundingClientRect().right })).filter(node => node.right > document.documentElement.clientWidth + 1 || node.left < -1).slice(0, 50)`,
        ),
      );
      await screenshot(`overflow-${width}.png`, true);
    }
    assert(
      layout.scrollWidth <= layout.clientWidth,
      `Horizontal overflow at ${width}: ${layout.scrollWidth}`,
    );
    assert.equal(layout.headings, 1);
    checks.push({ name: `Homepage responsive ${width}px`, ...layout });
    if (width === 1440 || width === 390) {
      await screenshot(`${premium ? "home" : "homepage"}-${width}.png`);
      await screenshot(
        `${premium ? "home" : "homepage"}-${width}-full.png`,
        true,
      );
    } else {
      await screenshot(`${premium ? "home" : "homepage"}-${width}.png`);
    }
  }

  if (finalReview) {
    await navigate("/");
    const visualSearchCopy = await client.evaluate(
      `({ heading: document.querySelector('.visual-search__copy h2').innerText, label: document.querySelector('.visual-search__copy .eyebrow').innerText, disclosure: document.querySelector('.visual-search__copy p:nth-of-type(3)').innerText })`,
    );
    assert.equal(
      visualSearchCopy.heading.replace(/\s+/g, " ").trim(),
      "FIND YOUR NEXT PAIR WITH AI.",
    );
    assert(visualSearchCopy.label.toLowerCase().includes("ai foundation"));
    assert(visualSearchCopy.disclosure.includes("not connected"));
    assert(!visualSearchCopy.label.toLowerCase().includes("powered by"));
    checks.push({
      name: "Homepage Visual Search status is clear and accurate",
      ...visualSearchCopy,
    });
  }

  await client.evaluate(
    `document.querySelector('[aria-label="Open navigation"]').focus(); document.querySelector('[aria-label="Open navigation"]').click()`,
  );
  assert(
    await client.evaluate(
      `document.querySelector('.mobile-menu').open && document.body.style.overflow === 'hidden'`,
    ),
  );
  for (let i = 0; i < 14; i++) {
    await key("Tab");
    assert(
      await client.evaluate(
        `document.querySelector('.mobile-menu').contains(document.activeElement)`,
      ),
      "Menu focus escaped modal",
    );
  }
  await key("Tab", "Tab", 8);
  assert(
    await client.evaluate(
      `document.querySelector('.mobile-menu').contains(document.activeElement)`,
    ),
  );
  await pause(400);
  await screenshot("mobile-menu-390.png");
  await key("Escape");
  await pause(100);
  assert(
    await client.evaluate(
      `!document.querySelector('.mobile-menu').open && document.body.style.overflow !== 'hidden' && document.activeElement.getAttribute('aria-label') === 'Open navigation'`,
    ),
  );
  checks.push({
    name: "Mobile menu: focus trap, Shift+Tab, Escape, focus restoration, scroll lock",
    passed: true,
  });

  await client.evaluate(
    `document.querySelector('[aria-label="Open navigation"]').click(); document.querySelector('.mobile-menu a[href="/men"]').click()`,
  );
  await pause(400);
  assert(
    await client.evaluate(
      `location.pathname === '/men' && document.querySelector('.mobile-menu a.active')?.getAttribute('href') === '/men' && !document.querySelector('.mobile-menu').open && document.body.style.overflow !== 'hidden' && document.activeElement.id === 'main-content'`,
    ),
  );
  checks.push({
    name: "Mobile navigation closes menu and focuses route content",
    passed: true,
  });

  await navigate("/");
  await client.evaluate(
    `document.querySelector('[aria-label="Open navigation"]').click()`,
  );
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await pause(200);
  assert(
    await client.evaluate(
      `!document.querySelector('.mobile-menu').open && document.body.style.overflow !== 'hidden'`,
    ),
  );
  checks.push({
    name: "Mobile menu closes at desktop breakpoint",
    passed: true,
  });

  await client.evaluate(`window.scrollTo(0, 120)`);
  await pause(100);
  assert(
    await client.evaluate(
      `document.querySelector('.navbar').classList.contains('navbar--solid')`,
    ),
  );
  await client.evaluate(`window.scrollTo(0, 0)`);
  await pause(100);
  checks.push({ name: "Sticky navigation updates its scrolled state", passed: true });

  await client.evaluate(
    `document.querySelector('[aria-label="Search — preview information"]').focus(); document.querySelector('[aria-label="Search — preview information"]').click()`,
  );
  assert(
    await client.evaluate(`document.querySelector('.search-dialog').open`),
  );
  await key("Escape");
  await pause(100);
  assert(
    await client.evaluate(
      `!document.querySelector('.search-dialog')?.open && document.activeElement.getAttribute('aria-label') === 'Search — preview information'`,
    ),
  );
  checks.push({
    name: "Search preview dialog and Escape focus restoration",
    passed: true,
  });

  await client.evaluate(
    `document.querySelector('.skip-link').focus(); document.querySelector('.skip-link').click()`,
  );
  assert(await client.evaluate(`document.activeElement.id === 'main-content'`));
  checks.push({ name: "Skip link targets main landmark", passed: true });

  await client.evaluate(
    `document.querySelector('#newsletter-email').value = 'invalid'; document.querySelector('.newsletter form').requestSubmit()`,
  );
  assert(
    await client.evaluate(
      `document.querySelector('.newsletter__message').textContent === ''`,
    ),
  );
  await client.evaluate(
    `document.querySelector('#newsletter-email').value = 'preview@example.com'; document.querySelector('.newsletter form').requestSubmit()`,
  );
  assert(
    await client.evaluate(
      `document.querySelector('.newsletter__message').textContent.includes('not sent or stored') && document.querySelector('#newsletter-email').value === ''`,
    ),
  );
  checks.push({
    name: "Newsletter validates email and reports local-only preview",
    passed: true,
  });

  const links = await client.evaluate(
    `Array.from(new Set([...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(href => href.startsWith('/'))))`,
  );
  const routes = [
    ...new Set([
      ...links,
      "/shop",
      "/men",
      "/women",
      "/new-drops",
      "/product/hx-01",
      "/product/hx-02",
      "/product/hx-03",
      "/product/hx-04",
      "/visual-search",
      "/wishlist",
      "/cart",
      "/account",
      "/about",
      "/technology",
      "/contact",
      "/not-a-page",
      "/product/missing",
    ]),
  ];
  const navigationRoutes = new Set([
    "/shop",
    "/men",
    "/women",
    "/new-drops",
    "/visual-search",
    "/about",
    "/technology",
    "/contact",
  ]);
  for (const route of routes) {
    await navigate(route);
    const result = await client.evaluate(
      `(() => { const ids = [...document.querySelectorAll('[id]')].map((element) => element.id); return { title: document.title, heading: document.querySelector('main h1').textContent, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, activeNavigation: document.querySelector('.desktop-nav a.active')?.getAttribute('href') ?? null, duplicateIds: ids.length - new Set(ids).size, fontsLoaded: document.fonts.check('800 20px Archivo') && document.fonts.check('400 20px "Space Grotesk"') }; })()`,
    );
    assert(result.title.includes("HEXSHOES"));
    assert(!result.overflow, `Route overflow: ${route}`);
    const pathname = new URL(route, baseUrl).pathname;
    const expectedNavigation = navigationRoutes.has(pathname) ? pathname : null;
    assert.equal(result.activeNavigation, expectedNavigation, `Active route: ${route}`);
    assert.equal(result.duplicateIds, 0, `Duplicate IDs: ${route}`);
    assert(result.fontsLoaded, `Web fonts did not load: ${route}`);
    if (route === "/not-a-page" || route === "/product/missing")
      assert.equal(result.heading, "This path ends here.");
    checks.push({ name: `Route ${route}`, ...result });
  }

  if (premium) {
    if (finalReview) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
      const captures = [
        ["/shop", "shop-1440.png"],
        ["/men", "men-1440.png"],
        ["/women", "women-1440.png"],
        ["/new-drops", "new-drops-1440.png"],
        ["/product/hx-01", "product-1440.png"],
        ["/visual-search", "visual-search-1440.png"],
        ["/cart", "cart-1440.png"],
        ["/wishlist", "wishlist-1440.png"],
        ["/account", "account-1440.png"],
        ["/about", "about-1440.png"],
        ["/technology", "technology-1440.png"],
        ["/contact", "contact-1440.png"],
      ];
      for (const [route, name] of captures) {
        await navigate(route);
        await revealPage();
        assert(
          await client.evaluate(
            `document.documentElement.scrollWidth <= document.documentElement.clientWidth`,
          ),
          `Overflow: ${route} at 1440`,
        );
        await screenshot(name);
      }

      await client.send("Emulation.setDeviceMetricsOverride", {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await navigate("/");
      await revealPage();
      await screenshot("home-390-full.png", true);
      await navigate("/shop");
      await revealPage();
      assert(
        await client.evaluate(
          `document.documentElement.scrollWidth <= document.documentElement.clientWidth`,
        ),
        "Shop overflows at 390px",
      );
      await screenshot("shop-390.png");
      await navigate("/visual-search");
      await revealPage();
      assert(
        await client.evaluate(
          `document.documentElement.scrollWidth <= document.documentElement.clientWidth`,
        ),
        "Visual Search overflows at 390px",
      );
      await screenshot("visual-search-390.png");
      await navigate("/product/hx-01");
      await revealPage();
      assert(
        await client.evaluate(
          `document.documentElement.scrollWidth <= document.documentElement.clientWidth`,
        ),
        "Product detail overflows at 390px",
      );
      await screenshot("product-390.png");

      const responsiveRoutes = [
        "/",
        "/shop",
        "/men",
        "/women",
        "/new-drops",
        "/product/hx-01",
        "/visual-search",
        "/cart",
        "/wishlist",
        "/account",
        "/technology",
        "/contact",
      ];
      for (const [width, height] of [
        [1440, 900],
        [1280, 800],
        [1024, 768],
        [768, 1024],
        [390, 844],
      ]) {
        await client.send("Emulation.setDeviceMetricsOverride", {
          width,
          height,
          deviceScaleFactor: 1,
          mobile: false,
        });
        for (const route of responsiveRoutes) {
          await navigate(route);
          const layout = await client.evaluate(
            `({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth })`,
          );
          assert(
            layout.scrollWidth <= layout.clientWidth,
            `Overflow: ${route} at ${width}px`,
          );
          checks.push({ name: `${route} responsive ${width}px`, ...layout });
        }
      }
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
    }
    await navigate("/shop");
    await revealPage();
    await screenshot("shop-1440.png", !prePushReview);
    await client.evaluate(
      `document.querySelector('[aria-label="Quick view HEX Runner"]').focus(); document.querySelector('[aria-label="Quick view HEX Runner"]').click()`,
    );
    await pause(350);
    assert(
      await client.evaluate(
        `document.querySelector('.premium-modal').open && document.body.style.overflow === 'hidden' && document.querySelector('.quick-view').textContent.includes('Illustrative price')`,
      ),
    );
    for (let i = 0; i < 9; i++) {
      await key("Tab");
      assert(
        await client.evaluate(
          `document.querySelector('.premium-modal').contains(document.activeElement)`,
        ),
      );
    }
    await key("Tab", "Tab", 8);
    assert(
      await client.evaluate(
        `document.querySelector('.premium-modal').contains(document.activeElement)`,
      ),
    );
    await screenshot("quick-view-1440.png");
    await key("Escape");
    await pause(300);
    assert(
      await client.evaluate(
        `!document.querySelector('.premium-modal').open && document.body.style.overflow !== 'hidden' && document.activeElement.getAttribute('aria-label') === 'Quick view HEX Runner'`,
      ),
    );
    checks.push({
      name: "Quick view: focus trap, Shift+Tab, Escape, focus restoration, scroll lock",
      passed: true,
    });

    await navigate("/shop");
    await client.evaluate(
      `document.querySelector('[aria-label="Quick view HEX Runner"]').click()`,
    );
    await pause(250);
    await client.evaluate(
      `document.querySelector('.quick-view__copy > .text-link').click()`,
    );
    assert(
      await client.evaluate(
        `document.querySelector('.premium-modal').open && document.querySelector('.quick-view__copy > .text-link').getAttribute('aria-pressed') === 'true'`,
      ),
    );
    await key("Escape");
    await pause(250);
    await client.evaluate(
      `document.querySelector('[aria-label="Quick view HEX Runner"]').click()`,
    );
    await pause(250);
    await client.evaluate(`document.querySelector('.quick-view .button').click()`);
    await pause(350);
    assert(
      await client.evaluate(
        `location.pathname === '/product/hx-01' && !document.querySelector('.premium-modal').open`,
      ),
    );
    checks.push({
      name: "Quick view wishlist state and product navigation",
      passed: true,
    });

    await navigate("/shop");
    await client.evaluate(
      `document.querySelector('.product-card__image[href="/product/hx-02"]').click()`,
    );
    await pause(350);
    assert(
      await client.evaluate(
        `location.pathname === '/product/hx-02' && document.querySelector('.product-detail__code').textContent.includes('HX-02')`,
      ),
    );
    checks.push({ name: "Product card links to matching product detail", passed: true });
    await navigate("/shop");
    await client.evaluate(
      `[...document.querySelectorAll('.collection-filters button')].find(b => b.textContent === 'Trail').click()`,
    );
    await pause(150);
    assert(
      await client.evaluate(
        `location.search === '?category=trail' && document.querySelectorAll('.product-card').length === 1 && document.querySelector('.product-card h3').textContent === 'HEX Trail'`,
      ),
    );
    checks.push({ name: "Local collection direction filters", passed: true });

    await navigate("/product/hx-01");
    await client.evaluate(`document.querySelector('.product-add').click()`);
    assert(
      await client.evaluate(
        `document.querySelector('.product-detail__status').textContent.includes('Choose a presentation size') && !document.querySelector('.cart-layout')`,
      ),
    );
    const firstGalleryCaption = await client.evaluate(
      `document.querySelector('.product-gallery__caption').textContent`,
    );
    await client.evaluate(
      `document.querySelector('[aria-label="Next presentation image"]').click()`,
    );
    assert(
      await client.evaluate(
        `document.querySelector('.product-gallery__caption').textContent.includes('02') && document.querySelectorAll('.product-gallery__thumbs button').length === 3`,
      ),
    );
    await client.evaluate(
      `document.querySelector('.product-gallery__thumbs button').click()`,
    );
    assert(
      await client.evaluate(
        `document.querySelector('.product-gallery__caption').textContent === ${JSON.stringify(firstGalleryCaption)}`,
      ),
    );
    await client.evaluate(
      `document.querySelector('.product-sizes button').click(); document.querySelector('[aria-label="Decrease quantity"]').click()`,
    );
    assert(
      await client.evaluate(
        `document.querySelector('.product-sizes button').getAttribute('aria-pressed') === 'true' && document.querySelector('.product-quantity output').textContent === '1'`,
      ),
    );
    await client.evaluate(
      `document.querySelector('[aria-label="Increase quantity"]').click()`,
    );
    await pause(50);
    await client.evaluate(
      `document.querySelector('[aria-label="Increase quantity"]').click()`,
    );
    await pause(50);
    await client.evaluate(`document.querySelector('.product-add').click()`);
    assert(
      await client.evaluate(
        `document.querySelector('.product-detail__status').textContent.includes('added to your visit-only bag') && document.querySelector('.product-quantity output').textContent === '3'`,
      ),
    );
    await client.evaluate(`document.querySelector('a[aria-label="Cart"]').click()`);
    await pause(300);
    const cartSnapshot = await client.evaluate(
      `({ pathname: location.pathname, product: document.querySelector('.cart-line__details h2')?.textContent, details: document.querySelector('.cart-line__details')?.textContent, subtotal: document.querySelector('.cart-summary strong')?.textContent })`,
    );
    assert.equal(cartSnapshot.pathname, "/cart", JSON.stringify(cartSnapshot));
    assert.equal(cartSnapshot.product, "HEX Runner", JSON.stringify(cartSnapshot));
    assert(cartSnapshot.details?.includes("US 6"), JSON.stringify(cartSnapshot));
    assert.equal(cartSnapshot.subtotal, "$384", JSON.stringify(cartSnapshot));
    await client.evaluate(
      `document.querySelector('.cart-line__actions [aria-label="Decrease quantity"]').click()`,
    );
    await pause(50);
    assert(
      await client.evaluate(
        `document.querySelector('.cart-line__actions output').textContent === '2' && document.querySelector('.cart-summary strong').textContent === '$256'`,
      ),
    );
    await client.evaluate(
      `document.querySelector('.cart-line__actions [aria-label="Increase quantity"]').click()`,
    );
    await pause(50);
    assert(
      await client.evaluate(
        `document.querySelector('.cart-line__actions output').textContent === '3' && document.querySelector('.cart-summary strong').textContent === '$384'`,
      ),
    );
    await client.evaluate(`document.querySelector('.cart-line__remove').click()`);
    assert(
      await client.evaluate(
        `!!document.querySelector('.empty-collection__hero') && !document.querySelector('.cart-layout')`,
      ),
    );
    checks.push({
      name: "Product gallery, size, quantity, add-to-bag, cart subtotal, quantity, and removal",
      passed: true,
    });

    await navigate("/shop");
    await client.evaluate(
      `document.querySelector('.product-card__wishlist').click()`,
    );
    assert(
      await client.evaluate(
        `document.querySelector('.product-card__wishlist').getAttribute('aria-pressed') === 'true' && getComputedStyle(document.querySelector('.product-card__wishlist svg')).fill !== 'none'`,
      ),
    );
    await client.evaluate(`document.querySelector('a[aria-label="Wishlist"]').click()`);
    await pause(300);
    assert(
      await client.evaluate(
        `location.pathname === '/wishlist' && document.querySelectorAll('.saved-styles-grid .product-card').length === 1`,
      ),
    );
    await client.evaluate(
      `document.querySelector('.saved-styles-grid .product-card__wishlist').click()`,
    );
    assert(
      await client.evaluate(
        `!!document.querySelector('.empty-collection__hero') && !document.querySelector('.saved-styles-grid')`,
      ),
    );
    checks.push({
      name: "Wishlist save state, navigation, visible pressed style, and removal",
      passed: true,
    });

    await navigate("/visual-search");
    await revealPage();
    await screenshot("visual-search-1440.png", !prePushReview);
    await client.evaluate(
      `[...document.querySelectorAll('.sample-options button')].find(b => b.textContent === 'Terrain').click(); document.querySelectorAll('.discovery-console__stages button')[2].click()`,
    );
    await pause(150);
    assert(
      await client.evaluate(
        `document.querySelector('.discovery-console__image img').src.includes('trail') && document.querySelector('.discovery-console__explanation').textContent.includes('similarity') && document.querySelectorAll('.discovery-console__results li').length === 3`,
      ),
    );
    checks.push({
      name: "Visual search samples and pipeline explanations without simulated results",
      passed: true,
    });
    await client.send("DOM.enable");
    let documentNode = await client.send("DOM.getDocument", { depth: -1 });
    let fileInput = await client.send("DOM.querySelector", {
      nodeId: documentNode.root.nodeId,
      selector: ".discovery-console__upload input[type=file]",
    });
    await client.send("DOM.setFileInputFiles", {
      files: [path.join(root, "index.html")],
      nodeId: fileInput.nodeId,
    });
    await pause(100);
    assert(
      await client.evaluate(
        `document.querySelector('.discovery-console__explanation').textContent.includes('similarity') && document.querySelector('.discovery-console__drop [role="status"]').textContent.includes('Choose an image file')`,
      ),
    );
    documentNode = await client.send("DOM.getDocument", { depth: -1 });
    fileInput = await client.send("DOM.querySelector", {
      nodeId: documentNode.root.nodeId,
      selector: ".discovery-console__upload input[type=file]",
    });
    await client.send("DOM.setFileInputFiles", {
      files: [path.join(root, "public", "media", "presentation", "runner-320.webp")],
      nodeId: fileInput.nodeId,
    });
    await pause(150);
    assert(
      await client.evaluate(
        `document.querySelector('.discovery-console__image img').src.startsWith('blob:') && document.querySelector('.discovery-console__drop [role="status"]').textContent.includes('No upload or image analysis') && !document.querySelector('.discovery-console__results').textContent.includes('%')`,
      ),
    );
    checks.push({
      name: "Visual Search rejects non-image files and previews local images without retrieval",
      passed: true,
    });

    await navigate("/technology");
    await revealPage();
    await screenshot("technology-1440.png", !prePushReview);
    await client.evaluate(`document.querySelector('[role="tab"]').focus()`);
    await key("ArrowDown");
    assert(
      await client.evaluate(
        `document.activeElement.getAttribute('aria-selected') === 'true' && document.querySelector('[role="tabpanel"] h3').textContent === 'Recommendations.'`,
      ),
    );
    await key("End");
    assert(
      await client.evaluate(
        `document.querySelector('[role="tabpanel"]').textContent.includes('current HEX Assistant is scripted')`,
      ),
    );
    await key("Home");
    checks.push({
      name: "Roadmap tabs: arrow keys, Home, End, associated panel",
      passed: true,
    });

    await navigate("/contact");
    await client.evaluate(
      `document.querySelector('.contact-form').requestSubmit()`,
    );
    assert(
      await client.evaluate(
        `document.querySelector('.contact-status').textContent === '' && !document.querySelector('.contact-form').checkValidity()`,
      ),
    );
    await client.evaluate(
      `document.querySelector('#contact-name').value = 'Preview Visitor'; document.querySelector('#contact-email').value = 'visitor@example.com'; document.querySelector('#contact-subject').value = 'Technology conversation'; document.querySelector('#contact-message').value = 'A local contact preview for the storefront.'; document.querySelector('.contact-form').requestSubmit()`,
    );
    await pause(100);
    assert(
      await client.evaluate(
        `document.querySelector('.contact-status').textContent.includes('Nothing was sent or stored')`,
      ),
    );
    checks.push({
      name: "Contact form validation and honest local confirmation",
      passed: true,
    });

    await navigate("/");
    assert(
      await client.evaluate(
        `document.querySelectorAll('video').length === 0 && document.querySelector('.hero__preview').textContent.includes('still')`,
      ),
      "The current still-image campaign must not claim video playback",
    );
    await client.evaluate(`document.querySelector('.campaign-motion').click()`);
    assert(
      await client.evaluate(
        `getComputedStyle(document.querySelector('.hero__media')).animationPlayState === 'paused'`,
      ),
    );
    await client.evaluate(
      `document.querySelector('.hero__preview').focus(); document.querySelector('.hero__preview').click()`,
    );
    await pause(300);
    assert(
      await client.evaluate(
        `document.querySelector('.premium-modal').open && !!document.querySelector('.campaign-preview')`,
      ),
    );
    await key("Escape");
    await pause(300);
    checks.push({ name: "Campaign preview and pause control", passed: true });

    await client.evaluate(
      `document.querySelector('.assistant-launcher').focus(); document.querySelector('.assistant-launcher').click()`,
    );
    await pause(300);
    assert(
      await client.evaluate(
        `document.querySelector('#assistant-message').maxLength === 500 && document.querySelector('.hex-assistant__form button').disabled`,
      ),
    );
    await screenshot(prePushReview ? "assistant-open-1440.png" : "assistant-open.png");
    await client.evaluate(
      `[...document.querySelectorAll('.hex-assistant__suggestions button')].find(b => b.textContent.includes('visual search')).click()`,
    );
    assert(
      await client.evaluate(
        `document.querySelectorAll('.assistant-message').length === 3 && document.querySelector('[role="log"]').textContent.includes('planned for the AI integration phase')`,
      ),
    );
    await client.evaluate(`document.querySelector('#assistant-message').focus()`);
    await client.send("Input.insertText", { text: "x".repeat(550) });
    assert(
      await client.evaluate(
        `document.querySelector('#assistant-message').value.length === 500`,
      ),
    );
    await client.evaluate(
      `document.querySelector('.hex-assistant__form').requestSubmit()`,
    );
    await pause(150);
    assert(
      await client.evaluate(
        `document.querySelectorAll('.assistant-message--user p').item(document.querySelectorAll('.assistant-message--user p').length - 1).textContent.length === 500 && document.querySelector('.hex-assistant__messages').scrollTop + document.querySelector('.hex-assistant__messages').clientHeight >= document.querySelector('.hex-assistant__messages').scrollHeight - 1`,
      ),
    );
    await client.evaluate(
      `document.querySelector('#assistant-message').focus()`,
    );
    await client.send("Input.insertText", { text: "Shipping details" });
    await client.evaluate(
      `document.querySelector('.hex-assistant__form').requestSubmit()`,
    );
    await pause(150);
    assert(
      await client.evaluate(
        `document.querySelector('[role="log"]').textContent.includes('not active') && document.querySelector('#assistant-message').value === ''`,
      ),
    );
    for (let i = 0; i < 12; i++) {
      await key("Tab");
      assert(
        await client.evaluate(
          `document.querySelector('.premium-modal').contains(document.activeElement)`,
        ),
      );
    }
    await key("Escape");
    await pause(300);
    assert(
      await client.evaluate(
        `!document.querySelector('.premium-modal').open && document.activeElement.classList.contains('assistant-launcher')`,
      ),
    );
    checks.push({
      name: "Scripted assistant prompts, text input, focus trap, Escape and restoration",
      passed: true,
    });

    for (const width of [768, 390]) {
      await client.send("Emulation.setDeviceMetricsOverride", {
        width,
        height: width === 390 ? 844 : 1024,
        deviceScaleFactor: 1,
        mobile: false,
      });
      for (const route of [
        "/shop",
        "/visual-search",
        "/technology",
        "/about",
        "/contact",
        "/cart",
        "/wishlist",
      ]) {
        await navigate(route);
        await revealPage();
        assert(
          await client.evaluate(
            `document.documentElement.scrollWidth <= document.documentElement.clientWidth`,
          ),
          `Overflow: ${route} at ${width}`,
        );
        checks.push({ name: `${route} responsive ${width}px`, passed: true });
      }
      await navigate("/shop");
      await client.evaluate(
        `document.querySelector('[aria-label="Quick view HEX Runner"]').click()`,
      );
      await pause(350);
      assert(
        await client.evaluate(
          `document.querySelector('.premium-modal').getBoundingClientRect().right <= innerWidth && document.querySelector('.premium-modal').getBoundingClientRect().height <= innerHeight`,
        ),
      );
      await screenshot(`quick-view-${width}.png`);
      await key("Escape");
      await pause(300);
      await client.evaluate(
        `document.querySelector('.assistant-launcher').click()`,
      );
      await pause(350);
      assert(
        await client.evaluate(
          `document.querySelector('.premium-modal').getBoundingClientRect().right <= innerWidth && document.querySelector('.premium-modal').getBoundingClientRect().height <= innerHeight`,
        ),
      );
      await screenshot(
        prePushReview && width === 390
          ? "assistant-open-390.png"
          : `assistant-${width}.png`,
      );
      await key("Escape");
      await pause(300);
    }
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await navigate("/");
    await client.evaluate(
      `[...document.querySelectorAll('.footer__bottom button')].find(b => b.textContent === 'Privacy').click()`,
    );
    await pause(200);
    assert(
      await client.evaluate(
        `document.querySelector('.premium-modal').textContent.includes('Google Fonts')`,
      ),
    );
    await key("Escape");
    await pause(300);
    checks.push({ name: "Footer informational privacy dialog", passed: true });
  }

  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await navigate("/");
  const reducedMotion = await client.evaluate(
    `({ revealOpacity: getComputedStyle(document.querySelector('.reveal')).opacity, heroAnimationDuration: getComputedStyle(document.querySelector('.hero h1')).animationDuration })`,
  );
  assert.equal(reducedMotion.revealOpacity, "1");
  assert.equal(reducedMotion.heroAnimationDuration, "1e-05s");
  checks.push({
    name: "Reduced motion reveals content and suppresses entrance motion",
    ...reducedMotion,
  });
  assert.equal(consoleErrors.length, 0, "Browser console/runtime errors");
  assert.equal(
    failedResponses.length,
    0,
    `HTTP responses failed: ${JSON.stringify(failedResponses)}`,
  );
  assert.equal(
    networkErrors.filter((error) => !error.canceled).length,
    0,
    `Network requests failed: ${JSON.stringify(networkErrors)}`,
  );
  assert.equal(mutationRequests.length, 0, "Unexpected data submission");
  await writeFile(
    path.join(output, "browser-report.json"),
    JSON.stringify(
      {
        browser: "Installed Chromium (Edge)",
        url: `${baseUrl}/`,
        checks,
        consoleErrors,
        networkErrors,
        failedResponses,
        mutationRequests,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Passed ${checks.length} browser checks. Screenshots and report: ${output}`,
  );
  if (networkErrors.length)
    console.log(`Network failures recorded: ${JSON.stringify(networkErrors)}`);
} finally {
  if (client) {
    await client.send("Browser.close").catch(() => {});
    client.socket.close();
  }
  browser.kill();
}
