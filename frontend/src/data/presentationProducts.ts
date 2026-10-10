import type { Product } from "../types/product";

/** Design fixtures only. These are not inventory, offers, or backend records. */
export const presentationProducts: readonly Product[] = [
  {
    id: "hx-01",
    code: "HX-01",
    name: "HEX Runner",
    price: 128,
    currency: "USD",
    style: "runner",
    category: "running", audience: "unisex", description: "A lightweight running silhouette from the HEXSHOES presentation collection.", shortDescription: "Lightweight running silhouette.", image: "/media/presentation/runner-960.webp", images: ["/media/presentation/runner-960.webp"], colors: [], sizes: [], isNew: true,
  },
  {
    id: "hx-02",
    code: "HX-02",
    name: "HEX Trail",
    price: 164,
    currency: "USD",
    style: "trail",
    category: "trail", audience: "unisex", description: "A trail-focused silhouette from the HEXSHOES presentation collection.", shortDescription: "Trail-focused silhouette.", image: "/media/presentation/trail-960.webp", images: ["/media/presentation/trail-960.webp"], colors: [], sizes: [], isNew: true,
  },
  {
    id: "hx-03",
    code: "HX-03",
    name: "HEX Slide",
    price: 74,
    currency: "USD",
    style: "slide",
    category: "slides", audience: "unisex", description: "A slide silhouette from the HEXSHOES presentation collection.", shortDescription: "Minimal slide silhouette.", image: "/media/presentation/slide-960.webp", images: ["/media/presentation/slide-960.webp"], colors: [], sizes: [], isNew: false,
  },
  {
    id: "hx-04",
    code: "HX-04",
    name: "HEX Mono",
    price: 142,
    currency: "USD",
    style: "mono",
    category: "lifestyle", audience: "unisex", description: "A monochrome lifestyle silhouette from the HEXSHOES presentation collection.", shortDescription: "Monochrome lifestyle silhouette.", image: "/media/presentation/mono-960.webp", images: ["/media/presentation/mono-960.webp"], colors: [], sizes: [], isNew: false,
  },
];
