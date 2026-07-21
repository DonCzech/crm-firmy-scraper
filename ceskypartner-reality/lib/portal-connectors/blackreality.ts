import { createSrealityCompatibleConnector } from "./sreality";

export const blackRealityConnector = createSrealityCompatibleConnector({
  portal: "BLACK_REALITY",
  displayName: "Black Reality",
  envPrefix: "BLACK_REALITY",
  defaultRpcUrl: "https://www.black-reality.cz/import/v1/",
  minimumPhotos: 1,
  syncSeller: true,
  legacyAdvertFields: true,
});
