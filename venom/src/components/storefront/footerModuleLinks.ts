/** Odkazy do footeru za stránky aktivních modulů. */
export function buildFooterModuleLinks(addons: Set<string>, tenantSlug: string): { href: string; label: string }[] {
  const base = `/demo/${tenantSlug}/obchod`;
  const links: { href: string; label: string }[] = [];
  if (addons.has("stav-objednavky")) links.push({ href: `${base}/stav-objednavky`, label: "Stav objednávky" });
  if (addons.has("mapa-prodejen")) links.push({ href: `${base}/prodejny`, label: "Naše prodejny" });
  if (addons.has("slovnik-pojmu")) links.push({ href: `${base}/slovnik`, label: "Slovník pojmů" });
  if (addons.has("velkoobchod")) links.push({ href: `${base}/velkoobchod`, label: "Velkoobchod" });
  return links;
}
