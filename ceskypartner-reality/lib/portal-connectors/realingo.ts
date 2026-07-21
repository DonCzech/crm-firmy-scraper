import { createSrealityCompatibleConnector } from "./sreality";

export const realingoConnector = createSrealityCompatibleConnector({
  portal: "REALINGO",
  displayName: "Realingo",
  envPrefix: "REALINGO",
  defaultRpcUrl: "https://import.realingo.cz/",
});
