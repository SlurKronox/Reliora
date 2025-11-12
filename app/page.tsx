import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HeroSection } from '@/components/landing/hero-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { TargetAudienceSection } from '@/components/landing/target-audience-section'
import { BenefitsSection } from '@/components/landing/benefits-section'
import { AISection } from '@/components/landing/ai-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { FAQSection } from '@/components/landing/faq-section'
import { CTASection } from '@/components/landing/cta-section'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <TargetAudienceSection />
        <BenefitsSection />
        <AISection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  )
}
