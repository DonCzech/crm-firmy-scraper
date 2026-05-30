"use client";

import Image from "next/image";
import { useState } from "react";
import { OnboardingModal } from "./onboarding/OnboardingModal";

const templates = [
  {
    name: "Barber & Salon",
    previewImage: "/images/template-previews/barber-hero-1440x900.webp",
    logo: "/images/logos/demo-barber-logo.svg",
    desc: "Tmavý prémiový web pro salony, barbery a služby se silnou vizuální prezentací.",
    tags: ["Ceník", "Galerie", "Rezervace"],
    dark: true,
  },
  {
    name: "Wellness & Masáže",
    previewImage: "/images/template-gallery/wellness-05-relax-massage-full-1920x1080.webp",
    logo: "/images/logos/demo-wellness-logo.svg",
    desc: "Jemná šablona pro procedury, masáže, terapeutky a lokální wellness studio.",
    tags: ["Procedury", "FAQ", "Kontakt"],
    dark: false,
  },
  {
    name: "Advokát & Poradce",
    previewImage: "/images/template-previews/lawyer-hero-1440x900.webp",
    logo: "/images/logos/demo-lawyer-logo.svg",
    desc: "Seriózní prezentace pro právníky, konzultanty a poradenské služby.",
    tags: ["Služby", "Reference", "SEO"],
    dark: false,
  },
  {
    name: "Petra Studio",
    previewImage: "/images/template-previews/petra-hero-1787x880.webp",
    logo: "/demo-assets/petra-logo.svg",
    desc: "Obsahová šablona pro konzultace, akce, digitální produkty a osobní brand.",
    tags: ["Podstránky", "Shop", "Obsah"],
    dark: false,
  },
];

const steps = [
  {
    title: "Vyberete šablonu",
    text: "Začnete hotovým webem pro konkrétní obor, ne prázdnou stránkou.",
  },
  {
    title: "Systém vytvoří demo",
    text: "Dostanete vlastní URL, náhled webu a přístup do administrace.",
  },
  {
    title: "Upravíte web kliknutím",
    text: "Texty, logo i obrázky měníte přímo ve stránce přes live editor.",
  },
];

