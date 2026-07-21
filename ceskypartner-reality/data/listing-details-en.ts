const DESCRIPTIONS: Record<string, string> = {
  p1: "A substantial family villa in a quiet Nebušice setting, combining generous entertaining space with a private garden, swimming pool and light-filled winter garden. The layout balances formal reception rooms with relaxed everyday living and offers excellent privacy within easy reach of Prague’s international schools.",
  p2: "An elegant Malá Strana apartment with a broad terrace and memorable views towards Prague Castle. Generous proportions, exceptional natural light and one of the capital’s most historic addresses make this a rare central Prague home.",
  p3: "A well-proportioned family house beside mature woodland in Jinočany, with a private garden and practical access to Prague. The calm setting and flexible interior are particularly well suited to modern family life.",
  p4: "A characterful attic loft set within an Art Nouveau building in Vinohrady. Carefully composed open-plan spaces, original architectural context and a highly walkable neighbourhood create a distinctive Prague residence.",
  p5: "A renovated interwar villa in Brno’s prestigious Masaryk Quarter, retaining the confidence and proportions of its period while offering the comfort expected of a contemporary family home.",
  p6: "A considered designer apartment in Holešovice with a private loggia, secure garage parking and a refined contemporary interior. An easy city base close to galleries, restaurants and the river.",
  p7: "A contemporary new-build in Košíře positioned to capture long valley views. Clean architecture, generous glazing and carefully planned living spaces connect the interior with its setting.",
  p8: "A private mountain residence in Špindlerův Mlýn with dedicated wellness facilities and immediate access to year-round outdoor life. Designed as an effortless retreat for family and guests.",
  p9: "A spacious Žižkov duplex combining a dedicated studio with a private roof terrace. The flexible plan works equally well for creative work, entertaining and family life.",
  p10: "A distinctive Mikulov villa with its own wine cellar, mature planting and a relaxed connection to the South Moravian landscape. A home with genuine atmosphere and generous accommodation.",
  n1: "A furnished riverside apartment in Prague’s New Town with open views across the Vltava. The interior is ready for immediate occupation and offers a polished, central base for an international tenant.",
  n2: "A modern Karlín residence with reception service and access to a residents’ fitness suite. Secure, convenient and exceptionally well connected for city living.",
  n3: "A substantial Hanspaulka villa with a private garden and double garage, available as a refined long-term family rental in one of Prague 6’s most established residential neighbourhoods.",
  n4: "A bright, newly renovated Vinohrady apartment with calm finishes and excellent natural light, moments from neighbourhood cafés, parks and public transport.",
  n5: "Flexible loft offices in a converted Holešovice industrial building, retaining the scale and character of the original architecture while supporting a contemporary working environment.",
  n6: "A modern Brno duplex with a private terrace and parking, offering generous living space within easy reach of the city centre.",
  n7: "A well-designed new-build apartment in Vysočany with a private balcony, efficient specification and excellent transport connections.",
  n8: "An executive office in Pankrác with far-reaching city views and a professional setting suited to an established business.",
  i1: "A fully income-producing Vinohrady apartment building comprising twelve units in a proven Prague rental location. Documentation and tenancy information are available to qualified investors.",
  i2: "A well-located office building in Michle supported by long-term occupational leases, offering established cash flow and a clear operating profile.",
  i3: "A comprehensively refurbished apartment building in Brno’s Veveří district with a diversified residential income stream and limited immediate capital expenditure.",
  i4: "A mixed-use building in central Plzeň combining residential or office accommodation with active ground-floor retail. A balanced urban asset with multiple income sources.",
  i5: "A substantial Strašnice development site with valid planning permission, reducing entitlement risk and offering a defined route towards delivery.",
  i6: "A portfolio of rental apartments in Ostrava-Poruba offering diversified income, operational scale and an attractive entry yield.",
};

export function englishListingDescription(id: string): string {
  return DESCRIPTIONS[id] ?? "A carefully selected Czech property represented exclusively by Český Partner. Full documentation and further information are available from our English-speaking team.";
}

