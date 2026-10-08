import type { PresentationProduct } from "../types/product";

/** Design fixtures only. These are not inventory, offers, or backend records. */
export const presentationProducts: readonly PresentationProduct[] = [
  {
    id: "hx-01",
    code: "HX-01",
    name: "HEX Runner",
    price: 128,
    currency: "USD",
    style: "runner",
  },
  {
    id: "hx-02",
    code: "HX-02",
    name: "HEX Trail",
    price: 164,
    currency: "USD",
    style: "trail",
  },
  {
    id: "hx-03",
    code: "HX-03",
    name: "HEX Slide",
    price: 74,
    currency: "USD",
    style: "slide",
  },
  {
    id: "hx-04",
    code: "HX-04",
    name: "HEX Mono",
    price: 142,
    currency: "USD",
    style: "mono",
  },
];
