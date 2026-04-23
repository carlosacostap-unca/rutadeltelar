import { getProductsResult, getStationsResult } from "@/app/lib/data";
import { DataSourceBadge } from "@/components/data-source-badge";
import { ProductosClient } from "@/components/productos-client";
import { SectionHeading } from "@/components/section-heading";

export default async function ProductosPage() {
  const [productsResult, stationsResult] = await Promise.all([
    getProductsResult(),
    getStationsResult(),
  ]);
  const products = productsResult.items;
  const stations = stationsResult.items;

  // Categorías del catálogo (derivadas de datos reales = categorias_producto activo)
  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ].sort();

  // Solo estaciones con productos
  const stationsWithProducts = stations.filter((s) =>
    products.some(
      (p) => p.stationSlug === s.slug || p.stationRecordId === s.recordId,
    ),
  );

  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-8">
        <SectionHeading
          eyebrow="Productos"
          title="Piezas y productos de la ruta"
          description="Artesanías, textiles y producciones locales elaboradas por los actores que integran la Ruta del Telar."
        />
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
    </main>
  );
}
