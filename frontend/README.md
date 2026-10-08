# HEXSHOES Frontend

The Phase 1 storefront foundation with a Phase 1.6 premium experience redesign: an editorial footwear presentation and reusable design system for future intelligent commerce. Cinematic local imagery, collection browsing, accessible quick views, and a scripted guide establish the visual direction. Purchasing and connected services remain future work.

## Stack

- React 19, TypeScript 6, and Vite 8
- React Router 7 through `react-router-dom`
- Plain CSS, component styles, and shared CSS design tokens
- Oxlint for linting; TypeScript strict mode and unchecked indexed access checks
- CSS animations and IntersectionObserver for restrained motion

The runtime dependency list contains only React, React DOM, and React Router DOM. There is no UI framework or animation library. Exact dependency versions are pinned in `package-lock.json`.

## Local setup

Use Node.js 24 LTS (recommended). Vite also supports Node.js 20.19+ or 22.12+.

```powershell
cd E:\HEXSHOES\frontend
npm ci
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/`. Vite may choose another port if this one is occupied; the browser verification script expects port 5173.

```powershell
npm run lint
npm run typecheck
npm run build
npm run preview -- --host 127.0.0.1
```

`build` checks TypeScript and produces `dist/`. Generated output and dependencies are ignored by Git. A future production host must serve `index.html` for application routes because the frontend uses BrowserRouter.

## Route overview

| Route                               | Current presentation                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| `/`                                 | Designed homepage                                                               |
| `/shop`                             | Local presentation collection with direction filters and quick views; recognizes `?category=run`, `trail`, `lifestyle`, or `slides` |
| `/men`, `/women`                    | Collection shells                                                               |
| `/new-drops`                        | Collection preview shell                                                        |
| `/product/:id`                      | Product concept shell for the four local fixtures; unknown IDs show 404         |
| `/visual-search`                    | Sample-image exploration and an interactive explanation of the planned pipeline |
| `/wishlist`, `/cart`               | Editorial empty states and collection inspiration; no persistence or commerce behavior |
| `/account`                         | Temporary account shell; no authentication |
| `/about`                           | Brand manifesto and cinematic movement story |
| `/technology`                      | Intended architecture, service boundaries, and interactive roadmap |
| `/contact`                         | Validated local contact-form preview; no submission |
| `*`                                 | 404 with a route back to the homepage                                           |

Every page sets a document title. Navigation changes reset scroll and focus the main landmark. Category links preserve their intended direction through the shop query parameter.

## Structure

```text
src/
├── components/
│   ├── home/          # Homepage sections and homepage styling
│   ├── layout/        # Announcement, navigation, mobile dialog, footer, skip link
│   ├── products/      # Presentation-only ProductCard
│   └── shared/        # Buttons, icons, containers, headings, reveal, shell, concept art
├── pages/             # Homepage and temporary page shells
├── data/              # Navigation, route descriptions, isolated product fixtures
├── hooks/             # Modal lifecycle/focus management and document titles
├── styles/            # Shared tokens and global styles
├── types/             # Presentation product contract
├── utils/             # Currency formatting
├── App.tsx            # Shared layout and route composition
└── main.tsx           # React and router entry point
```

## Design system

`src/styles/tokens.css` defines:

- Clean black backgrounds (`#050505`, `#08090A`, `#0B0D10`, `#101216`), white editorial surfaces (`#FFFFFF`, `#F7F7F7`), cool muted text, neutral borders, and the restrained `#3B5BFF` accent.
- The 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128px spacing scale.
- A 1360px maximum container and 40 / 28 / 20px responsive gutters.
- Restrained 2px and 4px radii, shadows, z-index layers, visible focus rings, and responsive section spacing.
- Responsive display, heading, body, and metadata type scales.
- 160 / 320 / 700ms motion durations and professional cubic-bezier easing.

Archivo handles branding and headings; Space Grotesk handles body/UI; JetBrains Mono is reserved for metadata. Google Fonts loads these with `display=swap`, preconnected origins, and local system fallbacks. External fonts require internet access; self-hosting can be considered in a later production phase.

Reusable components include AnnouncementBar, Navbar, MobileMenu, Footer, PageContainer, SectionHeader, Button, IconButton, SkipLink, PageShell, Reveal, ProductCard, QuickView, PremiumModal, CampaignMedia, PresentationImage, VisualSearchConsole, IntelligenceStory, and HexAssistant. ExperienceProvider coordinates one shared dialog surface; the existing modal lifecycle handles focus and scroll locking.

The homepage presents the hero, brand value strip, HEX philosophy, category directions, new drops preview, planned visual search, future intelligence roadmap, story, and newsletter, between the global announcement and footer.

## Presentation boundaries