export function SaasLanding() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section
        id="start"
        className="relative isolate min-h-screen overflow-hidden px-4 pb-20 pt-44 text-white sm:px-6 lg:px-8"
      >
        <Image
          src="/images/template-previews/petra-hero-1787x880.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/56 to-black/8" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />

        <div className="relative mx-auto max-w-[1660px]">
          <div className="max-w-[720px] pt-12 lg:pt-[92px]">
            <h1
              className="max-w-[720px] text-[38px] font-black leading-[1.08] tracking-normal !text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.72)] sm:text-[51px] lg:text-[66px]"
              style={{ color: "#fff" }}
            >
              Proměňte váš nápad
              <br />
              na úspěšný Web
            </h1>
            <p className="mt-6 max-w-[620px] text-lg font-bold leading-[1.45] text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.72)] sm:text-[22px]">
              Vyberte si šablonu, vytvořte demo a upravte texty, obrázky i logo přímo ve stránce.
            </p>
            <form
              className="relative mt-9 max-w-[620px] bg-white p-2 shadow-2xl shadow-black/25"
              onSubmit={(event) => {
                event.preventDefault();
                setShowModal(true);
              }}
            >
              <input
                type="email"
                placeholder="Zadejte pouze váš e-mail"
                className="h-[58px] w-full px-5 text-[18px] font-bold text-slate-900 outline-none placeholder:text-[#777] sm:h-[62px] sm:pr-[230px]"
              />
              <button
                type="submit"
                className="mt-2 h-[54px] w-full bg-[#28a745] px-7 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(40,167,69,0.28)] transition hover:bg-[#218838] hover:shadow-[0_14px_30px_rgba(40,167,69,0.38)] sm:absolute sm:bottom-2 sm:right-2 sm:top-2 sm:mt-0 sm:h-auto sm:w-auto sm:min-w-[205px]"
              >
                Vyzkoušet zdarma
              </button>
            </form>
            <p className="mt-5 max-w-[620px] text-[15px] font-semibold leading-[1.6] text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.72)]">
              Po odeslání získáte vlastní demo, veřejný náhled a přístup do editoru.
              Založení je nezávazné a bez čekání na vývojáře.
            </p>
          </div>
        </div>

        <a
          href="#jak-to-funguje"
          className="absolute bottom-8 left-1/2 hidden h-12 w-7 -translate-x-1/2 border-2 border-white/80 lg:block"
          aria-label="Přejít níže"
        >
          <span className="mx-auto mt-2 block h-3 w-1 rounded-full bg-white/80" />
        </a>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 border-b border-slate-200 pb-16 md:grid-cols-3">
          {[
            ["Bez programování", "Vše upravíte v prohlížeči přes editor ve stránce."],
            ["Demo před rozhodnutím", "Nejdřív si web založíte, projdete a upravíte."],
            ["Připravené pro obory", "Barber, wellness, advokát i Petra Studio zůstávají součástí builderu."],
          ].map(([title, text]) => (
            <div key={title} className="border-l-4 border-[#9a7a4f] pl-5">
              <h2 className="text-xl font-black text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="jak-to-funguje" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-wide text-[#14532d]">Jak to funguje</p>
            <h2 className="mt-3 text-4xl font-black tracking-normal text-slate-950">
              Web založíte stejně snadno jako e-shop.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded border border-slate-200 bg-[#f8fafc] p-7">
                <span className="grid h-10 w-10 place-items-center rounded bg-[#14532d] text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-6 text-xl font-black text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sablony" className="bg-[#f1f5f9] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#14532d]">Šablony</p>
              <h2 className="mt-3 max-w-2xl text-4xl font-black tracking-normal text-slate-950">
                Vyberte hotový web a upravte ho pro svůj obor.
              </h2>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full rounded bg-[#14532d] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0f3f23] md:w-auto"
            >
              Spustit výběr šablony
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {templates.map((template) => (
              <article
                key={template.name}
                className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image src={template.previewImage} alt="" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
                  <div className={template.dark ? "absolute inset-0 bg-black/35" : "absolute inset-0 bg-white/10"} />
                  <div className="absolute left-4 top-4 h-10 w-36 rounded bg-white/95 p-1.5 shadow">
                    <Image src={template.logo} alt={template.name} fill sizes="144px" className="object-contain p-1.5" unoptimized />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-slate-950">{template.name}</h3>
                  <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">{template.desc}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <span key={tag} className="rounded bg-[#ecfdf5] px-3 py-1 text-xs font-bold text-[#14532d]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-6 w-full rounded bg-[#9a7a4f] px-4 py-3 text-sm font-black text-white transition hover:bg-[#80643f]"
                  >
                    Vybrat šablonu
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#14532d]">Editor zůstává</p>
            <h2 className="mt-3 text-4xl font-black tracking-normal text-slate-950">
              Upravujete rovnou výsledek, který uvidí zákazník.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Po založení demo webu otevřete admin. Kliknete na text, změníte ho,
              nahrajete fotku nebo logo a systém změny ukládá do databáze.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Live text", "Nadpisy, tlačítka, menu i patičku měníte kliknutím."],
              ["Obrázky", "Hero fotky, galerie a loga lze nahrát přímo v editoru."],
              ["Podstránky", "Demo weby mají homepage i oborové podstránky."],
              ["Náhled", "Veřejný náhled a admin jsou dostupné hned po vytvoření."],
            ].map(([title, text]) => (
              <div key={title} className="rounded border border-slate-200 p-6">
                <h3 className="text-lg font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ceny" className="bg-[#0f241d] px-4 py-24 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#d6c2a4]">Cena</p>
            <h2 className="mt-3 text-4xl font-black tracking-normal">Jednoduchý tarif pro ostrý web.</h2>
            <p className="mt-5 text-base leading-8 text-white/75">
              Cíl je jasný: rychle založit demo, doladit obsah a převést ho na ostrý web bez zbytečných koleček.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded border border-white/15 bg-white p-7 text-slate-950">
              <p className="text-sm font-bold text-slate-500">Základní web</p>
              <p className="mt-3 text-4xl font-black">500 Kč</p>
              <p className="mt-1 text-sm text-slate-500">měsíčně, doména zvlášť</p>
              <ul className="mt-6 space-y-3 text-sm font-semibold text-slate-700">
                <li>Live editor</li>
                <li>Šablony a podstránky</li>
                <li>SEO základ</li>
                <li>Mobilní verze</li>
              </ul>
              <button onClick={() => setShowModal(true)} className="mt-7 w-full rounded bg-[#9a7a4f] px-4 py-3 text-sm font-black text-white">
                Vyzkoušet zdarma
              </button>
            </div>
            <div className="rounded border border-[#d6c2a4]/40 bg-[#173a2f] p-7">
              <p className="text-sm font-bold text-[#e7d8c0]">Web s rezervacemi</p>
              <p className="mt-3 text-4xl font-black">500 Kč + Rezora</p>
              <p className="mt-1 text-sm text-white/60">rezervační systém zvlášť</p>
              <ul className="mt-6 space-y-3 text-sm font-semibold text-white/82">
                <li>Vše ze základního webu</li>
                <li>Rezervační CTA</li>
                <li>Kontakt a poptávky</li>
                <li>Pro služby a salony</li>
              </ul>
              <button onClick={() => setShowModal(true)} className="mt-7 w-full rounded bg-white px-4 py-3 text-sm font-black text-[#14532d]">
                Založit demo
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#111827] px-4 py-20 text-center text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-black tracking-normal">Začněte šablonou. Pokračujte vlastním webem.</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/85">
            Založte demo, otevřete editor a ověřte si celý proces bez čekání na vývojáře.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-8 rounded bg-white px-9 py-4 text-base font-black text-[#6f583a] transition hover:bg-[#f6f1e9]"
          >
            Vyzkoušet zdarma
          </button>
        </div>
      </section>

      {showModal && <OnboardingModal onClose={() => setShowModal(false)} />}
    </>
  );
}
