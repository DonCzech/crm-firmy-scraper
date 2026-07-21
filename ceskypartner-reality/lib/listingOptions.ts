// Sdílené číselníky pro formuláře inzerátů (admin) a mapování na frontend.

export const OWNERSHIP_OPTIONS = [
  { value: "PERSONAL", label: "Osobní" },
  { value: "COOPERATIVE", label: "Družstevní" },
  { value: "STATE", label: "Státní / obecní" },
];

export const CONDITION_OPTIONS = [
  { value: "NEW_BUILD", label: "Novostavba" },
  { value: "VERY_GOOD", label: "Velmi dobrý" },
  { value: "GOOD", label: "Dobrý" },
  { value: "TO_RECONSTRUCT", label: "K rekonstrukci" },
  { value: "UNDER_CONSTRUCTION", label: "Ve výstavbě" },
  { value: "DEVELOPER_PROJECT", label: "Developerský projekt" },
];

export const CONSTRUCTION_OPTIONS = [
  { value: "BRICK", label: "Cihlová" },
  { value: "PANEL", label: "Panelová" },
  { value: "WOOD", label: "Dřevostavba" },
  { value: "STONE", label: "Kamenná" },
  { value: "MIXED", label: "Smíšená" },
  { value: "SKELETON", label: "Skeletová" },
  { value: "LOW_ENERGY", label: "Nízkoenergetická" },
];

export const FURNISHING_OPTIONS = [
  { value: "FURNISHED", label: "Vybaveno" },
  { value: "PARTLY", label: "Částečně" },
  { value: "UNFURNISHED", label: "Nevybaveno" },
];

export function optionLabel(options: { value: string; label: string }[], value?: string | null) {
  return options.find((o) => o.value === value)?.label ?? null;
}