`src/data/presentationProducts.ts` contains four isolated design fixtures: HX-01 / HEX Runner / $128, HX-02 / HEX Trail / $164, HX-03 / HEX Slide / $74, and HX-04 / HEX Mono / $142. Prices are illustrative USD values. The page explicitly labels these as concepts that are not available for purchase. There are no stock, size, color-availability, review, rating, sales, or accuracy claims.

The redesign reuses seven generated photographic concept compositions from Phase 1.5, isolated in `public/media/presentation/` and `src/data/presentationMedia.ts`. These are speculative presentation assets, not photographs of manufactured stock. Each has three compressed WebP variants, totaling approximately 1.57 MB across all 21 files; the browser selects the appropriate variant. Lead campaign images load eagerly with high priority; other images use lazy loading and asynchronous decoding. Explicit dimensions reserve layout space. Wishlist links open the wishlist empty state and never save anything. No additional media or runtime packages were needed for Phase 1.6.

The search utility opens an accessible explanatory dialog. Visual discovery lets visitors switch among local sample images and inspect pipeline explanations. Its ordered style thumbnails remain fixed presentation examples: no upload, retrieval, similarity scores, or simulated processing. Intelligence modules use FOUNDATION, PLANNED, and RESEARCH labels; FOUNDATION describes the frontend presentation only. No intelligence module is active. The roadmap supports pointer selection, arrow keys, Home, and End.

HEX Assistant uses deterministic local replies and suggested prompts. It sends no requests, stores no conversations, and clears when dismissed. It is explicitly identified as a scripted product guide. The contact form validates required fields and email, then displays a local preview confirmation. Newsletter submission validates email, displays a local confirmation, and clears the input. Neither form sends or stores data.

CampaignMedia currently uses the optimized hero still with a controllable slow drift. It accepts an optional local video source, with autoplay/muted/playsInline, poster fallback, playback controls, and reduced-motion fallback. No video asset or secondary product-angle photography is currently supplied.

**Backend, REST API, Firebase, authentication, AI, and commerce integrations are intentionally not implemented.** Social, shipping, privacy, and terms controls open explanatory dialogs rather than invented external destinations.

## Accessibility and motion

- Semantic header, navigation, main, sections, footer, and one primary heading per route.
- Skip link, visible keyboard focus, named utility buttons, active navigation, and labeled email input.
- Native modal dialogs with background inertness, explicit Tab/Shift+Tab looping, Escape dismissal, focus restoration, and body scroll locking.
- Mobile navigation closes when navigating or resizing to desktop.
- IntersectionObserver section reveals, staggered entrances, subtle image zoom, underline motion, and restrained button movement.
- Image crop reveals, campaign pause control, modal entrances, product quick-view affordances, and a maximum 3px pointer-responsive category image shift. Pointer depth is disabled for touch and reduced-motion preferences.
- `prefers-reduced-motion` makes reveal content immediately visible and suppresses entrance/transition motion.

## Browser verification and visual review

Start the Vite server on port 5173, then run:

```powershell
npm run verify:browser -- --premium
```

This uses Node's built-in WebSocket support and Chromium's DevTools protocol. It launches installed Microsoft Edge or Chrome headlessly, with a disposable profile under ignored `node_modules/.cache/`. It adds no automation dependency. On other systems, set `HEXSHOES_BROWSER_PATH` to an installed Chromium executable. The server must already be running.

The script checks the homepage at 1440, 1280, 1024, 768, and 390px; horizontal overflow; routes and internal links; 404s; titles; mobile focus and scroll lock; dialogs; the skip link; newsletter state; reduced motion; console exceptions; and unexpected mutation requests. The premium suite also checks quick-view focus handling, collection filtering, sample/pipeline controls, keyboard roadmap tabs, contact validation, campaign controls, scripted assistant input, and secondary-page layouts at tablet/mobile widths.

Phase 1.6 review artifacts are stored under `verification/premium-redesign/`, including requested full homepage screenshots, shop, visual-search, technology, and assistant captures, plus `browser-report.json`. Earlier Phase 1 and 1.5 artifacts remain separate. This is Chromium verification, not a full cross-browser or assistive-technology audit. Screenshots and reports are review artifacts, not application assets. Media provenance and generation prompts remain in `verification/phase1-5/MEDIA.md`.

## Current status and next work

Phase 1.6 adds a premium retail presentation, cinematic homepage, asymmetric category grid, local quick views, scripted assistant, dedicated brand/technology/contact pages, and richer empty states. Existing URLs, runtime dependencies, and the accessibility architecture are preserved. All work remains uncommitted for visual review.

Recommended Phase 2 frontend work: refine the visual direction after review; add licensed product photography; define a validated catalog contract; design collection filtering/sorting and product-detail layouts; expand visual-search and account shells; and test Safari/Firefox plus real mobile and assistive-technology interactions. Introduce integrations only when separately authorized.
