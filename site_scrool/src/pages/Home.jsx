import { useState } from "react";
import Hero from "../components/Hero.jsx";
import Preloader from "../components/Preloader.jsx";
import Editorial from "../components/Editorial.jsx";
import ImageAccordion from "../components/ImageAccordion.jsx";
import PinnedGallery from "../components/PinnedGallery.jsx";
import ApplyForm from "../components/ApplyForm.jsx";
import CaptionedVideo from "../components/CaptionedVideo.jsx";
import { LeadModalProvider } from "../components/LeadModal.jsx";
import Footer from "../components/Footer.jsx";
import { useHomeContent } from "../hooks/useHomeContent.js";

export default function Home() {
  const content = useHomeContent();
  const [heroReady, setHeroReady] = useState(false);

  if (!content) {
    return (
      <div
        className="fixed inset-0"
        style={{ backgroundColor: "var(--accent)" }}
      />
    );
  }

  const v1 = content.videoBlocks?.find((v) => v.slug === "passages");
  const v2 = content.videoBlocks?.find((v) => v.slug === "architecture");

  return (
    <LeadModalProvider>
      <Preloader visible={!heroReady} />
      <Hero data={content.hero} onReady={() => setHeroReady(true)} />
      <Editorial data={content.editorial} />
      {v1 && (
        <CaptionedVideo
          src={v1.video}
          eyebrow={v1.eyebrow}
          title={v1.title}
          items={v1.items}
          ratio="1920 / 1080"
        />
      )}
      <ImageAccordion data={content.accordion} />
      <PinnedGallery data={content.gallery} />
      <ApplyForm data={content.apply} />
      {v2 && (
        <CaptionedVideo
          src={v2.video}
          eyebrow={v2.eyebrow}
          title={v2.title}
          items={v2.items}
          cta={v2.ctaText}
          ratio="1280 / 672"
          mediaScale={1.18}
        />
      )}
      <Footer data={content.footer} />
    </LeadModalProvider>
  );
}
