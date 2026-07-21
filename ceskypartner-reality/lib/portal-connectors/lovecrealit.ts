import { createSrealityCompatibleConnector } from "./sreality";

export const lovecRealitConnector = createSrealityCompatibleConnector({
  portal: "LOVEC_REALIT",
  displayName: "Lovec-Realit",
  envPrefix: "LOVEC_REALIT",
  defaultRpcUrl: "https://import.lovec-realit.cz/RPC2",
});
