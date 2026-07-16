import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const colors = {
  blue: "#0b3350",
  deep: "#10232f",
  cream: "#efd4b0",
  sand: "#f4e4cf",
  white: "#fffaf2",
};

const playbackSpeed = 2;
const siteUrl = "rutadeltelar.catamarca.gob.ar";
const handCursorPressPoint = { x: 32, y: 6 };

function ramp(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function ease(value: number) {
  return value * value * (3 - 2 * value);
}

function downUpScroll(
  frame: number,
  fps: number,
  downStart: number,
  downEnd: number,
  upStart: number,
  upEnd: number,
  target: number,
) {
  const down = ease(ramp(frame, fps * downStart, fps * downEnd));
  const up = ease(ramp(frame, fps * upStart, fps * upEnd));
  return interpolate(down * (1 - up), [0, 1], [0, target]);
}

function BrowserChrome() {
  return (
    <div
      style={{
        height: 60,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 24px",
        background: "#ead2b5",
        borderBottom: "1px solid rgba(16,35,47,0.18)",
      }}
    >
      {["#c95f4a", "#d9a448", "#4b8f67"].map((color) => (
        <span key={color} style={{ width: 15, height: 15, borderRadius: 999, background: color }} />
      ))}
      <div
        style={{
          marginLeft: 16,
          borderRadius: 999,
          background: "rgba(255,255,255,0.78)",
          color: colors.deep,
          fontSize: 19,
          fontWeight: 900,
          padding: "9px 22px",
        }}
      >
        {siteUrl}
      </div>
    </div>
  );
}

function BrowserHandCursor({
  x,
  y,
  opacity,
  click,
}: {
  x: number;
  y: number;
  opacity: number;
  click: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - handCursorPressPoint.x,
        top: y - handCursorPressPoint.y,
        width: 76,
        height: 88,
        opacity,
        transform: `rotate(-10deg) scale(${1 - click * 0.07})`,
        transformOrigin: `${handCursorPressPoint.x}px ${handCursorPressPoint.y}px`,
        filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.34))",
        zIndex: 4,
      }}
    >
      <Img
        src={staticFile("video/cursor_mano_contorno_negro_interior_blanco.png")}
        style={{
          width: 76,
          height: 76,
          objectFit: "contain",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: handCursorPressPoint.x - 17,
          top: handCursorPressPoint.y - 17,
          width: 34,
          height: 34,
          borderRadius: 999,
          border: "3px solid rgba(239,212,176,0.92)",
          opacity: click,
          transform: `scale(${1 + click * 1.55})`,
        }}
      />
    </div>
  );
}

function AddressEntry() {
  const frame = useCurrentFrame() * playbackSpeed;
  const show = ease(ramp(frame, 24, 76));
  const typeProgress = ramp(frame, 96, 218);
  const enterDown = ramp(frame, 238, 250) * (1 - ramp(frame, 270, 292));
  const handMove = ease(ramp(frame, 206, 238));
  const handOpacity = ramp(frame, 202, 216) * (1 - ramp(frame, 284, 322));
  const hide = ramp(frame, 298, 360);
  const opacity = show * (1 - hide);
  const typedUrl = siteUrl.slice(0, Math.round(typeProgress * siteUrl.length));
  const cursorOpacity = typeProgress < 1 && Math.floor(frame / 12) % 2 === 0 ? 1 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 330,
        top: 418,
        width: 1260,
        opacity,
        transform: `translateY(${(1 - show) * 34 - hide * 24}px) scale(${interpolate(show, [0, 1], [0.92, 1])})`,
      }}
    >
      <div
        style={{
          height: 112,
          borderRadius: 999,
          border: "2px solid rgba(239,212,176,0.78)",
          background: "rgba(255,250,242,0.94)",
          boxShadow: `0 34px 90px rgba(0,0,0,0.28), 0 0 ${46 + enterDown * 42}px rgba(239,212,176,0.22)`,
          display: "flex",
          alignItems: "center",
          padding: "0 30px 0 44px",
          color: colors.deep,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            border: `4px solid ${colors.blue}`,
            marginRight: 26,
            boxShadow: "12px 12px 0 -8px #0b3350",
            opacity: 0.82,
          }}
        />
        <div
          style={{
            flex: 1,
            fontSize: 44,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: 0,
            whiteSpace: "nowrap",
          }}
        >
          {typedUrl}
          <span style={{ opacity: cursorOpacity, color: colors.blue }}>|</span>
        </div>
        <div
          style={{
            minWidth: 158,
            height: 62,
            borderRadius: 999,
            background: colors.blue,
            color: colors.white,
            display: "grid",
            placeItems: "center",
            fontSize: 24,
            fontWeight: 950,
            transform: `translateY(${enterDown * 5}px) scale(${1 - enterDown * 0.06})`,
            boxShadow: `0 ${12 - enterDown * 8}px 0 rgba(16,35,47,0.34), 0 18px 34px rgba(0,0,0,0.22)`,
          }}
        >
          ENTRAR
        </div>
      </div>
      <BrowserHandCursor
        x={interpolate(handMove, [0, 1], [630, 1148])}
        y={interpolate(handMove, [0, 1], [122, 58])}
        opacity={handOpacity}
        click={enterDown}
      />
    </div>
  );
}

