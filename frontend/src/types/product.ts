export type FootwearStyle = "runner" | "trail" | "slide" | "mono";
export interface PresentationProduct {
  id: string;
  code: string;
  name: string;
  price: number;
  currency: "USD";
  style: FootwearStyle;
}
