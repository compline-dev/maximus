import { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView.js";

const DISPLAY = "'Bodoni Moda', 'Times New Roman', serif";
const UI = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

const pad = (n) => String(n + 1).padStart(2, "0");

function PanelMedia({ panel, isActive }) {
  const videoRef = useRef(null);
  const inView = useInView(videoRef, "0px");
  const shouldPlay = isActive || inView;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) video.play().catch(() => {});
    else video.pause();
  }, [shouldPlay]);

  const mediaStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    backgroundColor: "#F5F3EE",
    transition: `transform 1.3s ${EASE}`,
    transform: `scale(${isActive ? 1.12 : 1.06})`,
  };

  if (panel.video) {
    return (
      <video
        ref={videoRef}
        src={panel.video}
        muted
        loop
        playsInline
        preload="metadata"
        style={mediaStyle}
      />
    );
  }

  return (
    <div
      style={{
        ...mediaStyle,
        backgroundImage: panel.image
          ? `url(${panel.image})`
          : "repeating-linear-gradient(135deg, rgba(26,22,15,0.05) 0 12px, transparent 12px 24px)",
        backgroundSize: panel.image ? "cover" : undefined,
        backgroundPosition: "center",
      }}
    />
  );
}

export default function ImageAccordion({ data }) {
  const panels = data.panels || [];
  const [active, setActive] = useState(3);

  return (
    <section
      className="ia"
      data-screen-label="ImageAccordion"
      style={{
        background: "#FFFFFF",
        color: "#1A1A1A",
        padding: "32px 56px 128px",
        fontFamily: UI,
        overflow: "hidden",
      }}
    >
      <header
        className="ia-head"
        style={{ padding: 0, maxWidth: 1040, margin: "0 auto 56px" }}
      >
        <p
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.42em",
            color: "rgba(26,26,26,0.4)",
            margin: 0,
          }}
        >
          {data.kicker}
        </p>
        <h2
          style={{
            fontFamily: DISPLAY,
            fontWeight: 400,
            fontSize: "clamp(2.25rem,5.5vw,4.5rem)",
            lineHeight: 1,
            letterSpacing: "0.04em",
            marginTop: 22,
            maxWidth: 860,
            textTransform: "uppercase",
          }}
        >
          {data.title}{" "}
          <span
            style={{
              fontStyle: "italic",
              color: "#1F3A2C",
              textTransform: "none",
              letterSpacing: "0.01em",
            }}
          >
            {data.titleAccent}
          </span>
        </h2>
      </header>

      <div
        className="ia-row"
        style={{
          position: "relative",
          display: "flex",
          gap: 0,
          height: "clamp(440px,62vh,620px)",
          padding: 0,
          maxWidth: 1040,
          margin: "0 auto",
        }}
      >
        {panels.map((p, i) => {
          const isActive = i === active;
          return (
            <figure
              key={p.image || p.video || i}
              className="ia-fig"
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              style={{
                position: "relative",
                zIndex: 1,
                flex: `${isActive ? 3.6 : 1} 1 0%`,
                minWidth: 0,
                height: "100%",
                margin: 0,
                overflow: "hidden",
                background: "#F5F3EE",
                cursor: "pointer",
                transition: `flex-grow 0.85s ${EASE}`,
              }}
            >
              <PanelMedia panel={p} isActive={isActive} />

              <div
                aria-hidden="true"
                className="ia-veil"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.1) 40%, transparent 66%)",
                  transition: "opacity 0.85s",
                  opacity: isActive ? 1 : 0,
                }}
              />

              <figcaption
                className="ia-cap"
                style={{
                  position: "absolute",
                  left: 36,
                  right: 36,
                  bottom: 36,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  transition: "opacity 0.7s",
                  opacity: isActive ? 1 : 0,
                  pointerEvents: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.42em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    {pad(i)}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.42em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.78)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.label}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 400,
                    fontSize: "clamp(1.6rem,3vw,2.5rem)",
                    lineHeight: 1.02,
                    color: "rgba(255,255,255,0.97)",
                    margin: 0,
                  }}
                >
                  {p.title}
                </h3>
                {p.desc && (
                  <p
                    style={{
                      maxWidth: 360,
                      fontSize: 13,
                      lineHeight: 1.6,
                      fontWeight: 300,
                      color: "rgba(255,255,255,0.72)",
                      margin: 0,
                    }}
                  >
                    {p.desc}
                  </p>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
