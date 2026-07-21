import { ARTICLES } from "./articles";

export type EnglishArticle = {
  id: string;
  slug: string;
  category: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  content: string[];
};

export const ARTICLES_EN: EnglishArticle[] = [
  {
    id: "a1",
    slug: "prague-property-market-in-numbers",
    category: "Market",
    title: "Prague property in numbers: apartment prices rise seven per cent this year",
    date: "2 July 2026",
    excerpt: "Supply remains constrained while buyer confidence returns. We examine what the latest figures mean in practice.",
    image: ARTICLES[0].image,
    content: [
      "Prague’s residential market has entered a more confident phase. Completed transaction data and current asking prices both point to year-on-year growth, although the pace varies significantly by district and property condition.",
      "The strongest demand remains concentrated on well-presented apartments in established neighbourhoods with reliable transport, good local amenities and limited new supply. Correct pricing still matters: buyers are informed, and compromised properties can remain on the market despite the broader rise.",
      "For sellers, this is a constructive market rather than an indiscriminate one. A clear launch strategy, complete documentation and strong presentation continue to determine whether a property attracts competitive interest.",
    ],
  },
  {
    id: "a2",
    slug: "mortgage-rates-below-four-percent",
    category: "Finance",
    title: "Mortgage rates edge below four per cent: what it means for buyers",
    date: "28 June 2026",
    excerpt: "Improving finance conditions are widening affordability, but the right preparation remains essential.",
    image: ARTICLES[1].image,
    content: [
      "Lower headline mortgage rates are beginning to translate into improved monthly affordability and renewed activity among buyers who postponed decisions during the previous rate cycle.",
      "A lower rate does not remove the need for careful budgeting. Buyers should assess the total cost of ownership, likely refinancing scenarios and the condition of the property rather than focusing only on the initial monthly payment.",
      "A finance decision made before viewings begin creates a stronger negotiating position and allows buyers to move decisively when the right property appears.",
    ],
  },
  {
    id: "a3",
    slug: "where-prague-buyers-are-looking",
    category: "Neighbourhoods",
    title: "Vinohrady, Karlín or Holešovice: where buyer demand is moving",
    date: "21 June 2026",
    excerpt: "Three established Prague districts, three very different buyer profiles and investment cases.",
    image: ARTICLES[2].image,
    content: [
      "Vinohrady continues to appeal to buyers who value architectural character, mature streets and an established international community. Renovated period apartments command a premium, particularly where original detail has been retained.",
      "Karlín offers a more contemporary urban proposition, combining modern offices, strong restaurants and rapid access to the centre. Holešovice is broader and more varied, with cultural destinations, development sites and pockets of strong long-term potential.",
      "The right choice depends less on which district is fashionable and more on the buyer’s horizon, daily routine and tolerance for future change.",
    ],
  },
  {
    id: "a4",
    slug: "home-staging-guide",
    category: "Selling",
    title: "The art of home staging: preparing a property to achieve its best price",
    date: "14 June 2026",
    excerpt: "Presentation should clarify a property’s character, not disguise it. Here is what makes the greatest difference.",
    image: ARTICLES[3].image,
    content: [
      "Effective staging begins with editing. Removing visual noise, improving light and establishing a clear purpose for every room allows buyers to understand the space immediately.",
      "The strongest presentation is specific to the property. A city apartment, family villa and investment unit require different styling, photography and marketing narratives.",
      "Small cosmetic improvements can be worthwhile, but major work should be judged against likely return. The goal is not perfection; it is confidence, coherence and an honest sense of possibility.",
    ],
  },
  {
    id: "a5",
    slug: "rents-rise-investors-return-to-income-property",
    category: "Insight",
    title: "As rents rise, investors return to apartment buildings",
    date: "7 June 2026",
    excerpt: "Income property is back in focus as investors seek resilient cash flow and operational upside.",
    image: ARTICLES[4].image,
    content: [
      "Rental growth and limited housing supply have renewed interest in apartment buildings, particularly assets with a transparent tenancy profile and scope for measured improvement.",
      "Headline yield is only the starting point. Lease quality, deferred maintenance, energy performance, vacancy assumptions and local rental depth all shape the real investment case.",
      "The most attractive opportunities are often not those with the highest advertised return, but those where risk is legible and value can be created through disciplined management.",
    ],
  },
];

