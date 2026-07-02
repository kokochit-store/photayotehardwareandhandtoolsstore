import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import LiveVisitors from "@/components/LiveVisitors";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="container mx-auto px-4 py-6 flex justify-center">
        <LiveVisitors />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
