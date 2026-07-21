import { createSrealityCompatibleConnector } from "./sreality";

// Byty.cz podporuje Sreality import pro partnery, veřejně však neuvádí aktuální
// partnerský endpoint. Adaptér se aktivuje údaji vydanými portálem.
export const bytyCzConnector = createSrealityCompatibleConnector({
  portal: "BYTY_CZ",
  displayName: "Byty.cz",
  envPrefix: "BYTY_CZ",
});
