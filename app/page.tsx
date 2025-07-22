import {
  HeroSection,
  FeaturesSection,
  ProofOfReserveSection,
  ProofOfReserveCards,
  InvestmentGradeSecuritySection,
  TransparentReservesSection,
  CallToActionSection,
  AnimatedFooterSection,
} from "@/components/features/root"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden flex flex-col items-center justify-center">
      {/* Hero Section */}
      <HeroSection />

      {/* Proof of Reserve Section */}
      <section className="relative py-24 bg-gradient-to-b from-neutral-800 to-emerald-800 overflow-hidden">
        <ProofOfReserveSection />

        <ProofOfReserveCards />

        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-emerald-200/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InvestmentGradeSecuritySection />
              <TransparentReservesSection />
            </div>
          </div>
        </div>

        <CallToActionSection />
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Animated Footer */}
      <AnimatedFooterSection />
    </div>
  )
}
