"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent, PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

type StationDepartmentLink = {
  name: string;
  href: string;
};

type HomeHeroCarouselProps = {
  stationDepartmentLinks?: StationDepartmentLink[];
};

const fallbackStationDepartmentLinks = [
  {
    name: "Antofagasta de la Sierra",
    href: `/estaciones?departamento=${encodeURIComponent("Antofagasta de la Sierra")}`,
  },
  {
    name: "Bel\u00e9n",
    href: `/estaciones?departamento=${encodeURIComponent("Bel\u00e9n")}`,
  },
  {
    name: "Santa Mar\u00eda",
    href: `/estaciones?departamento=${encodeURIComponent("Santa Mar\u00eda")}`,
  },
];

const heroSlides = [
  {
    image: "/images/home/hero-1.png",
    imageAlt: "Paisaje de la Ruta del Telar",
    content: (
      <>
        <h1 className="text-[2.25rem] font-black leading-[0.98] tracking-normal text-white sm:text-[3.15rem]">
          ¿Qué es la
          <br />
          <span className="text-[#efd4b0]">Ruta del Telar?</span>
        </h1>
        <svg
          aria-hidden="true"
          className="mt-8 h-7 w-80 max-w-full text-[#efd4b0]"
          viewBox="0 0 360 32"
          fill="none"
        >
          <path
            d="M2 19c38-8 67-5 100-9 48-6 78 5 117 1 24-2 39-8 58-4 24 5 50 8 81-1"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.2"
          />
        </svg>
        <div className="mt-7 max-w-[25rem] space-y-6 text-justify text-lg font-normal leading-[1.25] text-white">
          <p>
            Un proyecto que impulsa el desarrollo local y fortalece a las
            comunidades de Catamarca.
          </p>
          <p>
            Fortalece las cadenas de valor orientadas al mercado y construye un
            corredor turístico integral que articula la riqueza natural,
            arqueológica, cultural y productiva de cada zona.
          </p>
        </div>
      </>
    ),
  },
  {
    image: "/images/home/hero-2.png",
    imageAlt: "Estaciones de la Ruta del Telar",
    content: (
      <>
        <h1 className="text-[2.45rem] font-black leading-none tracking-normal text-[#efd4b0] sm:text-[3.35rem]">
          Estaciones
        </h1>
        <p className="mt-7 max-w-[43rem] text-justify text-base font-normal leading-[1.28] text-white sm:text-lg md:text-xl">
          Con 14 estaciones distribuidas en 3 departamentos, el circuito conecta
          territorios y saberes ofreciendo experiencias únicas a quienes lo
          recorren. Su objetivo es consolidar un corredor turístico integral con
          servicios de alta calidad, que incluyen atención al público,
          información cartográfica y detallada sobre la Ruta, alojamiento,
          gastronomía regional, actividades recreativas y servicios. Cada parada
          funciona como la puerta de entrada a su localidad y como una ventana
          para mostrar su potencial natural y desarrollo comunitario.
        </p>
      </>
    ),
  },
  {
    image: "/images/home/hero-3.png",
    imageAlt: "Actores de la Ruta del Telar",
    content: (
      <>
        <h1 className="text-[2.45rem] font-black leading-none tracking-normal text-[#efd4b0] sm:text-[3.35rem]">
          Actores
        </h1>
        <div className="mt-7 max-w-[43rem] space-y-5 text-justify text-base font-normal leading-[1.28] text-white sm:text-lg md:text-xl">
          <p>
            En cada obra artesanal late el alma de quienes transforman la
            materia prima en piezas únicas de gran valor cultural. Manos
            tejedoras, alfareras y cesteras dan vida a productos que reflejan
            técnicas ancestrales y narran historias vivas de identidad.
          </p>
          <p>
            Esta riqueza se complementa con una gastronomía local que combina
            recetas milenarias e ingredientes de alta calidad para ofrecer
            sabores auténticos. Guiados por la calidez de los expertos locales a
            través de paisajes asombrosos, esta fusión de artesanía, cocina y
            tradición hace de la Ruta del Telar una experiencia inolvidable.
          </p>
        </div>
      </>
    ),
  },
  {
    image: "/images/home/hero-4.png",
    imageAlt: "Imperdibles de la Ruta del Telar",
    content: (
      <>
        <h1 className="text-[2.45rem] font-black leading-none tracking-normal text-[#efd4b0] sm:text-[3.35rem]">
          Imperdibles
        </h1>
        <p className="mt-5 max-w-[43rem] text-xl font-black leading-tight text-white sm:text-2xl md:text-3xl">
          Descubrí los imperdibles de la Ruta del Telar
        </p>
        <p className="mt-7 max-w-[43rem] text-justify text-base font-normal leading-[1.28] text-white sm:text-lg md:text-xl">
          Lo que hace único a este corredor es la integralidad de su propuesta.
          La Ruta del Telar invita a vivir una experiencia completa. Por eso, te
          invitamos a descubrir la riqueza de los sitios arqueológicos que
          custodian el legado prehispánico, y a maravillarte con los atractivos
          naturales y los grandes contrastes geográficos que distinguen a cada
          una de sus estaciones.
        </p>
      </>
    ),
  },
];