function HomeScreen({ frameOffset = 0 }: { frameOffset?: number }) {
  const frame = (useCurrentFrame() + frameOffset) * playbackSpeed;
  const { fps } = useVideoConfig();
  const sponsorsSlowdown = 3.5;
  const later = (seconds: number) => seconds + sponsorsSlowdown;
  const postSponsorsFrameShift = Math.ceil((sponsorsSlowdown * fps) / playbackSpeed);
  const browserShow = ease(ramp(frame, 350, 410));
  const entrance = ease(ramp(frame, 350, 446));
  const scrollDown = ease(ramp(frame, fps * 16, fps * 30));
  const scrollUp = ease(ramp(frame, fps * later(35.5), fps * later(40)));
  const sponsorsZoomIn = ease(ramp(frame, fps * 30.1, fps * 31.1));
  const sponsorsPan = ramp(frame, fps * 31.8, fps * later(34.6));
  const sponsorsZoomOut = ease(ramp(frame, fps * later(34.6), fps * later(35.5)));
  const menuFocus = ease(ramp(frame, fps * later(40.5), fps * later(44)));
  const menuClick = ramp(frame, fps * later(44.2), fps * later(44.6)) * (1 - ramp(frame, fps * later(45.2), fps * later(46)));
  const pageSwap = ease(ramp(frame, fps * later(46), fps * later(48.2)));
  const zoomOut = ease(ramp(frame, fps * later(48), fps * later(51)));
  const stationsScroll = ease(ramp(frame, fps * later(52), fps * later(60)));
  const stationCardClick = ramp(frame, fps * later(64), fps * later(64.4)) * (1 - ramp(frame, fps * later(65), fps * later(65.8)));
  const detailSwap = ease(ramp(frame, fps * later(66), fps * later(68.4)));
  const actorsSwap = ease(ramp(frame, fps * later(91), fps * later(92.4)));
  const actorDetailSwap = ease(ramp(frame, fps * later(112), fps * later(113.4)));
  const productsSwap = ease(ramp(frame, fps * later(136), fps * later(137.4)));
  const productDetailSwap = ease(ramp(frame, fps * later(156), fps * later(157.4)));
  const experiencesSwap = ease(ramp(frame, fps * later(180), fps * later(181.4)));
  const experienceDetailSwap = ease(ramp(frame, fps * later(197), fps * later(198.4)));
  const imperdiblesSwap = ease(ramp(frame, fps * later(220), fps * later(221.4)));
  const destacadosSwap = ease(ramp(frame, fps * later(224.4), fps * later(225.4)));
  const menuCursorMove = ease(ramp(frame, fps * later(42.9), fps * later(44.1)));
  const cardCursorMove = ease(ramp(frame, fps * later(62.8), fps * later(63.9)));
  const actorsCursorMove = ease(ramp(frame, fps * later(88), fps * later(89.2)));
  const actorCardCursorMove = ease(ramp(frame, fps * later(108.8), fps * later(110)));
  const productsCursorMove = ease(ramp(frame, fps * later(133), fps * later(134.2)));
  const productCardCursorMove = ease(ramp(frame, fps * later(153.8), fps * later(155)));
  const experiencesCursorMove = ease(ramp(frame, fps * later(177), fps * later(178.2)));
  const experienceCardCursorMove = ease(ramp(frame, fps * later(194.8), fps * later(196)));
  const imperdiblesCursorMove = ease(ramp(frame, fps * later(217), fps * later(218.2)));
  const destacadosCursorMove = ease(ramp(frame, fps * later(222), fps * later(223.2)));
  const actorsClick = ramp(frame, fps * later(89.6), fps * later(90)) * (1 - ramp(frame, fps * later(90.5), fps * later(91)));
  const actorCardClick = ramp(frame, fps * later(110.4), fps * later(110.8)) * (1 - ramp(frame, fps * later(111.3), fps * later(112)));
  const productsClick = ramp(frame, fps * later(134.6), fps * later(135)) * (1 - ramp(frame, fps * later(135.5), fps * later(136)));
  const productCardClick = ramp(frame, fps * later(155.4), fps * later(155.8)) * (1 - ramp(frame, fps * later(156.3), fps * later(157)));
  const experiencesClick = ramp(frame, fps * later(178.6), fps * later(179)) * (1 - ramp(frame, fps * later(179.5), fps * later(180)));
  const experienceCardClick = ramp(frame, fps * later(196.4), fps * later(196.8)) * (1 - ramp(frame, fps * later(197.3), fps * later(198)));
  const imperdiblesClick = ramp(frame, fps * later(218.6), fps * later(219)) * (1 - ramp(frame, fps * later(219.5), fps * later(220)));
  const destacadosClick = ramp(frame, fps * later(223.6), fps * later(224)) * (1 - ramp(frame, fps * later(224.5), fps * later(225)));

  const homeScrollY = interpolate(scrollDown * (1 - scrollUp), [0, 1], [0, -2420]);
  const sponsorsFocus = sponsorsZoomIn * (1 - sponsorsZoomOut);
  const sponsorsScale = interpolate(sponsorsFocus, [0, 1], [1, 2.05]);
  const sponsorFocusX = interpolate(sponsorsPan, [0, 0.2, 0.42, 0.64, 0.84, 1], [235, 450, 650, 865, 1110, 1295]);
  const sponsorFocusY = 2956;
  const sponsorsViewportX = 740;
  const sponsorsViewportY = 520;
  const sponsorsTranslateX = sponsorsFocus * (sponsorsViewportX - sponsorFocusX * sponsorsScale);
  const sponsorsTranslateY = homeScrollY + sponsorsFocus * (sponsorsViewportY - sponsorFocusY * sponsorsScale - homeScrollY);
  const stationsScrollY = interpolate(stationsScroll, [0, 1], [0, -2360]);
  const detailScrollY = downUpScroll(frame, fps, later(73), later(81.5), later(83), later(88), -2180);
  const actorsScrollY = downUpScroll(frame, fps, later(94), later(101), later(102), later(108), -6200);
  const actorCardRevealScrollY = interpolate(ease(ramp(frame, fps * later(108.1), fps * later(109.6))), [0, 1], [0, -360]);
  const actorsTopCropY = 12;
  const actorDetailScrollY = downUpScroll(frame, fps, later(115), later(123), later(124), later(130), -1880);
  const productsScrollY = downUpScroll(frame, fps, later(139), later(146), later(147), later(153), -5200);
  const productCardRevealScrollY = interpolate(ease(ramp(frame, fps * later(153.1), fps * later(154.6))), [0, 1], [0, -500]);
  const productDetailScrollY = downUpScroll(frame, fps, later(159), later(167), later(168), later(174), -1770);
  const experiencesScrollY = downUpScroll(frame, fps, later(183), later(188), later(189), later(194), -1050);
  const experienceCardRevealScrollY = interpolate(ease(ramp(frame, fps * later(194.1), fps * later(195.6))), [0, 1], [0, -360]);
  const experienceDetailScrollY = downUpScroll(frame, fps, later(200), later(207), later(208), later(214), -1260);
  const destacadosScrollY = downUpScroll(frame, fps, later(226), later(231), later(232), later(237.5), -4040);
  const glow = interpolate(entrance, [0, 1], [0, 1]);
  const focusAmount = menuFocus * (1 - zoomOut);
  const navigationScale = interpolate(focusAmount, [0, 1], [1, 1.48]);
  const cursorOpacity = ramp(frame, fps * later(42.9), fps * later(43.3)) * (1 - ramp(frame, fps * later(47), fps * later(48)));
  const cardCursorOpacity = ramp(frame, fps * later(62.8), fps * later(63.2)) * (1 - ramp(frame, fps * later(66.2), fps * later(67)));
  const actorsCursorOpacity = ramp(frame, fps * later(88), fps * later(88.4)) * (1 - ramp(frame, fps * later(91), fps * later(91.6)));
  const actorCardCursorOpacity = ramp(frame, fps * later(108.8), fps * later(109.2)) * (1 - ramp(frame, fps * later(112.2), fps * later(113)));
  const productsCursorOpacity = ramp(frame, fps * later(133), fps * later(133.4)) * (1 - ramp(frame, fps * later(136), fps * later(136.6)));
  const productCardCursorOpacity = ramp(frame, fps * later(153.8), fps * later(154.2)) * (1 - ramp(frame, fps * later(157.2), fps * later(158)));
  const experiencesCursorOpacity = ramp(frame, fps * later(177), fps * later(177.4)) * (1 - ramp(frame, fps * later(180), fps * later(180.6)));
  const experienceCardCursorOpacity = ramp(frame, fps * later(194.8), fps * later(195.2)) * (1 - ramp(frame, fps * later(198.2), fps * later(199)));
  const imperdiblesCursorOpacity = ramp(frame, fps * later(217), fps * later(217.4)) * (1 - ramp(frame, fps * later(220), fps * later(220.6)));
  const destacadosCursorOpacity = ramp(frame, fps * later(222), fps * later(222.4)) * (1 - ramp(frame, fps * later(225), fps * later(225.6)));

  return (
    <div
      style={{
        position: "absolute",
        left: 220,
        top: 62,
        width: 1480,
        height: 940,
        opacity: browserShow,
        transform: `translateY(${(1 - browserShow) * 34}px)`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 30,
          overflow: "hidden",
          background: colors.blue,
          border: "2px solid rgba(255,250,242,0.72)",
          boxShadow: `0 42px 120px rgba(0,0,0,${0.28 + glow * 0.18}), 0 0 ${80 * glow}px rgba(239,212,176,0.22)`,
          transform: `scale(${navigationScale}) translateY(${-focusAmount * 8}px)`,
          transformOrigin: "34% 12%",
        }}
      >
        <BrowserChrome />
        <div style={{ position: "relative", height: 880, overflow: "hidden", background: colors.blue }}>
          <Sequence from={0} durationInFrames={620} layout="none">
            <Img
              src={staticFile("video/screenshots/home-full.png")}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "auto",
                display: "block",
                opacity: 1 - pageSwap,
                transform: `translate(${sponsorsTranslateX}px, ${sponsorsTranslateY}px) scale(${sponsorsScale})`,
                transformOrigin: "0 0",
                filter: "saturate(1.04) contrast(1.02)",
              }}
            />
          </Sequence>
          <Sequence from={515 + postSponsorsFrameShift} durationInFrames={525} layout="none">
            <Img
              src={staticFile("video/screenshots/estaciones.png")}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "auto",
                display: "block",
                opacity: pageSwap * (1 - detailSwap),
                transform: `translateY(${stationsScrollY}px)`,
                filter: "saturate(1.04) contrast(1.02)",
              }}
            />
          </Sequence>
          <Sequence from={815 + postSponsorsFrameShift} durationInFrames={430} layout="none">
            <Img
              src={staticFile("video/screenshots/estacion.png")}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "auto",
                display: "block",
                opacity: detailSwap * (1 - actorsSwap),
                transform: `translateY(${detailScrollY}px)`,
                filter: "saturate(1.04) contrast(1.02)",
              }}
            />
          </Sequence>
          <Sequence from={1180 + postSponsorsFrameShift} durationInFrames={390} layout="none">
            <Img
              src={staticFile("video/screenshots/artesanas.png")}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "auto",
                display: "block",
                opacity: actorsSwap * (1 - actorDetailSwap),
                transform: `translateY(${actorsScrollY + actorCardRevealScrollY - actorsTopCropY}px)`,
                filter: "saturate(1.04) contrast(1.02)",
              }}
            />
          </Sequence>
          <Sequence from={1500 + postSponsorsFrameShift} durationInFrames={560} layout="none">
            <Img
              src={staticFile("video/screenshots/actor.png")}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "auto",
                display: "block",
                opacity: actorDetailSwap * (1 - productsSwap),
                transform: `translateY(${actorDetailScrollY}px)`,
                filter: "saturate(1.04) contrast(1.02)",
              }}
            />
          </Sequence>
          <Sequence from={1860 + postSponsorsFrameShift} durationInFrames={390} layout="none">
            <Img
              src={staticFile("video/screenshots/productos.png")}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "auto",
                display: "block",
                opacity: productsSwap * (1 - productDetailSwap),
                transform: `translateY(${productsScrollY + productCardRevealScrollY}px)`,
                filter: "saturate(1.04) contrast(1.02)",
              }}
            />
          </Sequence>
          <Sequence from={2160 + postSponsorsFrameShift} durationInFrames={560} layout="none">
            <Img
              src={staticFile("video/screenshots/producto.png")}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "auto",
                display: "block",
                opacity: productDetailSwap * (1 - experiencesSwap),
                transform: `translateY(${productDetailScrollY}px)`,
                filter: "saturate(1.04) contrast(1.02)",
              }}
            />
          </Sequence>
          <Sequence from={2520 + postSponsorsFrameShift} durationInFrames={340} layout="none">
            <Img
              src={staticFile("video/screenshots/experiencias.png")}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "auto",
                display: "block",
                opacity: experiencesSwap * (1 - experienceDetailSwap),
                transform: `translateY(${experiencesScrollY + experienceCardRevealScrollY}px)`,
                filter: "saturate(1.04) contrast(1.02)",
              }}
            />
          </Sequence>
          <Sequence from={2780 + postSponsorsFrameShift} durationInFrames={520} layout="none">
            <Img
              src={staticFile("video/screenshots/experiencia.png")}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "auto",
                display: "block",
                opacity: experienceDetailSwap * (1 - imperdiblesSwap),
                transform: `translateY(${experienceDetailScrollY}px)`,
                filter: "saturate(1.04) contrast(1.02)",
              }}
            />
          </Sequence>
          <Sequence from={3120 + postSponsorsFrameShift} durationInFrames={480} layout="none">
            <Img
              src={staticFile("video/screenshots/imperdibles.png")}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "auto",
                display: "block",
                opacity: imperdiblesSwap * (1 - destacadosSwap),
                filter: "saturate(1.04) contrast(1.02)",
              }}
            />
            <Img
              src={staticFile("video/screenshots/imperdibles-destacados.png")}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "auto",
                display: "block",
                opacity: destacadosSwap,
                transform: `translateY(${destacadosScrollY}px)`,
                filter: "saturate(1.04) contrast(1.02)",
              }}
            />
          </Sequence>
          <Sequence from={430 + postSponsorsFrameShift} durationInFrames={120} layout="none">
            <div
              style={{
                position: "absolute",
                left: 440,
                top: 33,
                width: 124,
                height: 43,
                borderRadius: 999,
                border: "3px solid rgba(239,212,176,0.96)",
                opacity: focusAmount * (1 - pageSwap * 0.72),
                boxShadow: `0 0 ${24 + menuClick * 34}px rgba(239,212,176,0.5)`,
                transform: `scale(${1 + menuClick * 0.08})`,
              }}
            />
          </Sequence>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(16,35,47,0.02), transparent 20%, transparent 78%, rgba(16,35,47,0.18))",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
      <Sequence from={468 + postSponsorsFrameShift} durationInFrames={80} layout="none">
        <BrowserHandCursor
          x={interpolate(menuCursorMove, [0, 1], [740, 500])}
          y={interpolate(menuCursorMove, [0, 1], [478, 116])}
          opacity={cursorOpacity}
          click={menuClick}
        />
      </Sequence>
      <Sequence from={765 + postSponsorsFrameShift} durationInFrames={70} layout="none">
        <BrowserHandCursor
          x={interpolate(cardCursorMove, [0, 1], [740, 368])}
          y={interpolate(cardCursorMove, [0, 1], [478, 650])}
          opacity={cardCursorOpacity}
          click={stationCardClick}
        />
      </Sequence>
      <Sequence from={1145 + postSponsorsFrameShift} durationInFrames={90} layout="none">
        <BrowserHandCursor
          x={interpolate(actorsCursorMove, [0, 1], [740, 642])}
          y={interpolate(actorsCursorMove, [0, 1], [478, 116])}
          opacity={actorsCursorOpacity}
          click={actorsClick}
        />
      </Sequence>
      <Sequence from={1455 + postSponsorsFrameShift} durationInFrames={85} layout="none">
        <BrowserHandCursor
          x={interpolate(actorCardCursorMove, [0, 1], [740, 355])}
          y={interpolate(actorCardCursorMove, [0, 1], [478, 635])}
          opacity={actorCardCursorOpacity}
          click={actorCardClick}
        />
      </Sequence>
      <Sequence from={1820 + postSponsorsFrameShift} durationInFrames={90} layout="none">
        <BrowserHandCursor
          x={interpolate(productsCursorMove, [0, 1], [740, 765])}
          y={interpolate(productsCursorMove, [0, 1], [478, 116])}
          opacity={productsCursorOpacity}
          click={productsClick}
        />
      </Sequence>
      <Sequence from={2130 + postSponsorsFrameShift} durationInFrames={85} layout="none">
        <BrowserHandCursor
          x={interpolate(productCardCursorMove, [0, 1], [740, 355])}
          y={interpolate(productCardCursorMove, [0, 1], [478, 535])}
          opacity={productCardCursorOpacity}
          click={productCardClick}
        />
      </Sequence>
      <Sequence from={2480 + postSponsorsFrameShift} durationInFrames={90} layout="none">
        <BrowserHandCursor
          x={interpolate(experiencesCursorMove, [0, 1], [740, 930])}
          y={interpolate(experiencesCursorMove, [0, 1], [478, 116])}
          opacity={experiencesCursorOpacity}
          click={experiencesClick}
        />
      </Sequence>
      <Sequence from={2750 + postSponsorsFrameShift} durationInFrames={85} layout="none">
        <BrowserHandCursor
          x={interpolate(experienceCardCursorMove, [0, 1], [740, 355])}
          y={interpolate(experienceCardCursorMove, [0, 1], [478, 620])}
          opacity={experienceCardCursorOpacity}
          click={experienceCardClick}
        />
      </Sequence>
      <Sequence from={3080 + postSponsorsFrameShift} durationInFrames={90} layout="none">
        <BrowserHandCursor
          x={interpolate(imperdiblesCursorMove, [0, 1], [740, 1002])}
          y={interpolate(imperdiblesCursorMove, [0, 1], [478, 116])}
          opacity={imperdiblesCursorOpacity}
          click={imperdiblesClick}
        />
      </Sequence>
      <Sequence from={3155 + postSponsorsFrameShift} durationInFrames={100} layout="none">
        <BrowserHandCursor
          x={interpolate(destacadosCursorMove, [0, 1], [740, 1013])}
          y={interpolate(destacadosCursorMove, [0, 1], [478, 398])}
          opacity={destacadosCursorOpacity}
          click={destacadosClick}
        />
      </Sequence>
    </div>
  );
}

export function CatalogoPublicoPromo() {
  const frame = useCurrentFrame() * playbackSpeed;
  const ambient = interpolate(frame, [0, 1200], [1, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${colors.deep}, ${colors.blue})`, overflow: "hidden", fontFamily: "Arial, sans-serif" }}>
      <Img
        src={staticFile("images/home/hero-1.png")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.22,
          transform: `scale(${ambient})`,
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(11,51,80,0.72)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(90deg, rgba(239,212,176,0.07) 1px, transparent 1px), linear-gradient(rgba(239,212,176,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <Sequence from={0} durationInFrames={185} layout="none">
        <AddressEntry />
      </Sequence>
      <Sequence from={175} durationInFrames={3485} layout="none">
        <HomeScreen frameOffset={175} />
      </Sequence>
    </AbsoluteFill>
  );
}
