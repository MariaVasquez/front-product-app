
import { fetchProducts } from "../api/fetch/product-service.fetch";
import { ProductCard } from "../components/ProductCard";
import { useQuery } from "@tanstack/react-query";

export const Home: React.FC = () => {
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    refetchInterval: 10000,
  });

  return (
    <>
      {isLoading || isError && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] flex flex-col items-center justify-center space-y-4 transition-opacity">
          <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          <p className="text-white text-lg font-light">
            Estamos procesando la información...
          </p>
        </div>
      )}
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
                    price={`$${product.price.toLocaleString("es-CO")}`}
                    imageUrl={product.images.find((i) => i.isMain)?.url || ""}
                    stock={product.stock}
                  />
                );
              })}
          </div>
        </main>
      </section>
    </>
  );
};