const heroTrackSlideCount = heroSlides.length;
const swipeThreshold = 48;

type SwipeGesture = {
  pointerId: number;
  startX: number;
  startY: number;
};

function isInteractiveSwipeTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("a,button"));
}

function HeroArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "previous" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={
        direction === "previous" ? "Ver hero anterior" : "Ver hero siguiente"
      }
      disabled={disabled}
      onClick={onClick}
      className={`absolute bottom-5 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-black/32 text-white backdrop-blur transition hover:bg-black/46 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-black/32 md:top-1/2 md:bottom-auto md:h-11 md:w-11 md:-translate-y-1/2 ${
        direction === "previous"
          ? "right-20 md:left-5 md:right-auto"
          : "right-6 md:right-5"
      }`}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        {direction === "previous" ? (
          <path
            d="M15 18 9 12l6-6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        ) : (
          <path
            d="m9 18 6-6-6-6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        )}
      </svg>
    </button>
  );
}

function StationHeroDepartmentLinks({
  departments,
}: {
  departments: StationDepartmentLink[];
}) {
  return (
    <div className="mt-8 grid max-w-[43rem] gap-3 text-sm font-black uppercase leading-tight tracking-normal text-white sm:grid-cols-3">
      {departments.map((department) => (
        <Link
          key={department.name}
          href={department.href}
          className="border-t border-white/55 pt-3 transition hover:border-[#efd4b0] hover:text-[#efd4b0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#efd4b0] focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
        >
          Departamento {department.name}
        </Link>
      ))}
    </div>
  );
}

