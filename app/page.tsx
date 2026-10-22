import HomeHero from "@/components/home/HomeHero";
import AboutXpeng from "@/components/home/AboutXpeng";
import VehicleShowcase from "@/components/home/VehicleShowcase";
import WhyXpeng from "@/components/home/WhyXpeng";
import ShowroomMap from "@/components/home/ShowroomMap";
import OrderCta from "@/components/home/OrderCta";

export default function Home() {
  return (
    <>
      <HomeHero />
      <AboutXpeng />
      <VehicleShowcase />

      <WhyXpeng />

      <OrderCta />
      <ShowroomMap />
    </>
  );
}
