const footerColumns = [
  {
    title: "Produkt",
    links: [
      "Šablony webů",
      "Web builder",
      "Web design",
      "Live editor",
      "Hosting",
      "Domény",
      "SEO základ",
      "Mobilní web",
      "AI web builder",
    ],
  },
  {
    title: "Řešení",
    links: [
      "Web pro služby",
      "Rezervace online",
      "Portfolio web",
      "Firemní prezentace",
      "Web pro salon",
      "Web pro poradce",
      "Petra Studio",
      "Profesionální nástroje",
      "Landing page",
    ],
  },
  {
    title: "Učení",
    links: [
      "Jak začít",
      "Průvodce šablonami",
      "SEO tipy",
      "Úprava obsahu",
      "Práce s obrázky",
    ],
  },
  {
    title: "Podpora",
    links: [
      "Centrum pomoci",
      "Kontakt",
      "Najmout profesionála",
      "Nahlásit problém",
      "Stav systému",
    ],
  },
  {
    title: "Společnost",
    links: [
      "O nás",
      "Partneři",
      "Reference",
      "Kariéra",
      "Podmínky",
      "Mapa webu",
    ],
  },
];

const socialLinks = ["f", "▶", "◎", "♪", "P", "𝕏", "in"];

export function PlatformFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white text-[#1f1f1f]">
      <div className="h-6 bg-gradient-to-r from-[#f5f3ff] via-[#9bb7ff] to-[#f1d6ff]" />

      <div className="mx-auto max-w-[1760px] px-6 py-[60px] sm:px-10 lg:px-16">
        <div className="grid gap-9 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1.25fr]">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-[17px] font-semibold tracking-normal text-black">{column.title}</h2>
              <ul className="mt-[18px] space-y-[14px] text-[14px] leading-none text-[#2f2f2f]">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#start" className="transition hover:text-[#17684f]">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:pl-[18px]">
            <p className="text-[33px] font-black leading-none tracking-normal text-black">VENOM</p>
            <p className="mt-9 max-w-[260px] text-[14px] leading-6 text-[#4a4a4a]">
              Venom je web builder pro firmy, živnostníky a tvůrce, kteří chtějí
              rychle vytvořit profesionální web bez složitého vývoje. Spojuje
              šablony, live editor a jednoduché spuštění demo webu v jednom nástroji.
            </p>
            <div className="mt-9 space-y-3 text-[14px] font-semibold">
              <a href="#jak-to-funguje" className="block transition hover:text-[#17684f]">O platformě</a>
              <a href="#kontakt" className="block transition hover:text-[#17684f]">Kontaktujte nás</a>
            </div>
          </div>
        </div>

        <div className="mt-[60px] border-t border-slate-200 pt-[30px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item}
                  href="#start"
                  className="grid h-6 w-6 place-items-center bg-black text-[13px] font-black leading-none text-white transition hover:bg-[#17684f]"
                  aria-label={`Sociální síť ${item}`}
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-4 text-[13px] text-[#2f2f2f] sm:flex-row sm:items-center sm:gap-10">
              <a href="#podminky" className="transition hover:text-[#17684f]">Obchodní podmínky</a>
              <a href="#soukromi" className="transition hover:text-[#17684f]">Ochrana osobních údajů</a>
              <p>© {year} Venom SaaS</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