export function HomeHeroCarousel({
  stationDepartmentLinks = fallbackStationDepartmentLinks,
}: HomeHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const swipeGesture = useRef<SwipeGesture | null>(null);
  const ignoreClickAfterSwipe = useRef(false);
  const ignoreClickTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === heroSlides.length - 1;

  useEffect(() => {
    return () => {
      if (ignoreClickTimeout.current) {
        clearTimeout(ignoreClickTimeout.current);
      }
    };
  }, []);

  const goToPrevious = () => {
    if (isFirstSlide) {
      return;
    }

    setDragOffset(0);
    setActiveIndex((current) => current - 1);
  };

  const goToNext = () => {
    if (isLastSlide) {
      return;
    }

    setDragOffset(0);
    setActiveIndex((current) => current + 1);
  };

  const goToSlide = (index: number) => {
    setDragOffset(0);
    setActiveIndex(index);
  };

  const releaseSwipePointer = (element: HTMLDivElement, pointerId: number) => {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  };

  const resetSwipeGesture = (event: PointerEvent<HTMLDivElement>) => {
    releaseSwipePointer(event.currentTarget, event.pointerId);
    swipeGesture.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  const markSwipeClickIgnored = () => {
    ignoreClickAfterSwipe.current = true;

    if (ignoreClickTimeout.current) {
      clearTimeout(ignoreClickTimeout.current);
    }

    ignoreClickTimeout.current = setTimeout(() => {
      ignoreClickAfterSwipe.current = false;
    }, 0);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      !event.isPrimary ||
      isInteractiveSwipeTarget(event.target) ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    swipeGesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    setIsDragging(true);
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = swipeGesture.current;

    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;

    if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if ((isFirstSlide && deltaX > 0) || (isLastSlide && deltaX < 0)) {
        setDragOffset(0);
        return;
      }

      setDragOffset(deltaX);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = swipeGesture.current;

    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    const isHorizontalSwipe =
      Math.abs(deltaX) >= swipeThreshold &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.1;

    swipeGesture.current = null;
    releaseSwipePointer(event.currentTarget, event.pointerId);
    setIsDragging(false);

    if (
      isHorizontalSwipe &&
      !((isFirstSlide && deltaX > 0) || (isLastSlide && deltaX < 0))
    ) {
      markSwipeClickIgnored();

      if (deltaX < 0) {
        goToNext();
      } else {
        goToPrevious();
      }

      return;
    }

    setDragOffset(0);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!ignoreClickAfterSwipe.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    ignoreClickAfterSwipe.current = false;
  };

  return (
    <section className="mb-16 md:mb-20" aria-label="Presentacion principal">
      <div
        className="relative min-h-[660px] select-none overflow-hidden rounded-[2rem] [touch-action:pan-y] sm:min-h-[610px] md:min-h-[560px]"
        onClickCapture={handleClickCapture}
        onDragStart={(event) => event.preventDefault()}
        onPointerCancel={resetSwipeGesture}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          data-testid="home-hero-track"
          className={`flex min-h-[660px] sm:min-h-[610px] md:min-h-[560px] ${
            isDragging
              ? "transition-none"
              : "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          }`}
          style={{
            transform: `translateX(calc(${
              activeIndex * (-100 / heroTrackSlideCount)
            }% + ${dragOffset}px))`,
            width: `${heroTrackSlideCount * 100}%`,
          }}
        >
          {heroSlides.map((slide, index) => {
            const active = index === activeIndex;

            return (
              <div
                key={slide.image}
                aria-hidden={!active}
                className={`relative min-h-[660px] w-full shrink-0 sm:min-h-[610px] md:min-h-[560px] ${
                  active ? "" : "pointer-events-none"
                }`}
                style={{ width: `${100 / heroTrackSlideCount}%` }}
              >
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  priority={index === 0}
                  draggable={false}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1100px"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.76)_0%,rgba(0,0,0,0.52)_48%,rgba(0,0,0,0.26)_100%)]" />
                <div className="relative z-10 flex min-h-[660px] max-w-4xl flex-col justify-center px-7 py-16 sm:min-h-[610px] md:min-h-[560px] md:px-16">
                  {slide.content}
                  {index === 1 ? (
                    <StationHeroDepartmentLinks
                      departments={stationDepartmentLinks}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <HeroArrow
          direction="previous"
          disabled={isFirstSlide}
          onClick={goToPrevious}
        />
        <HeroArrow direction="next" disabled={isLastSlide} onClick={goToNext} />

        <div
          className="absolute bottom-6 left-7 z-20 flex items-center gap-2 md:left-16"
          aria-label="Seleccionar hero"
          role="group"
        >
          {heroSlides.map((slide, index) => {
            const active = index === activeIndex;

            return (
              <button
                key={slide.image}
                type="button"
                aria-label={`Ver hero ${index + 1}`}
                aria-current={active ? "true" : undefined}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  active ? "w-9 bg-[#efd4b0]" : "w-2.5 bg-white/55"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
