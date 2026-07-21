import { createSrealityCompatibleConnector } from "./sreality";

// B3 Technology přijímá všechny nabídky přes XML-RPC server VideoBydlení.
// Jedno napojení distribuuje inzerci na VideoBydlení, BydlisNami,
// RealityPro, RealityMat, Vitio a Origo-Reality.
export const b3TechnologyConnector = createSrealityCompatibleConnector({
  portal: "B3_TECHNOLOGY",
  displayName: "B3 Technology / VideoBydlení",
  envPrefix: "B3_TECHNOLOGY",
  defaultRpcUrl: "https://www.videobydleni.cz/import/",
  minimumPhotos: 1,
  syncSeller: true,
  sellerReference: true,
  legacySellerFields: true,
});
