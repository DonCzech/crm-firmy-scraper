#!/usr/bin/env python3
"""hair-02 V3 obsah — nové (vizuálně ověřené) fotky, multipage linky, demo data.
Idempotentní: přepisuje src/templates/hair-02/content/cs.json celý.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
CS = ROOT / "src/templates/hair-02/content/cs.json"

U = "https://images.unsplash.com/photo-"


def img(pid, w, h, crop=None):
    base = "%s%s?w=%d&h=%d&fit=crop&auto=format&q=80" % (U, pid, w, h)
    return base + ("&crop=" + crop if crop else "")


# Vizuálně ověřeno přes montage grid (REMASTER_PLAYBOOK §2.3) — 2026-07-21
P_WOMAN_CLAY = "1546877625-cb8c71916608"   # usměvavá žena, terakotové sako
P_PINK_BACK = "1522337360788-8b13dee7a37e"  # dlouhé vlasy zezadu, růžové pozadí
P_SALON_PINK = "1521590832167-7bcbfaa6381f"  # interiér s růžovými křesly
P_STYLIST = "1562322140-8baeececf3df"       # kadeřnice fénuje klientku
P_LAVENDER = "1492106087820-71f1a00d2b11"   # levandulové vlnité vlasy
P_BLOWDRY = "1580618672591-eb180b1a973f"    # foukaná zezadu
P_BARBER = "1605497788044-5a32c7078486"     # pánský střih
P_PINKHAIR = "1470259078422-826894b933aa"   # růžové vlasy ve větru
P_WASH = "1595476108010-b4d1f102b1b1"       # mytí vlasů u mycího boxu
P_UPDO = "1523263685509-57c1d050d19b"       # společenský účes / líčení
P_AFRO = "1519699047748-de8e457a634e"       # portrét, přírodní kudrny
P_SALON_BRIGHT = "1633681926022-84c23e8cb2d6"  # světlý interiér salonu

data = {
    "navbar": {
        "siteName": "Salon Blush",
        "logoUrl": "",
        "phone": "+420 704 123 456",
        "ctaText": "Objednat se",
        "ctaHref": "/kontakt",
        "links": [
            {"label": "O salonu", "href": "/o-nas"},
            {"label": "Služby", "href": "/#sluzby"},
            {"label": "Galerie", "href": "/galerie"},
            {"label": "Recenze", "href": "/recenze"},
            {"label": "Kontakt", "href": "/kontakt"},
        ],
        "socials": [
            {"label": "Instagram", "href": "https://instagram.com/demo"},
            {"label": "Facebook", "href": "https://facebook.com/demo"},
        ],
    },
    "hero": {
        "eyebrow": "Kadeřnické studio · Praha 1",
        "title": "Vlasy, které",
        "titleAccent": "vám sluší",
        "subtitle": "Střih na míru vašemu typu vlasů, barvení s citem pro odrost a péče, která vydrží do další návštěvy. Objednejte se on-line za dvě minuty.",
        "ctaText": "On-line rezervace",
        "ctaHref": "#rezervace",
        "ctaSecondaryText": "Prohlédnout služby",
        "ctaSecondaryHref": "#sluzby",
        "slides": [
            {"image": img(P_WOMAN_CLAY, 1920, 1200), "alt": "Klientka salonu s vlnitým účesem"},
            {"image": img(P_PINK_BACK, 1920, 1200), "alt": "Dlouhé vlasy po foukané"},
            {"image": img(P_SALON_PINK, 1920, 1200), "alt": "Interiér Salonu Blush"},
        ],
    },
    "about": {
        "tagline": "O salonu",
        "title": "Malý salon, velká péče",
        "body": "Jsme čtyřčlenný tým kadeřnic v centru Prahy. Pracujeme bez spěchu — na jednu klientku máme vždycky dost času.",
        "paragraphs": [
            "Salon Blush jsme otevřely v roce 2014 s jednoduchým záměrem: dělat vlasy tak, aby vypadaly dobře i třetí týden po návštěvě. Proto každou návštěvu začínáme konzultací a diagnostikou vlasů — teprve pak se domlouváme na střihu nebo barvě.",
            "Barvíme převážně technikami s měkkým přechodem (balayage, airtouch), které nevytvářejí ostrou linii odrostu. Díky tomu k nám můžete chodit po třech měsících místo po šesti týdnech.",
            "Používáme profesionální vlasovou kosmetiku bez sulfátů a každý úkon vám doporučíme jen tehdy, když ho vaše vlasy opravdu potřebují.",
        ],
        "ctaText": "Objednat se",
        "ctaHref": "/kontakt",
        "image": img(P_STYLIST, 1200, 1500),
        "brands": [
            {"name": "DEMO CARE", "logo": ""},
            {"name": "BLUSH LAB", "logo": ""},
            {"name": "ATELIER N°1", "logo": ""},
            {"name": "PURE DEMO", "logo": ""},
        ],
        "stats": [
            {"value": "11", "label": "let v centru Prahy"},
            {"value": "4", "label": "kadeřnice v týmu"},
            {"value": "4,9", "label": "hodnocení na Google"},
        ],
    },
    "promo": {
        "tag": "Péče o barvu",
        "title": "Barva, která nevybledne za tři mytí",
        "body": "K barvení dostanete domácí péči vybranou přímo pro váš odstín — a přeplach zdarma do čtyř týdnů, pokud barva ztratí lesk.",
        "ctaText": "Chci konzultaci",
        "ctaHref": "/kontakt",
        "image": img(P_LAVENDER, 1100, 1100),
    },
    "contact-location": {
        "tag": "Kde nás najdete",
        "title": "Ukázková 123, Praha 1",
        "body": "Salon je dvě minuty od stanice metra, ve dvoře s vlastním vchodem. Přijďte o pět minut dřív — uvaříme vám kávu.",
        "ctaText": "On-line rezervace",
        "ctaHref": "#rezervace",
        "phone": "+420 704 123 456",
        "email": "email@demo.cz",
        "address": "Ukázková 123\n110 00 Praha 1",
        "image": img(P_SALON_BRIGHT, 1200, 1400),
        "hours": [
            {"day": "Pondělí – Pátek", "value": "9:00 – 20:00"},
            {"day": "Sobota", "value": "10:00 – 15:00"},
            {"day": "Neděle", "value": "Zavřeno"},
        ],
    },
    "gallery": {
        "tagline": "Galerie",
        "title": "Naše práce",
        "subtitle": "Výběr střihů a barev z posledních měsíců. Všechny fotky jsou z našeho salonu.",
        "images": [
            {"url": img(P_WOMAN_CLAY, 900, 1100), "alt": "Vlnitý střih s měkkým balayage"},
            {"url": img(P_PINK_BACK, 900, 1100), "alt": "Dlouhé vlasy po foukané"},
            {"url": img(P_LAVENDER, 900, 1100), "alt": "Levandulová barva na dlouhé vlasy"},
            {"url": img(P_PINKHAIR, 900, 1100), "alt": "Sytá růžová barva"},
            {"url": img(P_BLOWDRY, 900, 1100), "alt": "Foukaná do vln"},
            {"url": img(P_WASH, 900, 1100), "alt": "Mycí box a péče o vlasy"},
            {"url": img(P_AFRO, 900, 1100), "alt": "Střih pro přírodní kudrny"},
            {"url": img(P_UPDO, 900, 1100), "alt": "Společenský účes"},
        ],
    },
    "services": {
        "tagline": "Ceník",
        "title": "Naše služby",
        "subtitle": "Ceny jsou orientační — konečnou cenu vždy potvrdíme při konzultaci podle délky a hustoty vlasů.",
        "services": [
            {"name": "Dámský střih", "description": "Konzultace, mytí, střih a finální styling. Včetně rady, jak účes zvládnete doma.",
             "price": "od 890 Kč", "duration": "60 min", "image": img(P_BLOWDRY, 900, 600)},
            {"name": "Pánský střih", "description": "Precizní střih strojkem i nůžkami, úprava vousů a styling.",
             "price": "od 490 Kč", "duration": "40 min", "image": img(P_BARBER, 900, 600)},
            {"name": "Barvení", "description": "Jednotný odstín nebo krytí šedin s přípravou vlasového vlákna.",
             "price": "od 1 490 Kč", "duration": "120 min", "image": img(P_LAVENDER, 900, 600)},
            {"name": "Melír & balayage", "description": "Měkký přechod bez ostrého odrostu — vydrží tři měsíce i déle.",
             "price": "od 2 290 Kč", "duration": "180 min", "image": img(P_PINKHAIR, 900, 600)},
            {"name": "Keratinové ošetření", "description": "Regenerace poškozených vlasů, uhlazení krepatění na několik týdnů.",
             "price": "od 1 890 Kč", "duration": "90 min", "image": img(P_WASH, 900, 600, "faces")},
            {"name": "Svatební & společenský účes", "description": "Zkouška předem, v den akce účes i s fixací na celý den.",
             "price": "od 1 290 Kč", "duration": "75 min", "image": img(P_UPDO, 900, 600)},
        ],
    },
    "testimonials": {
        "tagline": "Recenze",
        "title": "Co říkají klientky",
        "rating": "4.9",
        "ratingLabel": "průměr ze 128 hodnocení na Google",
        "testimonials": [
            {"author": "Petra M.", "role": "klientka od 2019", "rating": "5",
             "text": "Poprvé po letech mám barvu, která mi nevybledne do měsíce do zrzava. A hlavně — odrost není vidět, takže nemusím běhat do salonu každých šest týdnů."},
            {"author": "Jana K.", "role": "klientka od 2021", "rating": "5",
             "text": "Přišla jsem s tím, že chci „něco změnit“, a odešla jsem se střihem, který si konečně umím udělat i sama doma. Vysvětlily mi to krok za krokem."},
            {"author": "Monika T.", "role": "klientka od 2017", "rating": "5",
             "text": "Chodím sem sedmý rok. Nikdy mě netlačily do drahého ošetření — když vlasy nic nepotřebují, řeknou to na rovinu."},
        ],
    },
    "footer": {
        "siteName": "Salon Blush",
        "heading": "Těšíme se na vás",
        "tagline": "Kadeřnické studio v centru Prahy. Střih, barva a péče bez spěchu.",
        "phone": "+420 704 123 456",
        "email": "email@demo.cz",
        "address": "Ukázková 123\n110 00 Praha 1",
        "hoursLabel": "Otevírací doba",
        "hours": [
            {"day": "Pondělí – Pátek", "value": "9:00 – 20:00"},
            {"day": "Sobota", "value": "10:00 – 15:00"},
            {"day": "Neděle", "value": "Zavřeno"},
        ],
        "links": [
            {"label": "O salonu", "href": "/o-nas"},
            {"label": "Služby", "href": "/#sluzby"},
            {"label": "Galerie", "href": "/galerie"},
            {"label": "Recenze", "href": "/recenze"},
            {"label": "Kontakt", "href": "/kontakt"},
        ],
        "socials": [
            {"label": "Instagram", "href": "https://instagram.com/demo"},
            {"label": "Facebook", "href": "https://facebook.com/demo"},
        ],
        "ctaText": "On-line rezervace",
        "ctaHref": "/kontakt",
        "legal": "Demo Studio s.r.o. | IČO: 12345678 | DIČ: CZ12345678",
    },
    "pages": {
        "o-nas": {"hero": {"title": "O salonu", "subtitle": "Čtyři kadeřnice, jedenáct let praxe a jeden salon ve dvoře v centru Prahy.", "backgroundImage": img(P_SALON_PINK, 1800, 700)}},
        "galerie": {"hero": {"title": "Galerie", "subtitle": "Střihy, barvy a účesy z našeho salonu — bez retuší a stock fotek.", "backgroundImage": img(P_PINKHAIR, 1800, 700)}},
        "kontakt": {"hero": {"title": "Kontakt", "subtitle": "Ozvěte se nám, nebo se rovnou objednejte on-line.", "backgroundImage": img(P_SALON_BRIGHT, 1800, 700)}},
        "recenze": {"hero": {"title": "Recenze", "subtitle": "128 hodnocení na Google s průměrem 4,9.", "backgroundImage": img(P_WOMAN_CLAY, 1800, 700)}},
    },
    "home": {
        "rezervace": {
            "title": "Objednejte se on-line",
            "subtitle": "Vyberte službu, kadeřnici a čas. Potvrzení vám přijde e-mailem.",
            "providerSlug": "",
            "apiBaseUrl": "",
        }
    },
}

CS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
print("zapsáno:", CS.relative_to(ROOT))
