// Neutrální blur placeholder pro fotky nemovitostí — barva `stone` z palety,
// vykreslí se okamžitě a zabrání bílému bliknutí při načítání.
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64," +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6"><rect width="8" height="6" fill="#EDEAE3"/></svg>'
  ).toString("base64");
