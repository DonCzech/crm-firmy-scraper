import { Seo } from '@/components/Seo';
import { HeroSection } from '@/components/HeroSection';
import { MediaBar } from '@/components/MediaBar';
import { AboutSection } from '@/components/AboutSection';
import { InvestmentSection } from '@/components/InvestmentSection';
import { FinancingSection } from '@/components/FinancingSection';
import { StatsSection } from '@/components/StatsSection';
import { Testimonials } from '@/components/Testimonials';
import { MobileAppSection } from '@/components/MobileAppSection';

export function HomePage() {
  return (
    <>
      <Seo
        title="Český Partner – Investujte do českých firem | Crowdfunding platforma"
        description="Česká crowdfundingová platforma propojující investory s podnikateli. Průměrný roční výnos 9,8 %, měsíční výplata, od 500 Kč. Licencováno ČNB."
        canonical="/"
      />
      <HeroSection />
      <MediaBar />
      <AboutSection />
      <InvestmentSection />
      <FinancingSection />
      <StatsSection />
      <Testimonials />
      <MobileAppSection />
    </>
  );
}
