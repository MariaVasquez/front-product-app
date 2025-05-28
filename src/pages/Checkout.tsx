import React, { useEffect, useRef, useState } from "react";
import { WompiService, type CardTokenRequest } from "../api/wompi-service";
import { useLocation, useNavigate } from "react-router-dom";
import type { OrderRequest } from "../models/order-request.model";
import type { UserResponse } from "../models/user.model";
import { useLocalStorage } from "../hooks/use-local-storage";
import { OrderService } from "../api/orders-service";
import type { InitiatePaymentRequest } from "../models/payment-initial-request.model";
import { ProductService } from "../api/products-service";
import { PaymentService } from "../api/payments-service";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { LoginModal } from "../components/LoginModal";
import { Eye, EyeOff } from "lucide-react";
import { SuccessModal } from "../components/SuccessModal";
import { ErrorModal } from "../components/ErrorModal";
import { useCart } from "../context/cart-context";

type CardForm = {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
  installments: string;
};

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
  const [user] = useLocalStorage<UserResponse | null>("user", null);
  const wompiService = new WompiService();
  const [total, setTotalAmount] = useState<number>();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CardForm>();
  const orderService = useRef(new OrderService()).current;
  const productService = useRef(new ProductService()).current;
  const paymentService = useRef(new PaymentService()).current;
  const [detailedItems, setDetailedItems] = useState<DetailProduct[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardType, setCardType] = useState<"visa" | "mastercard" | null>(null);
  const [showCvc, setShowCvc] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useCart();

  const formatPrice = (value: number): string => {
    return value.toLocaleString("es-CO");
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setValue("number", value);
    if (/^4/.test(value)) setCardType("visa");
    else if (/^5[1-5]/.test(value) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(value))
      setCardType("mastercard");
    else setCardType(null);
  };

  const token = async (
    cardRequest: CardTokenRequest
  ): Promise<string | undefined> => {
    try {
      const tokenResponse = await wompiService.tokenizeCard(cardRequest);
      if (tokenResponse) {
        return tokenResponse;
      }
      setIsError(true);
      return undefined;
    } catch (err) {
      console.error("Error al generar el token:", err);
      setIsError(true);
      return undefined;
    }
  };

  const totalAmount = async () => {
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
        } else {
          console.warn(`Precio inválido para el producto ${item.productId}`);
        }
      } catch (err) {
        console.error(`Error al obtener producto ${item.productId}`, err);
      }
    }
    setTotalAmount(amount);
    return amount;
  };

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    totalAmount().then();
  }, []);

  const handlePay = async (data: CardForm) => {
    setIsLoading(true);
    const cardRequest: CardTokenRequest = {
      card_holder: data.cardHolder,
      cvc: data.cvc,
      exp_month: data.expMonth,
      exp_year: data.expYear,
      number: data.number,
    };

    if (!user || typeof user.id !== "number") {
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const orderRequest: OrderRequest = {
        userId: user.id,
        items: orderInfo.items,
      };

      const order = await orderService.saveOrder(orderRequest);

      const generatedToken = await token(cardRequest);

      if (!generatedToken) {
        return;
      }

      if (order.data?.id) {
        const initialPaymentRequest: InitiatePaymentRequest = {
          orderId: order.data?.id,
          wompi: {
            amountInCents: await totalAmount(),
            currency: "COP",
            installments: 1,
            redirectUrl: "https://docs.wompi.co/docs/colombia/js/",
            customerEmail: user.email,
            paymentToken: generatedToken,
          },
        };

        paymentService
          .initiatePayment(initialPaymentRequest)
          .then((data) => {
            if (data.message === "Ok") {
              setIsLoading(false);
              dispatch({
                type: "CLEAR_CART"
              });
              setIsSuccess(true);
            } else {
              setIsError(true);
            }
          })
          .catch((err) => {
            console.error(err);
            setIsError(true);
          });
      }
    } catch (err) {
      console.error("Error en el pago", err);
    }
  };

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

            <section className="bg-pink-50 p-6 rounded-lg shadow">
              <h2 className="font-semibold text-xl mb-4">Pago</h2>
              <form
                onSubmit={handleSubmit(handlePay)}
                className="space-y-5 text-lg"
              >
                {/* Número de tarjeta */}
                <div className="relative w-full">
                  <input
                    placeholder="Número"
                    maxLength={19}
                    inputMode="numeric"
                    onInput={handleCardInput}
                    {...register("number", {
                      required: "El número es requerido",
                      validate: {
                        visaOrMastercard: (value) =>
                          /^4\d{12,18}$/.test(value) ||
                          /^5[1-5]\d{14}$/.test(value) ||
                          /^2(2[2-9][1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720)\d{12}$/.test(
                            value
                          )
                            ? true
                            : "Debe ser una tarjeta Visa o MasterCard válida",
                      },
                    })}
                    className="border p-4 w-full text-lg rounded-lg placeholder:text-gray-500 pr-14"
                  />
                  {cardType && (
                    <img
                      src={
                        cardType === "visa"
                          ? "/assets/visa.png"
                          : "/assets/mastercard.png"
                      }
                      alt={cardType}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8"
                    />
                  )}
                </div>

                {/* Fecha de expiración */}
                <div className="flex gap-4">
                  <input
                    placeholder="MM"
                    maxLength={2}
                    inputMode="numeric"
                    {...register("expMonth", {
                      required: "Mes requerido",
                      validate: (value) =>
                        (Number(value) >= 1 && Number(value) <= 12) ||
                        "Mes inválido",
                    })}
                    className="border p-4 w-full text-lg rounded-lg"
                  />
                  <input
                    placeholder="YY"
                    maxLength={2}
                    inputMode="numeric"
                    {...register("expYear", {
                      required: "Año requerido",
                      validate: (value) =>
                        Number(value) >= 24 || "Año inválido (mínimo 24)",
                    })}
                    className="border p-4 w-full text-lg rounded-lg"
                  />
                </div>

                <div className="relative">
                  <input
                    placeholder="CVC"
                    type={showCvc ? "text" : "password"}
                    maxLength={4}
                    inputMode="numeric"
                    {...register("cvc", {
                      required: "CVC requerido",
                      pattern: {
                        value: /^\d{3,4}$/,
                        message: "Debe ser de 3 o 4 dígitos",
                      },
                    })}
                    className="border p-4 w-full text-lg rounded-lg pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvc((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                    tabIndex={-1}
                  >
                    {showCvc ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  {errors.cvc && (
                    <p className="text-red-500 text-base mt-1">
                      {errors.cvc.message}
                    </p>
                  )}
                </div>

                {/* Titular */}
                <input
                  placeholder="Nombre titular"
                  {...register("cardHolder", {
                    required: "Nombre requerido",
                    minLength: {
                      value: 5,
                      message: "Debe tener al menos 5 caracteres",
                    },
                  })}
                  className="border p-4 w-full text-lg rounded-lg"
                />
                {errors.cardHolder && (
                  <p className="text-red-500 text-base">
                    {errors.cardHolder.message}
                  </p>
                )}

                {/* Cuotas */}
                <select
                  {...register("installments", {
                    required: "Selecciona el número de cuotas",
                  })}
                  className="border p-4 w-full text-lg rounded-lg"
                >
                  <option value="">Número de cuotas</option>
                  <option value="1">1 cuota</option>
                  <option value="3">3 cuotas</option>
                  <option value="6">6 cuotas</option>
                </select>
                {errors.installments && (
                  <p className="text-red-500 text-base">
                    {errors.installments.message}
                  </p>
                )}

                {/* Botón comprar */}
                <button
                  type="submit"
                  className="mt-6 w-full bg-[#d99a76] hover:bg-[#E9B99A] text-white text-lg py-3 rounded-lg font-semibold transition-all"
                >
                  COMPRAR AHORA
                </button>

                {/* Botón seguir comprando */}
                <button
                  onClick={handleContinueShopping}
                  type="button"
                  className="mt-3 w-full bg-white text-[#d99a76] border border-[#d99a76] py-2 rounded font-semibold hover:bg-pink-50 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5 text-[#d99a76]" />
                  <span>Seguir comprando</span>
                </button>
              </form>
            </section>
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
              Subtotal:{" "}
              <span className="float-right font-semibold">
                $ {formatPrice(total || 0)}
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
                <input type="checkbox" className="mt-1" />
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
          message="¡Tu pago fue exitoso! 🎉"
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
