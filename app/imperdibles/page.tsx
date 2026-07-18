import { getHighlightSpotsResult } from "@/app/lib/data";
import { formatBrandFontText } from "@/app/lib/brand-font-text";
import { DataSourceBadge } from "@/components/data-source-badge";
import { ImperdiblesClient } from "@/components/imperdibles-client";
import { SiteEndSections } from "@/components/site-end-sections";

type ImperdiblesPageProps = {
  searchParams?: Promise<{ view?: string | string[] }>;
};

export default async function ImperdiblesPage({ searchParams }: ImperdiblesPageProps) {
  const resolvedSearchParams = await searchParams;
  const requestedView = Array.isArray(resolvedSearchParams?.view)
    ? resolvedSearchParams.view[0]
    : resolvedSearchParams?.view;
  const initialView =
    requestedView === "agenda" || requestedView === "destacados"
      ? requestedView
      : undefined;
  const highlightSpotsResult = await getHighlightSpotsResult();
  const spots = highlightSpotsResult.items;

  const types = [
    ...new Set(
      spots
        .filter((s) => s.type.toLowerCase() !== "evento")
        .map((s) => s.type)
        .filter(Boolean),
    ),
  ].sort();
  const pageTitle = "Atractivos, actividades y eventos";
  const pageDescription =
    "La agenda de eventos proximos y los atractivos atemporales que no podes perderte en la ruta.";

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <div className="mx-auto w-full max-w-6xl px-5 pb-6 pt-6 sm:px-8 sm:pt-8 md:pb-8 md:pt-12 lg:px-10">
        <header className="mb-8">
          <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
            Imperdibles
          </p>
          <h1 className="brand-font mt-1 max-w-4xl text-[2.35rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] sm:text-[3rem] md:text-[3.75rem]">
            {formatBrandFontText(pageTitle)}
          </h1>
          <p className="mt-5 w-full text-justify text-base font-medium leading-tight text-white/85 sm:text-lg">
            {pageDescription}
          </p>
          <div className="mt-4">
            <DataSourceBadge
              source={highlightSpotsResult.source}
              error={highlightSpotsResult.error}
            />
          </div>
        </header>

        <ImperdiblesClient
          spots={spots}
          types={types}
          initialView={initialView}
        />
      </div>
      <SiteEndSections />
    </main>
  );
}
