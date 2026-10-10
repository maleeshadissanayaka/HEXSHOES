# HEXSHOES Frontend

The HEXSHOES customer-facing storefront: an editorial footwear presentation backed by the Express product API and Firestore catalog. Firebase Authentication provides browser-based account access; commerce and AI services are not active.

## Stack

- React 19, TypeScript 6, and Vite 8
- React Router 7 through `react-router-dom`
- Firebase Web SDK for client-side authentication
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

Open the local URL printed by Vite. Vite may choose another port if the default is occupied. The browser verification script accepts a target through `--base-url`.

```powershell
npm run lint
npm run typecheck
npm run build
npm run preview -- --host 127.0.0.1
```

`build` checks TypeScript and produces `dist/`. Generated output and dependencies are ignored by Git. A future production host must serve `index.html` for application routes because the frontend uses BrowserRouter.

## Firebase Authentication

Copy `frontend/.env.example` to a local `.env` and provide the public Firebase Web app values:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

These values identify the browser Firebase app; they are not Firebase Admin credentials. Never put a service-account key, Admin private key, or Admin client email in the frontend.

In Firebase Console, enable both providers before live testing:

1. Open **Authentication → Sign-in method**.
2. Enable **Email/Password**.
3. Enable **Google** and complete its required project support details.
4. Ensure the development and deployed domains are listed as authorized domains.

Current account features include email/password registration and sign-in, Google popup sign-in, Firebase-managed local browser persistence, session restoration, sign-out, friendly errors, and authenticated account details. `/account` remains public so signed-out visitors can access the forms.

Backend ID-token verification and protected API routes are not implemented yet. No Firestore user-profile document is created, and cart/wishlist data remains visit-local rather than account-persistent. ID tokens are not manually stored by the application.

## Route overview

| Route                               | Current presentation                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| `/`                                 | Designed homepage                                                               |
| `/shop`                             | Local presentation collection with direction filters and quick views; recognizes `?category=run`, `trail`, `lifestyle`, or `slides` |
| `/men`, `/women`                    | Distinct campaign collections with filters and four presentation studies       |
| `/new-drops`                        | Editorial grid of the four current presentation studies                          |
| `/product/:id`                      | Product concept detail, gallery, presentation size/quantity, and visit-only bag; unknown IDs show 404 |
| `/visual-search`                    | Sample-image selection, local upload preview, and an interactive planned-pipeline explanation; no CLIP inference |
| `/wishlist`, `/cart`               | Visit-only saved styles and bag state held in memory; no persistence or checkout |
| `/account`                         | Personal-space preview; no authentication or customer data |
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
├── pages/             # Homepage, collection, account, product, and company routes
├── data/              # Navigation, media descriptions, isolated product fixtures
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

Reusable components include AnnouncementBar, Navbar, MobileMenu, Footer, PageContainer, SectionHeader, Button, IconButton, SkipLink, PageShell (used by 404), Reveal, ProductCard, QuickView, PremiumModal, CampaignMedia, PresentationImage, VisualSearchConsole, IntelligenceStory, and HexAssistant. ExperienceProvider coordinates dialogs and visit-only cart/wishlist state; the modal lifecycle handles focus and scroll locking.

The homepage presents the hero, brand value strip, HEX philosophy, category directions, new drops preview, planned visual search, future intelligence roadmap, story, and newsletter, between the global announcement and footer.

## Presentation boundaries

`src/data/presentationProducts.ts` contains four isolated design fixtures: HX-01 / HEX Runner / $128, HX-02 / HEX Trail / $164, HX-03 / HEX Slide / $74, and HX-04 / HEX Mono / $142. Prices are illustrative USD values. The page explicitly labels these as concepts that are not available for purchase. There are no stock, size, color-availability, review, rating, sales, or accuracy claims.

The storefront uses seven generated photographic concept compositions, isolated in `public/media/presentation/` and `src/data/presentationMedia.ts`. These are presentation assets, not photographs of manufactured stock. Each has three compressed WebP variants; the browser selects an appropriate responsive source. Lead campaign images load eagerly with high priority; other images use lazy loading and asynchronous decoding. Explicit dimensions reserve layout space. The homepage hero uses a still image with restrained CSS motion and a motion toggle; there is no campaign video. No additional runtime packages are required.

The search utility opens an accessible explanatory dialog. Visual discovery lets visitors switch local samples or preview a selected image in the browser, then inspect pipeline explanations. Its style thumbnails remain fixed presentation examples: uploads are not sent, and retrieval, similarity scores, and simulated processing are not active. Intelligence modules use current-foundation, planned, and research status labels. The roadmap supports pointer selection, arrow keys, Home, and End.

HEX Assistant uses deterministic local replies and suggested prompts. It sends no requests, stores no conversations, and clears when dismissed. It is explicitly identified as a scripted product guide. Product sizes, quantities, bag items, and saved styles are local presentation interactions held in memory for the visit and clear on reload. The contact form validates required fields and email, then displays a local preview confirmation. Newsletter submission validates email, displays a local confirmation, and clears the input. Neither form sends or stores data.

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

For the full pre-push route, interaction, network, and screenshot review, use:

```powershell
npm run verify:browser -- --pre-push-final --base-url=http://127.0.0.1:5173
```

The pre-push run writes to `verification/pre-push-final/`. Its screenshots and report are local review artifacts and should stay out of source commits unless explicitly requested.

This uses Node's built-in WebSocket support and Chromium's DevTools protocol. It launches installed Microsoft Edge or Chrome headlessly, with a disposable profile under ignored `node_modules/.cache/`. It adds no automation dependency. On other systems, set `HEXSHOES_BROWSER_PATH` to an installed Chromium executable. The server must already be running.

The script checks the homepage at 1440, 1280, 1024, 768, and 390px; horizontal overflow; routes and internal links; 404s; titles; mobile focus and scroll lock; dialogs; the skip link; newsletter state; reduced motion; console exceptions; and unexpected mutation requests. The premium suite also checks quick-view focus handling, collection filtering, sample/pipeline controls, keyboard roadmap tabs, contact validation, campaign controls, scripted assistant input, and secondary-page layouts at tablet/mobile widths.

Earlier phase review artifacts remain in their respective verification folders. This is Chromium verification, not a full cross-browser or assistive-technology audit. Screenshots and reports are review artifacts, not application assets. Media provenance and generation prompts remain in `verification/phase1-5/MEDIA.md`.

## Current status and next work

The customer-facing routes include the homepage, filtered collections, Men/Women campaigns, New Drops, product concepts, visit-only cart and saved styles, account preview, visual discovery, brand, technology, and contact pages. Four products and their prices are illustrative presentation fixtures. Bag and saved-style state live in memory for the current visit only; commerce, authentication, and CLIP inference are not connected. No additional runtime dependencies were added.

Remaining work belongs to separately scoped integrations: connect a verified catalog and commerce services, add licensed retail photography, implement authentication and checkout, and connect/evaluate real visual retrieval. Cross-browser Safari/Firefox and hands-on assistive-technology testing are also still recommended.
