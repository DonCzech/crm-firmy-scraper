import { createSrealityCompatibleConnector } from "./sreality";

export const jenRealityConnector = createSrealityCompatibleConnector({
  portal: "JENREALITY",
  displayName: "JenReality",
  envPrefix: "JENREALITY",
  defaultRpcUrl: "https://www.jenreality.cz/import/v1/",
  minimumPhotos: 1,
  syncSeller: true,
  legacyAdvertFields: true,
});
