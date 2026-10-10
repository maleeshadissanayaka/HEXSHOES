import type { Product } from "../types/product.js";

/** Temporary presentation fixtures only; not live inventory or commerce data.
 * TODO: Replace fixture data with a Firestore repository/service.
 */
export const products: readonly Product[] = [
  {
    id: "hx-01", code: "HX-01", name: "HEX Runner", category: "running", audience: "unisex",
    price: 128, currency: "USD", description: "A lightweight running silhouette from the HEXSHOES presentation collection.",
    shortDescription: "Lightweight running silhouette.", image: "/media/presentation/runner-960.webp",
    images: ["/media/presentation/runner-960.webp"], colors: [], sizes: [], isNew: true,
  },
  {
    id: "hx-02", code: "HX-02", name: "HEX Trail", category: "trail", audience: "unisex",
    price: 164, currency: "USD", description: "A trail-focused silhouette from the HEXSHOES presentation collection.",
    shortDescription: "Trail-focused silhouette.", image: "/media/presentation/trail-960.webp",
    images: ["/media/presentation/trail-960.webp"], colors: [], sizes: [], isNew: true,
  },
  {
    id: "hx-03", code: "HX-03", name: "HEX Slide", category: "slides", audience: "unisex",
    price: 74, currency: "USD", description: "A slide silhouette from the HEXSHOES presentation collection.",
    shortDescription: "Minimal slide silhouette.", image: "/media/presentation/slide-960.webp",
    images: ["/media/presentation/slide-960.webp"], colors: [], sizes: [], isNew: false,
  },
  {
    id: "hx-04", code: "HX-04", name: "HEX Mono", category: "lifestyle", audience: "unisex",
    price: 142, currency: "USD", description: "A monochrome lifestyle silhouette from the HEXSHOES presentation collection.",
    shortDescription: "Monochrome lifestyle silhouette.", image: "/media/presentation/mono-960.webp",
    images: ["/media/presentation/mono-960.webp"], colors: [], sizes: [], isNew: false,
  },
];
