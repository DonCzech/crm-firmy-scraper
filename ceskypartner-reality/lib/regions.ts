export const REGION_OPTIONS = [
  { value: "prague", label: "Praha" },
  { value: "stredocesky", label: "Středočeský" },
  { value: "jihocesky", label: "Jihočeský" },
  { value: "plzensky", label: "Plzeňský" },
  { value: "karlovarsky", label: "Karlovarský" },
  { value: "ustecky", label: "Ústecký" },
  { value: "liberecky", label: "Liberecký" },
  { value: "kralovehradecky", label: "Královéhradecký" },
  { value: "pardubicky", label: "Pardubický" },
  { value: "vysocina", label: "Vysočina" },
  { value: "jihomoravsky", label: "Jihomoravský" },
  { value: "olomoucky", label: "Olomoucký" },
  { value: "zlinsky", label: "Zlínský" },
  { value: "moravskoslezsky", label: "Moravskoslezský" },
] as const;

export const DISTRICT_OPTIONS: Record<string, string[]> = {
  prague: [
    "Praha 1", "Praha 2", "Praha 3", "Praha 4", "Praha 5",
    "Praha 6", "Praha 7", "Praha 8", "Praha 9", "Praha 10",
    "Praha 11", "Praha 12", "Praha 13",
  ],
  stredocesky: [
    "Benešov", "Beroun", "Kladno", "Kolín", "Kutná Hora",
    "Mělník", "Mladá Boleslav", "Nymburk", "Praha-východ", "Praha-západ",
    "Příbram", "Rakovník",
  ],
  jihocesky: ["České Budějovice", "Český Krumlov", "Jindřichův Hradec", "Písek", "Prachatice", "Strakonice", "Tábor"],
  plzensky: ["Domažlice", "Klatovy", "Plzeň-město", "Plzeň-jih", "Plzeň-sever", "Rokycany", "Tachov"],
  karlovarsky: ["Cheb", "Karlovy Vary", "Sokolov"],
  ustecky: ["Děčín", "Chomutov", "Litoměřice", "Louny", "Most", "Teplice", "Ústí nad Labem"],
  liberecky: ["Česká Lípa", "Jablonec nad Nisou", "Liberec", "Semily"],
  kralovehradecky: ["Hradec Králové", "Jičín", "Náchod", "Rychnov nad Kněžnou", "Trutnov"],
  pardubicky: ["Chrudim", "Pardubice", "Svitavy", "Ústí nad Orlicí"],
  vysocina: ["Havlíčkův Brod", "Jihlava", "Pelhřimov", "Třebíč", "Žďár nad Sázavou"],
  jihomoravsky: ["Blansko", "Brno-město", "Brno-venkov", "Břeclav", "Hodonín", "Vyškov", "Znojmo"],
  olomoucky: ["Jeseník", "Olomouc", "Prostějov", "Přerov", "Šumperk"],
  zlinsky: ["Kroměříž", "Uherské Hradiště", "Vsetín", "Zlín"],
  moravskoslezsky: ["Bruntál", "Frýdek-Místek", "Karviná", "Nový Jičín", "Opava", "Ostrava-město"],
};

export function regionLabel(value: string): string {
  return REGION_OPTIONS.find((r) => r.value === value)?.label ?? value;
}
