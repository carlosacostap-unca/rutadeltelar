import { formatBrandFontText } from "@/app/lib/brand-font-text";
import { getProductsResult, getStationsResult } from "@/app/lib/data";
import { DataSourceBadge } from "@/components/data-source-badge";
import { ProductosClient } from "@/components/productos-client";

export default async function ProductosPage() {
  const [productsResult, stationsResult] = await Promise.all([
    getProductsResult(),
    getStationsResult(),
  ]);
  const products = productsResult.items;
  const stations = stationsResult.items;

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ].sort();

  const stationsWithProducts = stations.filter((s) =>
    products.some(
      (p) => p.stationSlug === s.slug || p.stationRecordId === s.recordId,
    ),
  );

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-10 sm:px-8 md:pb-28 md:pt-16 lg:px-10">
        <header className="mb-8">
          <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
            Productos
          </p>
          <h1 className="brand-font mt-1 max-w-4xl text-[2.35rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] sm:text-[3rem] md:text-[3.75rem]">
            {formatBrandFontText("Piezas y productos de la ruta")}
          </h1>
          <p className="mt-5 w-full text-justify text-base font-medium leading-tight text-white/85 sm:text-lg">
            Artesanias, textiles y producciones locales elaboradas por los
            actores que integran la Ruta del Telar.
          </p>
          <div className="mt-4">
            <DataSourceBadge
              source={productsResult.source}
              error={productsResult.error}
            />
          </div>
        </header>

        <ProductosClient
          products={products}
          stations={stationsWithProducts}
          categories={categories}
        />
      </div>
    </main>
  );
}
