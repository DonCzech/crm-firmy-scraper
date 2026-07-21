import { ArrowUpRight, SearchX } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function EnglishNotFound() {
  return (
    <>
      <Header variant="solid" locale="en" />
      <main className="flex min-h-[70vh] items-center pt-16">
        <div className="mx-auto w-full max-w-site px-6 py-24 xl:px-10">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <SearchX size={40} strokeWidth={1.1} className="text-bronze" />
            <p className="eyebrow mt-8 text-muted">Error 404</p>
            <h1 className="mt-4 text-[clamp(1.8rem,3.4vw,2.8rem)] font-semibold leading-[1.1] tracking-[-0.02em]">This page could not be found</h1>
            <p className="mt-5 text-[15px] leading-[1.75] text-muted">The property may have been sold or the link may no longer be valid. Our current collection is only a step away.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <a href="/en/properties/for-sale" className="flex items-center gap-2 bg-ink px-8 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-paper">
                Property for sale <ArrowUpRight size={14} />
              </a>
              <a href="/en" className="border border-ink px-8 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.16em]">Back to home</a>
            </div>
          </div>
        </div>
      </main>
      <Footer locale="en" />
    </>
  );
}

