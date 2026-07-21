export type Article = {
  id: string;
  category: string;
  title: string;
  date: string;
  image: string;
};

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const ARTICLES: Article[] = [
  {
    id: "a1",
    category: "Trh",
    title: "Pražský trh v číslech: ceny bytů letos rostou o sedm procent",
    date: "2. července 2026",
    image: img("1512917774080-9991f1c4c750"),
  },
  {
    id: "a2",
    category: "Financování",
    title: "Hypotéky míří pod čtyři procenta. Co to znamená pro kupující",
    date: "28. června 2026",
    image: img("1600047509807-ba8f99d2cdde", 800),
  },
  {
    id: "a3",
    category: "Lokality",
    title: "Vinohrady, Karlín, Holešovice: kam se přesouvá poptávka",
    date: "21. června 2026",
    image: img("1541849546-216549ae216d", 800),
  },
  {
    id: "a4",
    category: "Tip",
    title: "Home staging v praxi: jak připravit nemovitost na prodej",
    date: "14. června 2026",
    image: img("1493809842364-78817add7ffb", 800),
  },
  {
    id: "a5",
    category: "Analýza",
    title: "Nájemní bydlení zdražuje. Investoři se vracejí k činžovním domům",
    date: "7. června 2026",
    image: img("1486406146926-c627a92ad1ab", 800),
  },
];
