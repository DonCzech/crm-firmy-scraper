"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { X, Check, ChevronDown, Search, SlidersHorizontal, Map as MapIcon } from "lucide-react";
import type { SiteLocale } from "@/lib/locale";

/* ─── Data ──────────────────────────────────────── */

const OFFER_TYPES = ["Prodej", "Pronájem", "Investice"] as const;

const OFFER_DEAL: Record<string, string> = {
  Prodej: "SALE",
  Pronájem: "RENT",
  Investice: "INVESTMENT",
};

const OFFER_CATEGORY: Record<string, string> = {
  Prodej: "prodej",
  Pronájem: "pronajem",
  Investice: "investicni",
};

const PROPERTY_TYPES = [
  "Byt",
  "Rodinný dům",
  "Pozemek",
  "Bytový dům",
  "Kancelářské prostory",
  "Obchodní prostory",
  "Administrativní budova",
  "Skladové prostory",
  "Prostory pro výrobu",
  "Hotel",
  "Historický objekt",
  "Usedlost / statek",
] as const;

const DISPOSITIONS = [
  "1+kk",
  "1+1",
  "2+kk",
  "2+1",
  "3+kk",
  "3+1",
  "4+kk",
  "4+1",
  "5+kk a větší",
];

const OFFER_LABEL_EN: Record<string, string> = {
  Prodej: "For sale",
  Pronájem: "To let",
  Investice: "Investment",
};

const PROPERTY_LABEL_EN: Record<string, string> = {
  Byt: "Apartment",
  "Rodinný dům": "House",
  Pozemek: "Land",
  "Bytový dům": "Apartment building",
  "Kancelářské prostory": "Office",
  "Obchodní prostory": "Retail",
  "Administrativní budova": "Office building",
  "Skladové prostory": "Warehouse",
  "Prostory pro výrobu": "Industrial",
  Hotel: "Hotel",
  "Historický objekt": "Historic property",
  "Usedlost / statek": "Country estate",
};

const AREA_OPTIONS = [
  { label: "Bez omezení", value: 0 },
  { label: "min. 50 m²", value: 50 },
  { label: "min. 75 m²", value: 75 },
  { label: "min. 100 m²", value: 100 },
  { label: "min. 150 m²", value: 150 },
  { label: "min. 200 m²", value: 200 },
];

const PRICE_STEPS_SALE = [
  0, 1_000_000, 2_000_000, 3_000_000, 5_000_000, 7_500_000,
  10_000_000, 15_000_000, 20_000_000, 30_000_000, 50_000_000, 80_000_000, 120_000_000,
];
const PRICE_STEPS_RENT = [
  0, 5_000, 10_000, 15_000, 20_000, 25_000, 30_000, 40_000, 50_000, 75_000, 100_000,
];

