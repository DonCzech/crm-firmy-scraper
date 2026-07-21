import { createSrealityCompatibleConnector } from "./sreality";

// Eurobydlení oficiálně deklaruje rozhraní shodné se Sreality.
// Veřejný importní host ale momentálně nemá důvěryhodný certifikát ani známou RPC cestu,
// proto se bezpečný endpoint nastavuje až podle údajů dodaných portálem.
export const eurobydleniConnector = createSrealityCompatibleConnector({
  portal: "EUROBYDLENI",
  displayName: "Eurobydlení",
  envPrefix: "EUROBYDLENI",
});
