import { fetchProducts } from "../api/fetch/product-service.fetch";
import { ProductCard } from "../components/ProductCard";
import { useQuery } from "@tanstack/react-query";

export const Home: React.FC = () => {
  
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    refetchInterval: 10000,
  });

  if (isLoading)
    return <div className="text-center animate-pulse">🌀 Cargando...</div>;
  if (error) return <p>Ocurrió un error cargando los productos.</p>;

  return (
    <>
      <section className="relative h-[60vh] bg-[url('/assets/fondo.png')] bg-cover bg-center bg-fixed flex items-center justify-center">
        <div className="text-center text-white">
          <p className="tracking-widest text-sm md:text-lg uppercase">
            – Bienvenida a –
          </p>
          <h1 className="text-4xl md:text-6xl font-cinzel mt-2">Cute Beauty</h1>
        </div>
      </section>
      <section className="bg-white py-12 px-4 text-center">
        <main className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {products
              .filter((product) =>
                product.images?.some((i) => i.isMain && i.url)
              )
              .map((product) => {
                return (
                  <ProductCard
                    key={product.id!}
                    id={product.id!}
                    title={product.name}
                    price={`$${product.price}`}
                    imageUrl={product.images.find((i) => i.isMain)?.url || ""}
                  />
                );
              })}
          </div>
        </main>
      </section>
    </>
  );
};
