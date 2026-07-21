import { createSrealityCompatibleConnector } from "./sreality";

// Anglická mutace používá stejné zdokumentované XML-RPC schéma jako
// PražskéReality, ale vlastní HTTPS endpoint a samostatnou konfiguraci.
export const pragueRealEstateConnector = createSrealityCompatibleConnector({
  portal: "PRAGUE_REAL_ESTATE",
  displayName: "PragueRealEstate",
  envPrefix: "PRAGUE_REAL_ESTATE",
  defaultRpcUrl: "https://www.praguerealestate.cz/RPC2",
  minimumPhotos: 1,
  syncSeller: true,
  sellerReference: true,
  legacySellerFields: true,
});
