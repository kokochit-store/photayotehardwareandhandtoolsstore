import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedSection from "@/components/FeaturedSection";
import TrustSection from "@/components/TrustSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import LiveVisitors from "@/components/LiveVisitors";

const Index = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <div className="container mx-auto px-4 py-6 flex justify-center">
        <LiveVisitors />
      </div>
      <CategoriesSection />
      <FeaturedSection eyebrow="Best Sellers" title="Top Selling Tools" />
      <TrustSection />
      <FeaturedSection eyebrow="New Arrivals" title="Fresh in Stock" category="Power Tools" limit={4} />
      <ReviewsSection />
      <Footer />
    </main>
  );
};

export default Index;
