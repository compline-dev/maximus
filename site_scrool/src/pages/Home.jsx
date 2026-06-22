import { useEffect, useState } from "react";
import Hero from "../components/Hero.jsx";
// import DualVideo from "../components/DualVideo.jsx";
import Editorial from "../components/Editorial.jsx";
import ImageAccordion from "../components/ImageAccordion.jsx";
import PinnedGallery from "../components/PinnedGallery.jsx";
// import VideoBanner from "../components/VideoBanner.jsx";
import ApplyForm from "../components/ApplyForm.jsx";
import CaptionedVideo from "../components/CaptionedVideo.jsx";
import { LeadModalProvider } from "../components/LeadModal.jsx";
import Footer from "../components/Footer.jsx";

const PASSAGE_VIDEO = "/video_passages_around_gk/hf_20260611_073952_01795758-4cc6-4826-833c-884d6b0511dc (1).mp4";
const PASSAGE_VIDEO_2 = "/video_passages_around_gk/____________________________________ac609gq06ygvab6l0d49_1.mp4";
import Preloader from "../components/Preloader.jsx";
import {
  // BANNER_VIDEO,
  // DUAL_VIDEO_RIGHT,
  useHeroVideoPreload,
} from "../hooks/useVideoPreload.js";

export default function Home() {
  const { ready: heroReady, progress } = useHeroVideoPreload();
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (heroReady) setBooted(true);
  }, [heroReady]);

  return (
    <>
      <Preloader progress={progress} visible={!heroReady} detail="Hero" />
      {booted && (
        <LeadModalProvider>
          <Hero />
          {/* <DualVideo
            sources={DUAL_VIDEO_RIGHT}
            labels={["Природное окружение", "Городской комфорт"]}
            caption="В гармонии с вашим ритмом жизни"
            items={[
              "Отличная экология",
              "15 минут до центра Уфы",
              "Прямой выезд на улицу Менделеева",
              "Рядом: школы, парки, спорткомплексы",
            ]}
          /> */}
          <Editorial />
          <CaptionedVideo
            src={PASSAGE_VIDEO}
            ratio="1920 / 1080"
            eyebrow="Природное окружение · Городской комфорт"
            title="В гармонии с вашим ритмом жизни"
            items={[
              "Отличная экология",
              "15 минут до центра Уфы",
              "Прямой выезд на улицу Менделеева",
              "Рядом: школы, парки, спорткомплексы",
            ]}
          />
          <ImageAccordion />
          <PinnedGallery />
          {/* <VideoBanner
            videoSources={BANNER_VIDEO}
            eyebrow="Видеотур"
            title="Жизнь в МАКСИМУС"
          /> */}
          <ApplyForm />
          <CaptionedVideo
            src={PASSAGE_VIDEO_2}
            ratio="1280 / 672"
            mediaScale={1.18}
            eyebrow="Архитектура вне времени"
            title="Неоклассика в современном прочтении"
            items={[
              "Арки как ключевой архитектурный элемент",
              "Выразительный силуэт здания",
              "Благородные материалы и пропорции",
            ]}
            cta="Оставить заявку"
          />
          <Footer />
        </LeadModalProvider>
      )}
    </>
  );
}