function formatPrice(value: number, en = false): string {
  if (value === 0) return en ? "No minimum" : "Cena min.";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)} ${en ? "m CZK" : "mil. Kč"}`;
  return `${(value / 1_000).toFixed(0)} ${en ? "k CZK" : "tis. Kč"}`;
}

type Region = {
  id: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
};

const DISTRICTS: Record<string, string[]> = {
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
  jihocesky: [
    "České Budějovice", "Český Krumlov", "Jindřichův Hradec",
    "Písek", "Prachatice", "Strakonice", "Tábor",
  ],
  plzensky: [
    "Domažlice", "Klatovy", "Plzeň-město", "Plzeň-jih",
    "Plzeň-sever", "Rokycany", "Tachov",
  ],
  karlovarsky: ["Cheb", "Karlovy Vary", "Sokolov"],
  ustecky: [
    "Děčín", "Chomutov", "Litoměřice", "Louny",
    "Most", "Teplice", "Ústí nad Labem",
  ],
  liberecky: ["Česká Lípa", "Jablonec nad Nisou", "Liberec", "Semily"],
  kralovehradecky: ["Hradec Králové", "Jičín", "Náchod", "Rychnov nad Kněžnou", "Trutnov"],
  pardubicky: ["Chrudim", "Pardubice", "Svitavy", "Ústí nad Orlicí"],
  vysocina: ["Havlíčkův Brod", "Jihlava", "Pelhřimov", "Třebíč", "Žďár nad Sázavou"],
  jihomoravsky: ["Blansko", "Brno-město", "Brno-venkov", "Břeclav", "Hodonín", "Vyškov", "Znojmo"],
  olomoucky: ["Jeseník", "Olomouc", "Prostějov", "Přerov", "Šumperk"],
  zlinsky: ["Kroměříž", "Uherské Hradiště", "Vsetín", "Zlín"],
  moravskoslezsky: ["Bruntál", "Frýdek-Místek", "Karviná", "Nový Jičín", "Opava", "Ostrava-město"],
};

const REGIONS: Region[] = [
  {
    id: "karlovarsky",
    name: "Karlovarský",
    path: "M89,85 L90,84 L94,87 L100,88 L102,91 L109,91 L112,97 L112,106 L115,112 L114,115 L116,117 L115,120 L116,122 L111,123 L110,125 L111,129 L105,126 L98,125 L97,127 L89,130 L88,131 L87,136 L82,135 L79,136 L77,135 L70,135 L66,138 L61,137 L57,139 L53,139 L48,136 L49,132 L43,129 L30,124 L25,116 L25,109 L22,106 L17,104 L19,99 L18,95 L22,95 L27,101 L31,105 L33,111 L36,108 L36,104 L40,98 L44,94 L49,92 L50,88 L56,86 L62,85 L67,86 L71,82 L76,82 L78,81 L86,85 L89,85 Z",
    labelX: 68,
    labelY: 110,
  },
  {
    id: "ustecky",
    name: "Ústecký",
    path: "M202,16 L209,19 L214,19 L221,21 L224,24 L221,30 L222,31 L228,29 L228,32 L225,38 L221,42 L218,44 L214,40 L213,40 L212,45 L210,49 L207,51 L204,57 L209,69 L214,73 L214,79 L209,83 L205,82 L206,89 L202,91 L195,93 L186,94 L181,92 L175,93 L174,97 L166,100 L162,102 L153,105 L147,105 L143,108 L137,110 L134,115 L127,118 L124,120 L119,119 L114,115 L115,109 L112,99 L112,95 L111,92 L102,91 L99,88 L92,86 L90,84 L93,82 L94,75 L99,76 L102,75 L106,75 L109,72 L112,66 L116,67 L123,62 L128,64 L134,61 L137,56 L136,54 L139,52 L152,52 L157,50 L162,51 L166,48 L167,44 L172,42 L179,42 L192,37 L195,34 L198,33 L204,34 L207,32 L207,29 L200,26 L201,24 L195,23 L198,18 L202,16 Z",
    labelX: 160,
    labelY: 72,
  },
  {
    id: "liberecky",
    name: "Liberecký",
    path: "M226,37 L231,39 L234,41 L240,41 L242,39 L243,36 L248,35 L257,36 L257,30 L258,25 L255,22 L259,19 L260,20 L265,20 L268,23 L269,20 L272,20 L273,23 L277,23 L280,24 L281,27 L280,32 L282,36 L287,39 L288,45 L295,42 L302,44 L306,53 L305,58 L308,64 L307,67 L310,75 L301,74 L298,72 L295,74 L295,78 L292,79 L289,75 L282,73 L278,76 L269,73 L266,70 L265,66 L262,67 L259,64 L250,64 L247,68 L242,72 L237,74 L234,76 L227,77 L223,75 L215,75 L214,73 L209,69 L204,57 L210,46 L212,45 L213,40 L214,40 L218,44 L222,41 L222,39 L226,38 L226,37 Z",
    labelX: 258,
    labelY: 52,
  },
  {
    id: "kralovehradecky",
    name: "Královéhradecký",
    path: "M302,44 L312,47 L315,50 L322,48 L325,50 L329,56 L332,56 L338,54 L341,61 L340,63 L343,63 L349,59 L352,59 L357,61 L360,57 L364,57 L369,59 L376,65 L377,67 L373,73 L369,76 L365,75 L365,77 L359,80 L357,83 L358,85 L361,85 L362,89 L365,88 L369,88 L372,94 L378,96 L383,104 L386,106 L388,113 L390,115 L381,112 L379,117 L370,120 L368,124 L358,125 L357,126 L353,124 L347,119 L341,117 L340,112 L337,111 L333,112 L328,116 L326,116 L325,111 L320,112 L318,117 L316,117 L313,115 L309,115 L304,114 L298,119 L291,115 L288,111 L290,108 L287,98 L276,98 L273,93 L269,92 L268,89 L271,83 L269,74 L272,73 L277,76 L283,73 L289,75 L292,79 L295,77 L296,73 L300,72 L302,74 L310,75 L310,72 L307,66 L308,62 L305,58 L305,54 L306,52 L303,47 L302,44 Z",
    labelX: 328,
    labelY: 95,
  },
  {
    id: "pardubicky",
    name: "Pardubický",
    path: "M390,115 L396,118 L400,118 L402,115 L406,112 L409,108 L413,108 L410,115 L408,122 L408,125 L401,130 L403,135 L403,143 L402,147 L404,149 L408,157 L411,160 L411,163 L408,166 L408,170 L406,171 L402,169 L398,168 L395,169 L393,168 L387,168 L386,171 L374,172 L366,169 L362,165 L357,162 L350,162 L346,159 L341,157 L336,162 L330,161 L326,156 L321,152 L319,152 L314,149 L307,149 L304,145 L299,142 L300,134 L293,128 L288,127 L287,124 L291,123 L291,118 L293,117 L298,119 L304,114 L313,115 L318,117 L320,112 L325,111 L326,116 L328,116 L333,112 L337,111 L340,113 L341,117 L347,118 L350,122 L357,126 L360,125 L368,124 L370,120 L379,117 L381,112 L390,115 Z",
    labelX: 358,
    labelY: 137,
  },
  {
    id: "plzensky",
    name: "Plzeňský",
    path: "M50,147 L53,141 L53,139 L59,139 L62,137 L67,138 L70,135 L77,135 L79,137 L83,135 L87,136 L88,131 L89,130 L97,127 L100,125 L105,126 L111,129 L110,124 L111,123 L116,122 L115,118 L118,117 L120,119 L125,120 L127,125 L133,124 L136,125 L140,128 L148,129 L152,132 L156,134 L156,135 L161,137 L162,143 L158,149 L159,151 L158,155 L159,157 L151,162 L150,166 L152,170 L154,172 L154,176 L156,182 L155,183 L158,191 L157,196 L158,199 L151,209 L150,212 L152,216 L150,217 L146,222 L143,223 L142,231 L138,235 L136,239 L133,243 L126,239 L124,232 L120,229 L117,225 L110,225 L106,222 L105,219 L96,210 L93,204 L91,204 L86,200 L82,200 L81,201 L76,201 L73,199 L69,193 L63,190 L62,187 L62,181 L58,180 L54,171 L51,168 L52,165 L50,163 L45,161 L42,156 L48,152 L48,147 L50,147 Z",
    labelX: 109,
    labelY: 169,
  },
  {
    id: "stredocesky",
    name: "Středočeský",
    path: "M299,142 L294,151 L290,151 L281,156 L277,155 L275,159 L272,162 L277,165 L278,170 L272,173 L265,172 L261,173 L257,172 L257,174 L252,178 L248,174 L244,173 L240,171 L237,173 L236,177 L231,178 L226,181 L223,179 L213,179 L208,178 L202,180 L198,176 L191,179 L181,179 L177,178 L175,181 L167,183 L160,181 L155,183 L156,178 L154,175 L154,171 L151,167 L153,160 L157,159 L159,155 L158,153 L159,150 L160,143 L162,142 L161,137 L156,135 L155,133 L142,129 L136,125 L131,124 L127,125 L127,121 L128,118 L134,115 L137,110 L143,108 L147,106 L153,105 L161,102 L165,102 L166,100 L174,97 L175,93 L181,92 L186,94 L196,93 L200,91 L205,91 L206,84 L214,79 L215,75 L223,75 L225,78 L227,77 L234,76 L245,70 L247,67 L254,64 L259,64 L263,67 L265,66 L266,71 L270,73 L269,78 L271,85 L268,91 L280,98 L287,98 L288,104 L290,110 L291,115 L293,117 L291,123 L287,124 L288,127 L293,128 L297,131 L300,135 L300,139 L299,142 Z",
    labelX: 218,
    labelY: 148,
  },
  {
    id: "prague",
    name: "Praha",
    path: "M219,110 L221,111 L224,113 L225,114 L228,115 L229,117 L232,118 L232,121 L229,122 L229,126 L230,128 L227,129 L222,129 L221,128 L219,130 L213,132 L204,134 L202,134 L202,130 L199,127 L198,125 L196,122 L196,120 L194,119 L194,117 L199,115 L202,116 L204,116 L204,113 L215,111 L219,110 Z",
    labelX: 214,
    labelY: 122,
  },
  {
    id: "vysocina",
    name: "Vysočina",
    path: "M374,172 L372,177 L375,183 L371,184 L372,186 L372,192 L374,198 L366,202 L364,207 L362,210 L362,215 L364,218 L362,221 L363,224 L360,227 L354,229 L351,232 L345,231 L339,232 L337,230 L332,233 L331,236 L328,235 L326,236 L320,241 L314,239 L311,242 L306,239 L301,237 L300,234 L304,230 L307,226 L304,222 L298,223 L292,223 L288,219 L286,214 L280,213 L274,211 L272,214 L269,212 L267,209 L260,206 L257,207 L252,204 L251,199 L249,196 L251,190 L251,186 L249,182 L254,181 L252,178 L257,174 L258,172 L263,173 L268,172 L272,173 L278,170 L278,166 L272,162 L276,158 L281,156 L290,151 L294,151 L296,146 L299,142 L304,145 L307,149 L315,149 L319,152 L323,153 L327,157 L330,161 L334,161 L343,158 L349,160 L351,162 L357,162 L364,167 L366,169 L374,172 Z",
    labelX: 313,
    labelY: 198,
  },
  {
    id: "jihocesky",
    name: "Jihočeský",
    path: "M142,242 L136,239 L138,235 L142,231 L142,225 L147,221 L150,216 L152,214 L152,210 L153,206 L158,199 L157,193 L158,189 L155,183 L161,181 L169,183 L176,181 L180,178 L187,179 L191,179 L196,176 L205,180 L211,178 L214,179 L224,179 L226,181 L235,177 L239,170 L241,172 L245,173 L249,175 L253,179 L253,181 L249,182 L251,186 L251,190 L249,197 L251,200 L252,204 L258,207 L262,206 L264,208 L267,209 L269,212 L272,214 L276,211 L286,214 L287,219 L288,219 L292,223 L299,223 L304,222 L307,226 L307,228 L300,234 L302,238 L306,239 L304,247 L296,242 L292,241 L288,239 L282,239 L278,241 L272,243 L270,243 L271,238 L270,237 L259,235 L256,239 L256,249 L254,255 L254,262 L252,262 L248,260 L242,260 L240,264 L240,266 L234,271 L234,278 L232,282 L228,279 L224,277 L219,278 L216,277 L214,275 L212,275 L211,280 L203,283 L202,284 L194,281 L182,280 L178,279 L176,275 L179,273 L175,268 L159,260 L153,250 L147,249 L142,242 Z",
    labelX: 222,
    labelY: 227,
  },
  {
    id: "jihomoravsky",
    name: "Jihomoravský",
    path: "M317,252 L309,248 L304,247 L306,239 L312,242 L316,239 L320,241 L326,236 L328,235 L332,235 L337,230 L340,232 L345,231 L352,232 L354,229 L360,227 L363,223 L362,219 L364,215 L362,212 L365,208 L364,204 L366,202 L374,198 L374,196 L372,191 L372,184 L375,179 L372,176 L374,172 L386,171 L388,168 L394,168 L395,169 L398,168 L407,171 L402,175 L407,179 L406,182 L408,189 L406,191 L411,195 L415,193 L416,189 L414,182 L419,183 L422,187 L423,190 L427,193 L427,197 L429,199 L432,199 L436,203 L437,207 L435,211 L441,220 L437,221 L433,226 L437,228 L443,227 L443,233 L453,235 L454,239 L461,242 L466,241 L470,246 L475,247 L478,253 L469,256 L466,256 L462,253 L455,256 L446,251 L438,251 L433,255 L431,258 L428,260 L426,263 L422,274 L420,277 L420,279 L417,276 L416,269 L414,266 L406,267 L402,265 L397,265 L395,260 L384,257 L378,258 L371,266 L368,265 L356,263 L349,264 L344,262 L331,254 L330,252 L327,252 L326,250 L317,252 Z",
    labelX: 394,
    labelY: 226,
  },
  {
    id: "olomoucky",
    name: "Olomoucký",
    path: "M420,83 L432,86 L436,88 L439,87 L440,91 L445,94 L451,94 L452,99 L454,101 L456,99 L458,106 L452,108 L450,110 L444,113 L442,116 L441,125 L436,131 L436,134 L439,137 L436,141 L435,145 L441,147 L442,149 L450,152 L453,151 L459,157 L465,157 L468,156 L471,158 L476,157 L481,160 L480,165 L482,166 L485,165 L488,170 L491,171 L495,176 L499,179 L495,182 L490,184 L489,188 L487,189 L476,188 L477,192 L475,193 L467,193 L464,197 L462,197 L458,195 L456,195 L451,192 L450,196 L452,199 L446,204 L440,204 L439,208 L436,203 L432,199 L427,197 L427,193 L422,190 L421,185 L419,183 L414,182 L416,191 L412,195 L406,191 L408,187 L406,181 L407,179 L402,175 L403,173 L408,170 L408,166 L411,163 L410,158 L407,155 L402,147 L403,135 L401,130 L406,127 L409,123 L408,121 L410,115 L413,108 L422,103 L425,106 L424,100 L422,96 L418,94 L416,88 L413,83 L417,82 L420,83 Z",
    labelX: 445,
    labelY: 170,
  },
  {
    id: "zlinsky",
    name: "Zlínský",
    path: "M537,201 L534,203 L523,206 L520,208 L517,214 L516,221 L516,226 L515,229 L511,233 L508,234 L502,234 L498,239 L496,245 L492,244 L489,246 L485,251 L478,253 L475,247 L470,246 L468,242 L463,241 L459,242 L454,239 L453,235 L443,233 L443,227 L436,228 L433,225 L437,222 L441,220 L440,217 L437,215 L435,209 L439,208 L440,204 L447,204 L448,202 L452,199 L450,196 L451,192 L454,193 L456,195 L459,195 L464,197 L467,193 L476,193 L477,190 L480,188 L487,189 L489,185 L493,181 L498,182 L499,179 L503,179 L505,183 L520,182 L523,184 L531,184 L533,188 L536,191 L537,195 L539,195 L539,199 L537,201 Z",
    labelX: 484,
    labelY: 211,
  },
  {
    id: "moravskoslezsky",
    name: "Moravskoslezský",
    path: "M482,95 L485,98 L484,102 L486,105 L484,108 L480,110 L474,110 L473,113 L477,117 L482,117 L486,122 L488,127 L494,131 L497,132 L500,131 L502,129 L507,129 L508,126 L507,123 L510,124 L515,127 L515,130 L521,130 L529,135 L531,138 L533,138 L534,136 L538,136 L547,140 L549,140 L553,138 L554,143 L556,144 L554,147 L554,149 L558,159 L560,161 L564,161 L567,164 L571,163 L573,165 L573,169 L575,173 L577,179 L576,181 L571,182 L566,185 L559,183 L557,184 L553,183 L551,185 L550,189 L547,190 L544,194 L542,195 L537,195 L536,190 L533,188 L531,184 L522,184 L519,182 L505,183 L503,179 L499,179 L495,176 L491,171 L488,170 L485,165 L481,166 L480,164 L481,160 L476,157 L471,158 L468,156 L465,157 L459,157 L453,151 L449,152 L442,149 L441,147 L436,146 L435,145 L436,140 L439,136 L436,131 L441,125 L441,119 L442,115 L444,113 L450,110 L457,108 L458,105 L456,99 L459,103 L463,100 L467,100 L475,101 L478,99 L481,95 L482,95 Z",
    labelX: 504,
    labelY: 148,
  },
];

/** Pořadí regionů ve výběru (S&W): Praha, Středočeský, Jihomoravský, Jihočeský, Karlovarský, pak abecedně */
const REGION_ORDER = [
  "prague", "stredocesky", "jihomoravsky", "jihocesky", "karlovarsky",
  "kralovehradecky", "liberecky", "moravskoslezsky", "olomoucky",
  "pardubicky", "plzensky", "ustecky", "vysocina", "zlinsky",
];
const ORDERED_REGIONS: Region[] = REGION_ORDER
  .map((id) => REGIONS.find((r) => r.id === id))
  .filter((r): r is Region => Boolean(r));

function regionLabel(region: Region | undefined, _en: boolean): string {
  if (!region) return "";
  // Názvy krajů zůstávají v obou jazykových verzích česky a bez slova „kraj“.
  // SVG používá textAnchor="middle", takže zkrácený text zůstává vystředěný
  // ve stejném pevném bodě; geometrie mapy ani souřadnice se nemění.
  return region.name;
}

/* ─── Textové vyhledávání lokality ───────────────── */

type LocSuggestion = {
  label: string;
  sub: string;
  typeLabel: string;
  regionId: string;
  district?: string;
};

const LOC_SUGGESTIONS: LocSuggestion[] = [
  ...REGIONS.map((r) => ({
    label: r.id === "prague" ? "Hlavní město Praha" : `${r.name} kraj`,
    sub: "Česká republika",
    typeLabel: "Region",
    regionId: r.id,
  })),
  ...Object.entries(DISTRICTS).flatMap(([rid, ds]) =>
    ds.map((d) => ({
      label: d,
      sub: `${rid === "prague" ? "Hlavní město Praha" : `${REGIONS.find((r) => r.id === rid)?.name} kraj`}, Česká republika`,
      typeLabel: rid === "prague" ? "Městská část" : "Okres",
      regionId: rid,
      district: d,
    }))
  ),
];

/** Často hledané — výchozí návrhy před psaním */
const FREQUENT_LABELS = ["Praha 1", "Praha 2", "Praha 5", "Praha 6", "Hlavní město Praha", "Brno-město", "Praha-východ"];

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* ─── PROPERTY_KIND mapping ──────────────────────── */
const KIND_SLUG: Record<string, string> = {
  APARTMENT: "byt",
  HOUSE: "dum",
  LAND: "pozemek",
  COMMERCIAL: "komercni",
};

const KIND_MAP: Record<string, string> = {
  "Byt": "APARTMENT",
  "Rodinný dům": "HOUSE",
  "Pozemek": "LAND",
  "Bytový dům": "COMMERCIAL",
  "Kancelářské prostory": "COMMERCIAL",
  "Obchodní prostory": "COMMERCIAL",
  "Administrativní budova": "COMMERCIAL",
  "Skladové prostory": "COMMERCIAL",
  "Prostory pro výrobu": "COMMERCIAL",
  "Hotel": "COMMERCIAL",
  "Historický objekt": "HOUSE",
  "Usedlost / statek": "HOUSE",
};

/* ─── Component ──────────────────────────────────── */

type Props = {
  open: boolean;
  onClose: () => void;
  /** Přednastavení z menu — např. „Pronájem" + „Byt" */
  initialOfferType?: string;
  initialPropertyType?: string;
  locale?: SiteLocale;
};

export default function PropertySearchModal({ open, onClose, initialOfferType, initialPropertyType, locale = "cs" }: Props) {
  const en = locale === "en";
  // Bez přednastavení počítáme všechny nemovitosti — typ nabídky si user teprve vybere
  const [offerType, setOfferType] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<Record<string, string[]>>({});
  const [priceMinIdx, setPriceMinIdx] = useState(0);
  const [priceMaxIdx, setPriceMaxIdx] = useState(12);
  const [disposition, setDisposition] = useState("");
  const [area, setArea] = useState(0);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [dispOpen, setDispOpen] = useState(false);
  const [districtOpenFor, setDistrictOpenFor] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<"map" | "search">("map");
  const [locQuery, setLocQuery] = useState("");
  const [mobileRegionOpen, setMobileRegionOpen] = useState(false);
  const mobileRegionRef = useRef<HTMLDivElement>(null);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [activeRegions, setActiveRegions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const dispRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);
  const locSearchRef = useRef<HTMLDivElement>(null);
  const fetchTimer = useRef<ReturnType<typeof setTimeout>>();

  const priceSteps = offerType === "Pronájem" ? PRICE_STEPS_RENT : PRICE_STEPS_SALE;
  const maxIdx = priceSteps.length - 1;

  const resetFilters = useCallback(() => {
    setOfferType("");
    setPropertyType("");
    setSelectedRegions([]);
    setSelectedDistricts({});
    setPriceMinIdx(0);
    setPriceMaxIdx(maxIdx);
    setDisposition("");
    setArea(0);
  }, [maxIdx]);

  const fetchCount = useCallback(() => {
    clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (OFFER_DEAL[offerType]) params.set("deal", OFFER_DEAL[offerType]);
        if (propertyType) {
          const kind = KIND_MAP[propertyType];
          if (kind) params.set("kind", kind);
        }
        if (selectedRegions.length) params.set("regions", selectedRegions.join(","));
        const districts = Object.values(selectedDistricts).flat();
        if (districts.length) params.set("districts", districts.join(","));
        if (disposition) params.set("disposition", disposition);
        const pMin = priceSteps[priceMinIdx];
        const pMax = priceSteps[priceMaxIdx];
        if (pMin > 0) params.set("priceMin", String(pMin));
        if (priceMaxIdx < maxIdx) params.set("priceMax", String(pMax));
        if (area > 0) params.set("areaMin", String(area));

        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();
        setResultCount(data.count);
        setActiveRegions(data.activeRegions || {});
      } catch {
        setResultCount(null);
      } finally {
        setLoading(false);
      }
    }, 200);
  }, [offerType, propertyType, selectedRegions, selectedDistricts, disposition, priceMinIdx, priceMaxIdx, area, priceSteps, maxIdx]);

  // Přednastavení filtrů při otevření z menu
  useEffect(() => {
    if (!open) return;
    if (initialOfferType && OFFER_DEAL[initialOfferType]) {
      setOfferType(initialOfferType);
      setPriceMinIdx(0);
      setPriceMaxIdx((initialOfferType === "Pronájem" ? PRICE_STEPS_RENT : PRICE_STEPS_SALE).length - 1);
    }
    if (initialPropertyType !== undefined) setPropertyType(initialPropertyType);
  }, [open, initialOfferType, initialPropertyType]);

  useEffect(() => {
    if (open) fetchCount();
  }, [open, fetchCount]);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (dispRef.current && !dispRef.current.contains(t)) setDispOpen(false);
      if (mobileRegionRef.current && !mobileRegionRef.current.contains(t)) setMobileRegionOpen(false);
      if (districtRef.current && !districtRef.current.contains(t)) setDistrictOpenFor(null);
      if (
        locSearchRef.current &&
        !locSearchRef.current.contains(t) &&
        !(t as Element).closest?.("[data-loc-toggle]")
      ) {
        setLocationMode("map");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggleRegion = (id: string) => {
    // Blokuj jen výběr prázdného kraje — odznačení musí jít vždy
    if (!selectedRegions.includes(id) && (activeRegions[id] || 0) === 0) return;
    setSelectedRegions((prev) => {
      const next = prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id];
      if (!prev.includes(id)) setDistrictOpenFor(id);
      else {
        setDistrictOpenFor(null);
        setSelectedDistricts((d) => { const n = { ...d }; delete n[id]; return n; });
      }
      return next;
    });
  };

  /** Návrhy pro textové vyhledávání lokality (bez diakritiky) */
  const locResults = locQuery.trim().length >= 2
    ? LOC_SUGGESTIONS.filter((s) => normalize(s.label).includes(normalize(locQuery))).slice(0, 8)
    : LOC_SUGGESTIONS.filter((s) => FREQUENT_LABELS.includes(s.label));

  const pickSuggestion = (s: LocSuggestion) => {
    if ((activeRegions[s.regionId] || 0) === 0) return;
    if (!selectedRegions.includes(s.regionId)) {
      setSelectedRegions((prev) => [...prev, s.regionId]);
    }
    if (s.district) {
      setSelectedDistricts((prev) => {
        const cur = prev[s.regionId] ?? [];
        if (cur.includes(s.district!)) return prev;
        return { ...prev, [s.regionId]: [...cur, s.district!] };
      });
    }
    setLocQuery("");
  };

  const handleSubmit = () => {
    // Bez vybraného typu nabídky vede výsledek na kompletní nabídku
    const category = OFFER_CATEGORY[offerType] ?? "vse";
    const params = new URLSearchParams();
    if (propertyType) {
      const slug = KIND_SLUG[KIND_MAP[propertyType]];
      if (slug) params.set("typ", slug);
    }
    if (selectedRegions.length > 0) params.set("kraj", selectedRegions.join(","));
    const districts = Object.values(selectedDistricts).flat();
    if (districts.length) params.set("okres", districts.join(","));
    if (disposition) params.set("dispozice", disposition);
    if (area > 0) params.set("plocha_min", String(area));
    const pMin = priceSteps[priceMinIdx];
    const pMax = priceSteps[priceMaxIdx];
    if (pMin > 0) params.set("cena_min", String(pMin));
    if (priceMaxIdx < maxIdx) params.set("cena_max", String(pMax));
    const qs = params.toString();
    if (en) {
      const englishCategory =
        category === "prodej"
          ? "for-sale"
          : category === "pronajem"
            ? "to-let"
            : category === "investicni"
              ? "investment"
              : "all";
      const englishParams = new URLSearchParams();
      const typeMap: Record<string, string> = {
        byt: "apartment",
        dum: "house",
        pozemek: "land",
        komercni: "commercial",
      };
      params.forEach((value, key) => {
        const keyMap: Record<string, string> = {
          typ: "type",
          kraj: "region",
          okres: "district",
          dispozice: "layout",
          plocha_min: "area_min",
          cena_min: "price_min",
          cena_max: "price_max",
        };
        englishParams.set(keyMap[key] ?? key, key === "typ" ? typeMap[value] ?? value : value);
      });
      const englishQuery = englishParams.toString();
      window.location.href = `/en/properties/${englishCategory}${englishQuery ? `?${englishQuery}` : ""}`;
    } else {
      window.location.href = `/nabidka/${category}${qs ? `?${qs}` : ""}`;
    }
  };

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[80] h-[100dvh] transition-all duration-500 ease-luxe ${
        open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={en ? "Property search" : "Vyhledávání nemovitostí"}
    >
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div
        className={`absolute inset-0 bg-white flex flex-col transition-all duration-500 ease-luxe ${
          open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        {/* ── Header — na mobilu jen plovoucí křížek v rohu (šetří výšku) ── */}
        <div className="hidden shrink-0 items-center justify-between px-8 pt-8 pb-0 md:flex md:px-12 lg:px-16">
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-[-0.02em] text-ink">
            {en ? "Find a property" : "Hledám"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={en ? "Close" : "Zavřít"}
            className="flex h-10 w-10 items-center justify-center text-ink transition-transform duration-300 hover:rotate-90"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={en ? "Close" : "Zavřít"}
          className="absolute right-2 top-2 z-30 flex h-11 w-11 items-center justify-center text-ink transition-transform duration-300 hover:rotate-90 md:hidden"
        >
          <X size={22} strokeWidth={1.5} />
        </button>

        {/* ── Content — kompaktní layout bez scrollu ── */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 pt-4 pb-3 md:px-12 lg:px-16">
          <div className="mx-auto flex min-h-0 w-full max-w-[1050px] flex-1 flex-col gap-4">

            {/* Typ nabídky + Cena — na desktopu jeden řádek, na mobilu samostatně (kvůli pořadí) */}
            <div className="max-md:contents md:grid md:grid-cols-2 md:gap-6">
              <div className="max-md:order-1">
                <p className="text-[14px] font-semibold text-ink mb-2 tracking-wide uppercase">{en ? "Listing type" : "Typ nabídky"}</p>
                <div className="flex gap-0">
                  {OFFER_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const next = offerType === type ? "" : type;
                        setOfferType(next);
                        setPriceMinIdx(0);
                        setPriceMaxIdx(next === "Pronájem" ? PRICE_STEPS_RENT.length - 1 : PRICE_STEPS_SALE.length - 1);
                      }}
                      className={`px-6 py-2 text-[14px] border transition-all duration-150 ${
                        offerType === type
                          ? "border-ink bg-white font-semibold text-ink z-10"
                          : "border-[#e0e0e0] bg-white text-[#999] hover:text-ink -ml-px first:ml-0"
                      }`}
                    >
                      {en ? OFFER_LABEL_EN[type] : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cena */}
              <div className="max-md:order-4">
                <p className="text-[14px] font-semibold text-ink mb-2 tracking-wide uppercase">{en ? "Price" : "Cena"}</p>
                <div className="max-w-[440px]">
                  <div className="relative h-[24px]">
                    <div className="absolute top-[11px] left-0 right-0 h-[2px] bg-[#e5e5e5]" />
                    <div
                      className="absolute top-[11px] h-[2px] bg-ink"
                      style={{
                        left: `${(priceMinIdx / maxIdx) * 100}%`,
                        right: `${100 - (priceMaxIdx / maxIdx) * 100}%`,
                      }}
                    />
                    <input
                      type="range" min="0" max={maxIdx} value={priceMinIdx}
                      onChange={(e) => { const v = Number(e.target.value); if (v < priceMaxIdx) setPriceMinIdx(v); }}
                      className="price-range absolute inset-0 w-full"
                    />
                    <input
                      type="range" min="0" max={maxIdx} value={priceMaxIdx}
                      onChange={(e) => { const v = Number(e.target.value); if (v > priceMinIdx) setPriceMaxIdx(v); }}
                      className="price-range absolute inset-0 w-full"
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[13px] text-[#666] font-medium">
                    <span>{formatPrice(priceSteps[priceMinIdx], en)}</span>
                    <span>{priceMaxIdx >= maxIdx ? (en ? "No maximum" : "Neomezeně") : formatPrice(priceSteps[priceMaxIdx], en)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Typ nemovitosti */}
            <div className="max-md:order-2">
              <p className="text-[14px] font-semibold text-ink mb-2 tracking-wide uppercase">{en ? "Property type" : "Typ nemovitosti"}</p>
              <div className="flex flex-wrap gap-x-0.5 gap-y-1">
                <span className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setPropertyType("")}
                    className={`px-3 py-1.5 text-[14px] border transition-all duration-150 ${
                      !propertyType
                        ? "border-ink bg-white font-bold text-ink"
                        : "border-transparent text-[#666] font-medium hover:text-ink"
                    }`}
                  >
                    {en ? "All" : "Vše"}
                  </button>
                  <span className="text-[#ccc] text-[11px] mx-0">|</span>
                </span>
                {PROPERTY_TYPES.map((type, i) => (
                  <span key={type} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setPropertyType(propertyType === type ? "" : type)}
                      className={`px-3 py-1.5 text-[14px] border transition-all duration-150 ${
                        propertyType === type
                          ? "border-ink bg-white font-bold text-ink"
                          : "border-transparent text-[#666] font-medium hover:text-ink"
                      }`}
                    >
                      {en ? PROPERTY_LABEL_EN[type] ?? type : type}
                    </button>
                    {i < PROPERTY_TYPES.length - 1 && (
                      <span className="text-[#ccc] text-[11px] mx-0">|</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Dispozice + Plocha — side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-md:order-5">
              {/* Dispozice */}
              <div>
                <p className="text-[14px] font-semibold text-ink mb-2 tracking-wide uppercase">{en ? "Layout" : "Dispozice"}</p>
                <div className="relative max-w-[280px]" ref={dispRef}>
                  <button
                    type="button"
                    onClick={() => setDispOpen(!dispOpen)}
                    className="flex w-full items-center justify-between border border-[#e0e0e0] px-4 py-2.5 text-[14px] bg-white transition-colors hover:border-[#bbb]"
                  >
                    <span className={disposition ? "text-ink font-semibold" : "text-[#777] font-medium"}>
                      {disposition || (en ? "Select a layout" : "Vyberte dispozice")}
                    </span>
                    <ChevronDown
                      size={14} strokeWidth={1.5}
                      className={`text-[#999] transition-transform duration-200 ${dispOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {dispOpen && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-full border border-[#e0e0e0] bg-white shadow-md max-md:hidden">
                      <button type="button" onClick={() => { setDisposition(""); setDispOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-[14px] hover:bg-[#f5f5f5] ${!disposition ? "font-semibold text-ink" : "text-[#666]"}`}>
                        {en ? "Select a layout" : "Vyberte dispozice"}
                      </button>
                      {DISPOSITIONS.map((d) => (
                        <button key={d} type="button" onClick={() => { setDisposition(d); setDispOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-[14px] hover:bg-[#f5f5f5] ${disposition === d ? "font-semibold text-ink" : "text-[#666]"}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Fullscreen výběr dispozice na mobilu */}
                  {dispOpen && (
                    <div className="fixed inset-x-0 top-0 z-40 flex h-[100dvh] flex-col bg-white md:hidden">
                      <div className="flex shrink-0 items-center justify-between border-b border-[#eee] px-5 py-4">
                        <p className="text-[19px] font-semibold tracking-[-0.01em] text-ink">{en ? "Layout" : "Dispozice"}</p>
                        <button
                          type="button"
                          onClick={() => setDispOpen(false)}
                          aria-label={en ? "Close layout selection" : "Zavřít výběr dispozice"}
                          className="flex h-10 w-10 items-center justify-center text-ink transition-transform duration-300 hover:rotate-90"
                        >
                          <X size={20} strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto py-1">
                        <button
                          type="button"
                          onClick={() => { setDisposition(""); setDispOpen(false); }}
                          className={`flex w-full items-center justify-between px-5 py-3.5 text-left text-[16px] ${!disposition ? "bg-[#faf9f6] font-semibold text-ink" : "text-ink active:bg-[#faf9f6]"}`}
                        >
                          {en ? "All — no restriction" : "Vše — bez omezení"}
                          {!disposition && <Check size={17} strokeWidth={2.5} className="text-[#8a6d43]" />}
                        </button>
                        {DISPOSITIONS.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => { setDisposition(d); setDispOpen(false); }}
                            className={`flex w-full items-center justify-between px-5 py-3.5 text-left text-[16px] ${disposition === d ? "bg-[#faf9f6] font-semibold text-ink" : "text-ink active:bg-[#faf9f6]"}`}
                          >
                            {d}
                            {disposition === d && <Check size={17} strokeWidth={2.5} className="text-[#8a6d43]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Plocha */}
              <div>
                <p className="text-[14px] font-semibold text-ink mb-2 tracking-wide uppercase">{en ? "Floor area" : "Plocha"}</p>
                <div className="flex flex-wrap gap-x-0.5 gap-y-1">
                  {AREA_OPTIONS.map((opt, i) => (
                    <span key={opt.value} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setArea(opt.value)}
                        className={`px-3 py-1.5 text-[14px] border transition-all duration-150 ${
                          area === opt.value
                            ? "border-ink bg-white font-bold text-ink"
                            : "border-transparent text-[#666] font-medium hover:text-ink"
                        }`}
                      >
                        {en && opt.value === 0 ? "No minimum" : opt.label}
                      </button>
                      {i < AREA_OPTIONS.length - 1 && (
                        <span className="text-[#ccc] text-[11px] mx-0">|</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Lokalita + Map — vyplní zbývající výšku ── */}
            <div className="relative flex flex-1 flex-col max-md:order-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-y-2">
                <p className="text-[14px] font-semibold text-ink tracking-wide uppercase">{en ? "Location" : "Lokalita"}</p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <span className="flex items-center gap-1.5 text-[13px] text-[#666] font-medium">
                    {en ? "Czech Republic" : "Česká republika"}
                    <ChevronDown size={12} strokeWidth={1.5} />
                  </span>
                  {selectedRegions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setSelectedRegions([]); setSelectedDistricts({}); }}
                      className="flex items-center gap-1 text-[12px] text-[#888] hover:text-ink transition-colors"
                    >
                      <X size={12} strokeWidth={1.5} />
                      {en ? "Clear selection" : "Zrušit výběr"}
                    </button>
                  )}
                  <button
                    type="button"
                    data-loc-toggle
                    onClick={() => setLocationMode((m) => (m === "map" ? "search" : "map"))}
                    className="flex items-center gap-1.5 border border-[#e0ddd6] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-ink transition-all duration-300 hover:border-ink"
                  >
                    {locationMode === "map" ? (
                      <>
                        <SlidersHorizontal size={13} strokeWidth={1.8} />
                        {en ? "Refine location" : "Upřesnit lokalitu"}
                      </>
                    ) : (
                      <>
                        <MapIcon size={13} strokeWidth={1.8} />
                        {en ? "Select on map" : "Vybrat lokalitu na mapě"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobil — místo mapy dropdown Region → Vybrat (S&W) */}
              <div className="mb-3 md:hidden" ref={mobileRegionRef}>
                <p className="mb-1.5 text-[13px] text-[#999]">{en ? "Region" : "Region"}</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMobileRegionOpen((v) => !v)}
                    className="flex min-h-[50px] w-full items-center justify-between gap-2 border border-[#d8d5cf] bg-white px-3 py-2 transition-colors hover:border-ink"
                  >
                    {selectedRegions.length ? (
                      <span className="flex flex-wrap items-center gap-1.5">
                        {selectedRegions.map((id) => {
                          const r = REGIONS.find((reg) => reg.id === id);
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1.5 bg-[#1a2744] px-2.5 py-1 text-[13px] font-semibold text-white"
                            >
                              {regionLabel(r, en)}
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRegion(id);
                                }}
                                className="text-white/70 hover:text-white"
                              >
                                <X size={11} strokeWidth={2} />
                              </span>
                            </span>
                          );
                        })}
                      </span>
                    ) : (
                      <span className="px-1 text-[15px] text-[#9a968f]">{en ? "Select" : "Vybrat"}</span>
                    )}
                    <ChevronDown
                      size={15}
                      strokeWidth={1.5}
                      className={`shrink-0 text-[#999] transition-transform duration-200 ${mobileRegionOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {/* Fullscreen výběr regionu — bez scrollu stránky */}
                  {mobileRegionOpen && (
                    <div className="fixed inset-x-0 top-0 z-40 flex h-[100dvh] flex-col bg-white md:hidden">
                      <div className="flex shrink-0 items-center justify-between border-b border-[#eee] px-5 py-4">
                        <p className="text-[19px] font-semibold tracking-[-0.01em] text-ink">Region</p>
                        <button
                          type="button"
                          onClick={() => setMobileRegionOpen(false)}
                          aria-label={en ? "Close region selection" : "Zavřít výběr regionu"}
                          className="flex h-10 w-10 items-center justify-center text-ink transition-transform duration-300 hover:rotate-90"
                        >
                          <X size={20} strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto py-1">
                        {ORDERED_REGIONS.map((r) => {
                          const count = activeRegions[r.id] || 0;
                          const isSelected = selectedRegions.includes(r.id);
                          const disabled = count === 0 && !isSelected;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => toggleRegion(r.id)}
                              className={`flex w-full items-center gap-4 px-5 py-3.5 text-left text-[16px] transition-colors ${
                                disabled
                                  ? "cursor-not-allowed text-[#c0bdb8]"
                                  : isSelected
                                    ? "bg-[#faf9f6] font-semibold text-ink"
                                    : "text-ink active:bg-[#faf9f6]"
                              }`}
                            >
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center ${
                                  isSelected ? "bg-[#1a2744]" : "bg-[#f0efed]"
                                }`}
                              >
                                {isSelected && <Check size={14} strokeWidth={2.5} className="text-white" />}
                              </span>
                              <span className="flex-1">
                                {regionLabel(r, en)}
                              </span>
                              <span className="text-[13px] text-[#b0aca5]">({count})</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="shrink-0 border-t border-[#eee] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                        <button
                          type="button"
                          onClick={() => setMobileRegionOpen(false)}
                          className="w-full bg-ink py-3.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-[#1a2744]"
                        >
                          {en ? "Confirm selection" : "Potvrdit výběr"}{selectedRegions.length ? ` (${selectedRegions.length})` : ""}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tagy vybraných krajů — pod řádkem Česká republika, žádný scroll */}
              {selectedRegions.length > 0 && (
                <div className="relative z-20 w-full shrink-0 pb-1" ref={districtRef}>
                  <div className="flex w-full flex-wrap justify-end gap-1.5">
                    {selectedRegions.map((id) => {
                      const r = REGIONS.find((reg) => reg.id === id);
                      const count = activeRegions[id] || 0;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setDistrictOpenFor(districtOpenFor === id ? null : id)}
                          className="inline-flex items-center gap-2 bg-[#1a2744] px-4 py-2 text-[14px] text-white font-medium transition-colors hover:bg-[#243352]"
                        >
                          {regionLabel(r, en)}
                          {selectedDistricts[id]?.length ? (
                            <span className="text-white/80 text-[13px]">
                              · {selectedDistricts[id].length <= 3
                                ? selectedDistricts[id].join(", ")
                                : `${selectedDistricts[id].length} ${en ? "areas" : "oblastí"}`}
                            </span>
                          ) : null}
                          <span className="text-white/60 text-[13px]">({count})</span>
                          <ChevronDown size={10} strokeWidth={2} className={`transition-transform ${districtOpenFor === id ? "rotate-180" : ""}`} />
                          <span
                            onClick={(e) => { e.stopPropagation(); toggleRegion(id); }}
                            className="ml-1 hover:text-white/60"
                          >
                            <X size={10} strokeWidth={2} />
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Panel okresů — otevírá se dolů přes mapu */}
                  {districtOpenFor && DISTRICTS[districtOpenFor] && (
                    <div className="absolute right-0 top-full z-30 mt-3 w-[min(860px,calc(100vw-4rem))] border border-[#e6e3dd] bg-white/95 px-6 py-5 shadow-[0_24px_60px_rgba(20,24,26,0.16),0_4px_16px_rgba(20,24,26,0.08)] backdrop-blur-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-[13px] font-semibold uppercase tracking-wide text-ink">
                          {en ? "Refine area" : "Upřesnit oblast"}
                          <span className="ml-2 font-medium normal-case tracking-normal text-[#999]">
                            — {regionLabel(REGIONS.find(r => r.id === districtOpenFor), en)}
                          </span>
                        </p>
                        <button
                          type="button"
                          onClick={() => setDistrictOpenFor(null)}
                          aria-label={en ? "Close area selection" : "Zavřít výběr oblasti"}
                          className="flex h-7 w-7 items-center justify-center text-[#999] transition-colors hover:text-ink"
                        >
                          <X size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {DISTRICTS[districtOpenFor].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              setSelectedDistricts((prev) => {
                                const cur = prev[districtOpenFor!] ?? [];
                                const next = cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d];
                                const n = { ...prev };
                                if (next.length) n[districtOpenFor!] = next;
                                else delete n[districtOpenFor!];
                                return n;
                              });
                            }}
                            className={`px-4 py-2 text-[14px] border transition-all duration-200 ${
                              selectedDistricts[districtOpenFor]?.includes(d)
                                ? "border-[#1a2744] bg-[#1a2744] text-white font-semibold shadow-[0_4px_14px_rgba(26,39,68,0.3)]"
                                : "border-[#e0ddd6] bg-white text-[#555] font-medium hover:border-[#1a2744] hover:text-ink hover:shadow-sm"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                      <div className="mt-5 flex justify-end border-t border-[#f0eeea] pt-4">
                        <button
                          type="button"
                          onClick={() => setDistrictOpenFor(null)}
                          className="bg-ink px-8 py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-paper transition-colors duration-300 hover:bg-[#1a2744]"
                        >
                          {en ? "Done" : "Hotovo"}{selectedDistricts[districtOpenFor]?.length ? ` (${selectedDistricts[districtOpenFor].length})` : ""}
                        </button>
                      </div>
                      {/* Šipka nahoru k tagu */}
                      <span className="absolute bottom-full right-10 border-8 border-transparent border-b-white" />
                    </div>
                  )}
                </div>
              )}

              {/* ── Textové vyhledávání lokality — plovoucí popup nad mapou ── */}
              {locationMode === "search" && (
                <div
                  ref={locSearchRef}
                  className="z-30 border-[#e6e3dd] bg-white max-md:fixed max-md:inset-x-0 max-md:top-0 max-md:z-40 max-md:flex max-md:h-[100dvh] max-md:flex-col md:absolute md:left-1/2 md:top-10 md:w-[min(760px,calc(100%-1rem))] md:-translate-x-1/2 md:border md:shadow-[0_32px_80px_rgba(20,24,26,0.22),0_8px_24px_rgba(20,24,26,0.1)]"
                >
                  <div className="flex shrink-0 items-center justify-between border-b border-[#f0eeea] px-5 py-3.5 max-md:py-4">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink max-md:text-[17px] max-md:normal-case max-md:tracking-[-0.01em]">{en ? "Search locations" : "Vyhledávání lokality"}</p>
                    <button
                      type="button"
                      onClick={() => setLocationMode("map")}
                      aria-label={en ? "Close location search" : "Zavřít vyhledávání"}
                      className="flex h-7 w-7 items-center justify-center text-[#999] transition-colors hover:text-ink"
                    >
                      <X size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="shrink-0 p-4 pb-0 max-md:px-5">
                    <div className="relative">
                      <input
                        type="text"
                        value={locQuery}
                        onChange={(e) => setLocQuery(e.target.value)}
                        placeholder={en ? "Enter a city, neighbourhood, street or development" : "Zadejte město, čtvrť, ulici nebo projekt"}
                        autoFocus
                        className="w-full border border-[#d8d5cf] bg-white px-4 py-3 pr-12 text-[15px] text-ink outline-none transition-colors placeholder:text-[#9a968f] focus:border-ink"
                      />
                      <Search
                        size={18}
                        strokeWidth={1.6}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#999]"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto p-4 pt-2 max-md:flex-1 max-md:px-5 max-md:pb-[max(1rem,env(safe-area-inset-bottom))] md:max-h-[44vh]">
                    {locQuery.trim().length < 2 && (
                      <p className="px-1 pt-2 pb-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#999]">
                        {en ? "Popular searches" : "Často hledané"}
                      </p>
                    )}
                    {locResults.length === 0 ? (
                      <p className="px-1 py-4 text-[14px] text-[#999]">
                        {en ? `No locations found for “${locQuery}”. Try another name.` : `Pro „${locQuery}" jsme nic nenašli — zkuste jiný název.`}
                      </p>
                    ) : (
                      locResults.map((s) => {
                        const disabled = (activeRegions[s.regionId] || 0) === 0;
                        const isPicked = s.district
                          ? selectedDistricts[s.regionId]?.includes(s.district)
                          : selectedRegions.includes(s.regionId);
                        return (
                          <button
                            key={`${s.regionId}-${s.district ?? "region"}-${s.label}`}
                            type="button"
                            onClick={() => pickSuggestion(s)}
                            disabled={disabled}
                            className={`flex w-full items-center justify-between border-b border-[#f0eeea] px-1 py-3 text-left transition-colors last:border-b-0 ${
                              disabled ? "cursor-not-allowed opacity-45" : "hover:bg-[#faf9f6]"
                            }`}
                          >
                            <span>
                              <span className={`block text-[15px] ${isPicked ? "font-bold text-ink" : "font-semibold text-ink"}`}>
                                {en && !s.district ? regionLabel(REGIONS.find((r) => r.id === s.regionId), true) : s.label}
                                {isPicked && <span className="ml-2 text-[12px] font-semibold text-bronze-deep">✓ {en ? "selected" : "vybráno"}</span>}
                              </span>
                              <span className="mt-0.5 block text-[13px] text-[#999]">
                                {en
                                  ? `${s.district ? `${regionLabel(REGIONS.find((r) => r.id === s.regionId), true)}, ` : ""}Czech Republic`
                                  : s.sub}
                              </span>
                            </span>
                            <span className="ml-4 shrink-0 text-[13px] text-[#b0aca5]">
                              {en ? s.district ? (s.regionId === "prague" ? "Municipal district" : "District") : "Region" : s.typeLabel}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <div className="shrink-0 border-t border-[#f0eeea] p-4 max-md:px-5 max-md:pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <button
                      type="button"
                      onClick={() => setLocationMode("map")}
                      className="w-full bg-ink py-3.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-[#1a2744]"
                    >
                      {en ? "Done" : "Hotovo"}
                      {(() => {
                        const n = selectedRegions.length + Object.values(selectedDistricts).flat().length;
                        return n > 0 ? ` (${n})` : "";
                      })()}
                    </button>
                  </div>
                </div>
              )}

              <div className="relative hidden w-full flex-1 flex-col items-center justify-center md:flex">
                <svg
                  viewBox="0 0 600 300"
                  className="mx-auto w-full max-w-full md:h-[clamp(420px,52vh,580px)] md:w-auto [filter:drop-shadow(0_20px_35px_rgba(20,24,26,0.14))_drop-shadow(0_4px_10px_rgba(20,24,26,0.08))]"
                  role="img"
                  aria-label={en ? "Map of regions in the Czech Republic" : "Mapa krajů České republiky"}
                >
                  {REGIONS.filter(r => r.id !== "prague").map((region) => {
                    const isSelected = selectedRegions.includes(region.id);
                    const isHovered = hoveredRegion === region.id;
                    const hasListings = (activeRegions[region.id] || 0) > 0;
                    const isDisabled = !hasListings;
                    return (
                      <g
                        key={region.id}
                        onClick={() => toggleRegion(region.id)}
                        onMouseEnter={() => setHoveredRegion(region.id)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
                        role="button"
                        aria-label={regionLabel(region, en)}
                        aria-pressed={isSelected}
                      >
                        <path
                          d={region.path}
                          fill={
                            isSelected
                              ? "#1a2744"
                              : isDisabled
                                ? "#f0efed"
                                : isHovered
                                  ? "#d5d0c8"
                                  : "#eae8e4"
                          }
                          stroke="#fff"
                          strokeWidth="1.5"
                          className="transition-[fill,filter] duration-200"
                          style={isSelected ? { filter: "drop-shadow(0 5px 12px rgba(26,39,68,0.45))" } : undefined}
                        />
                        <text
                          x={region.labelX}
                          y={region.labelY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={
                            isSelected
                              ? "#fff"
                              : isDisabled
                                ? "#adaaa4"
                                : "#14181A"
                          }
                          fontSize="11"
                          fontWeight={isSelected ? 700 : 600}
                          className="pointer-events-none select-none"
                          style={{ fontFamily: "inherit" }}
                        >
                          {regionLabel(region, en)}
                        </text>
                      </g>
                    );
                  })}
                  {/* Praha — on top */}
                  {(() => {
                    const region = REGIONS.find(r => r.id === "prague")!;
                    const isSelected = selectedRegions.includes("prague");
                    const isHovered = hoveredRegion === "prague";
                    const hasListings = (activeRegions["prague"] || 0) > 0;
                    const isDisabled = !hasListings;
                    return (
                      <g
                        onClick={() => toggleRegion("prague")}
                        onMouseEnter={() => setHoveredRegion("prague")}
                        onMouseLeave={() => setHoveredRegion(null)}
                        className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
                        role="button"
                        aria-label={regionLabel(region, en)}
                        aria-pressed={isSelected}
                        transform="translate(213,122) scale(1.6) translate(-213,-122)"
                      >
                        <path
                          d={region.path}
                          fill={
                            isSelected
                              ? "#1a2744"
                              : isDisabled
                                ? "#e8e6e2"
                                : isHovered
                                  ? "#ccc8c0"
                                  : "#e0ddd8"
                          }
                          stroke="#fff"
                          strokeWidth="0.7"
                          className="transition-[fill,filter] duration-200"
                          style={isSelected ? { filter: "drop-shadow(0 3px 7px rgba(26,39,68,0.45))" } : undefined}
                        />
                        <text
                          x={region.labelX}
                          y={region.labelY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={
                            isSelected
                              ? "#fff"
                              : isDisabled
                                ? "#adaaa4"
                                : "#14181A"
                          }
                          fontSize="7"
                          fontWeight={700}
                          className="pointer-events-none select-none"
                          style={{ fontFamily: "inherit" }}
                        >
                          Praha
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer bar — jedna řada i na mobilu (S&W) ── */}
        <div className="shrink-0 flex items-center justify-between gap-3 border-t border-[#eee] bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-12 md:py-3.5 lg:px-16">
          <button
            type="button"
            onClick={resetFilters}
            className="flex shrink-0 items-center gap-2 text-[14px] text-[#666] transition-colors hover:text-ink font-semibold"
          >
            <X size={14} strokeWidth={1.5} />
            {en ? "Reset" : "Resetovat"}<span className="max-md:hidden">&nbsp;{en ? "filters" : "filtry"}</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="group relative flex items-center justify-center gap-3 overflow-hidden bg-ink px-5 py-3.5 text-[14px] font-semibold text-paper tracking-wide transition-all duration-500 hover:bg-[#1a2744] hover:shadow-[0_8px_32px_rgba(20,24,26,0.35)] md:px-10 md:py-4"
          >
            <span className="relative z-10">
              {en ? "View" : "Zobrazit"}<span className="max-md:hidden"> {en ? "matching" : "odpovídající"}</span> {en ? "properties" : "nabídky"}
            </span>
            <span className="relative z-10 inline-flex items-center justify-center rounded-full bg-paper/15 px-3 py-0.5 text-[12px] font-bold tabular-nums">
              {loading ? "…" : resultCount ?? "—"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-paper/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
        </div>
      </div>
    </div>
  );
}
