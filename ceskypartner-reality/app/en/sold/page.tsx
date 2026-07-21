import type { Metadata } from "next";
import SoldPageContent from "@/components/SoldPageContent";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Properties successfully sold and let",
  description:
    "Explore properties successfully sold and let by Český Partner, and see the considered service behind every completed transaction.",
  alternates: {
    canonical: "/en/sold",
    languages: { "en-GB": "/en/sold", "cs-CZ": "/prodano", "x-default": "/prodano" },
  },
  openGraph: {
    title: "Properties successfully sold and let | Český Partner",
    description: "A selection of successful property transactions completed for our clients.",
    locale: "en_GB",
    alternateLocale: ["cs_CZ"],
  },
};

export default function EnglishSoldPage() {
  return <SoldPageContent locale="en" />;
}
