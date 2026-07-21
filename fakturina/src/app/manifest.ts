import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fakturina",
    short_name: "Fakturina",
    description: "Chytrá česká fakturace",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f33e5",
    lang: "cs",
  };
}
