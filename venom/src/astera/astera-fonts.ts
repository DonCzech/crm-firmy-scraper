import { Playfair_Display, Poppins } from "next/font/google";

// Mirrors astera-web/src/app/layout.tsx font setup so the astera surface renders
// with identical typography. next/font self-hosts the files (no runtime Google
// Fonts request) and exposes the CSS variables the astera components reference.
export const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

export const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});
