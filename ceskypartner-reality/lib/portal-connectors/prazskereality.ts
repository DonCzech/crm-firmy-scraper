import { createSrealityCompatibleConnector } from "./sreality";

// Veřejná dokumentace PražskéReality popisuje XML-RPC rozhraní odvozené
// od importu Sreality 2.1.x. Produkční HTTPS endpoint je aktivní.
export const prazskeRealityConnector = createSrealityCompatibleConnector({
  portal: "PRAZSKEREALITY",
  displayName: "PražskéReality",
  envPrefix: "PRAZSKEREALITY",
  defaultRpcUrl: "https://www.prazskereality.cz/RPC2",
  minimumPhotos: 1,
  syncSeller: true,
  sellerReference: true,
  legacySellerFields: true,
});
