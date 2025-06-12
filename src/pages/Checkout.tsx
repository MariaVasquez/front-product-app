import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { OrderRequest } from "../models/order-request.model";
import { ProductService } from "../api/products-service";
import { LoginModal } from "../components/LoginModal";
import { SuccessModal } from "../components/SuccessModal";
import { ErrorModal } from "../components/ErrorModal";
import { PaymentForm } from "../components/PaymentForm";
import { useAuth } from "../context/auth-context";

type DetailProduct = {
  productId: number;
  imageUrl: string;
  productName: string;
  price: number;
  quantity: number;
};
export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderInfo = location.state as OrderRequest;
  const { user } = useAuth();
  const [total, setTotalAmount] = useState<number>();
  const [subtotal, setSubtotalAmount] = useState<number>();
  const [iva, setIvaAmount] = useState<number>();
  const productService = useRef(new ProductService()).current;
  const [detailedItems, setDetailedItems] = useState<DetailProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsConditions, setTermsConditions] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  const formatPrice = (value: number): string => {
    return value.toLocaleString("es-CO");
  };

  const totalAmount = async () => {
    setIsLoading(true);
    let amount = 0;
    const dataDetail: DetailProduct[] = [];
    for (const item of orderInfo.items) {
      try {
        const data = await productService.getProductById(item.productId);
        const price = data.data?.price;

        const detail: DetailProduct = {
          imageUrl: data.data?.images.find((i) => i.isMain)?.url ?? "",
          price: data.data?.price ?? 0,
          productId: data.data?.id ?? 0,
          productName: data.data?.name ?? "Producto sin nombre",
          quantity: item.quantity,
        };
        dataDetail.push(detail);
        setDetailedItems(dataDetail);

        if (typeof price === "number" && price > 0) {
          amount += price * item.quantity;
          setIsLoading(false);
        } else {
          console.warn(`Precio inválido para el producto ${item.productId}`);
          setIsError(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(`Error al obtener producto ${item.productId}`, err);
        setIsError(true);
        setIsLoading(false);
      }
    }
    const iva = amount * 0.19;
    const total = iva + amount;
    setIvaAmount(iva);
    setSubtotalAmount(amount);
    setTotalAmount(total);
    return amount;
  };

  useEffect(() => {
    if (!user) {
      setIsModalOpen(true);
      return;
    }
    setIsModalOpen(false);
    if (orderInfo) {
      totalAmount();
    }
  }, [user, navigate]);

  return (
    <>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start pt-24 px-6 text-base">
        <div>
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-gray-100 p-6 rounded-lg">
              <h2 className="font-semibold text-xl mb-2">Identificación</h2>
              <div className="text-base text-gray-700 space-y-1">
                <p>
                  Nombre: {user?.name} {user?.email}
                </p>
                <p>Teléfono / Móvil: {user?.phoneNumber}</p>
              </div>
            </section>

            <section className="bg-gray-100 p-6 rounded-lg">
              <h2 className="font-semibold text-xl mb-2">Envío</h2>
              <p className="text-base font-medium">ENVÍO POR TRANSPORTADORA</p>
              <div className="text-sm text-gray-600 space-y-1 mt-2">
                <p>
                  Dirección:{" "}
                  {user?.address.find((a) => a.isActive)?.addressLine1}
                </p>
                <p>
                  Detalle: {user?.address.find((a) => a.isActive)?.addressLine2}
                </p>
                <p>País: {user?.address.find((a) => a.isActive)?.country}</p>
                <p>
                  Departamento: {user?.address.find((a) => a.isActive)?.region}
                </p>
                <p>Ciudad: {user?.address.find((a) => a.isActive)?.city}</p>
                <p>
                  Código postal:{" "}
                  {user?.address.find((a) => a.isActive)?.postalCode}
                </p>
                <p className="text-sm text-gray-500">Listo el mismo día</p>
              </div>
            </section>
            {user && (
              <PaymentForm
                user={user}
                ivaAmount={iva ?? 0}
                totalAmount={total ?? 0}
                termsConditions={isTermsConditions}
                setTermsError={setTermsError}
              />
            )}
          </div>
        </div>

        <div>
          <aside className="bg-white border border-[#d99a76] rounded p-6 shadow h-fit">
            <h2 className="font-semibold text-xl mb-6">Resumen de la compra</h2>

            {detailedItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-6 mb-6"
              >
                <img
                  src={item.imageUrl || ""}
                  className="w-16 h-16 object-cover rounded-lg"
                  alt={item.productName}
                />
                <div>
                  <p className="text-lg font-semibold">{item.productName}</p>
                  <p className="text-base text-gray-600">Mismo día</p>

                  <p className="text-lg font-bold">
                    $ {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}

            <p className="text-base font-medium">
              IVA(19%):{" "}
              <span className="float-right font-semibold">
                 $ {formatPrice(iva || 0)}
              </span>
            </p>
            <p className="text-base font-medium">
              Subtotal:{" "}
              <span className="float-right font-semibold">
                $ {formatPrice(subtotal || 0)}
              </span>
            </p>
            <p className="text-base font-medium">
              Total:{" "}
              <span className="float-right font-bold">
                $ {formatPrice(total || 0)}
              </span>
            </p>

            <div className="mt-6 text-sm">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={isTermsConditions}
                  onChange={(e) => {
                    setTermsConditions(e.target.checked);
                    if (e.target.checked) setTermsError(null);
                  }}
                />
                <span>
                  He leído y acepto los{" "}
                  <a href="#" className="text-pink-600 underline">
                    Términos
                  </a>{" "}
                  y las{" "}
                  <a href="#" className="text-pink-600 underline">
                    Políticas
                  </a>{" "}
                  de tratamiento de datos
                </span>
              </label>
              {termsError && (
                <p className="text-red-500 text-sm mt-1">{termsError}</p>
              )}
            </div>
          </aside>
        </div>
      </div>
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] flex flex-col items-center justify-center space-y-4 transition-opacity">
          <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          <p className="text-white text-lg font-light">
            Estamos procesando la información...
          </p>
        </div>
      )}
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {isSuccess && (
        <SuccessModal
          message="🎉 ¡Estamos procesando tu pago! Tu pedido fue recibido correctamente "
          onClose={() => setIsSuccess(false)}
        />
      )}

      {isError && (
        <ErrorModal
          message="Hubo un problema al procesar tu pago. Intenta nuevamente."
          onClose={() => setIsError(false)}
        />
      )}
    </>
  );
};
