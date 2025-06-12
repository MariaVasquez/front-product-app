import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import {  useState } from "react";
import { type CardTokenRequest } from "../api/wompi-service";
import type { UserResponse } from "../models/user.model";
import type { OrderRequest } from "../models/order-request.model";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/cart-context";
import { useForm } from "react-hook-form";
import { LoginModal } from "./LoginModal";
import { SuccessModal } from "./SuccessModal";
import { ErrorModal } from "./ErrorModal";
import { usePaymentFlow } from "../hooks/use-payment-flow";

interface PaymentData {
  user: UserResponse;
  ivaAmount:number;
  totalAmount: number;
  termsConditions: boolean;
  setTermsError: (message: string | null) => void;
}

type CardForm = {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
  installments: string;
};

export const PaymentForm: React.FC<PaymentData> = ({
  user,
  ivaAmount,
  totalAmount,
  termsConditions,
  setTermsError
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCvc, setShowCvc] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardType, setCardType] = useState<"visa" | "mastercard" | null>(null);
   const orderInfo = location.state as OrderRequest;
  const { dispatch } = useCart();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CardForm>();
  const { isLoading, isSuccess, errorMessage,setErrorMessage, handlePayment, resetState } =
    usePaymentFlow();

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

  const handlePay = async (dataCard: CardForm) => {

    
    if (!termsConditions) {
      setTermsError("Debes aceptar los Términos y Condiciones.");
      return;
    }

    if (!user || typeof user.id !== "number") {
      setErrorMessage("Usuario inválido.");
      return;
    }

    const cardRequest: CardTokenRequest = {
      card_holder: dataCard.cardHolder,
      cvc: dataCard.cvc,
      exp_month: dataCard.expMonth,
      exp_year: dataCard.expYear,
      number: dataCard.number,
    };

    await handlePayment(user,ivaAmount, totalAmount, cardRequest, orderInfo,dispatch);
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] flex flex-col items-center justify-center space-y-4 transition-opacity">
          <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          <p className="text-white text-lg font-light">
            Estamos procesando la información...
          </p>
        </div>
      )}
      <section className="bg-pink-50 p-6 rounded-lg shadow">
        <h2 className="font-semibold text-xl mb-4">Pago</h2>
        <form onSubmit={handleSubmit(handlePay)} className="space-y-5 text-lg">
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
                  (Number(value) >= 1 && Number(value) <= 12) || "Mes inválido",
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
              autoComplete="cc-csc"
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

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {errorMessage  && (
        <ErrorModal message={errorMessage} onClose={resetState} />
      )}
      {isSuccess && (
        <SuccessModal
          message="🎉 ¡Estamos procesando tu pago!"
          onClose={resetState}
        />
      )}
    </>
  );
};
