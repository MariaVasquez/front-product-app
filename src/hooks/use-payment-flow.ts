import { useState, useRef } from "react";
import { WompiService, type CardTokenRequest } from "../api/wompi-service";
import { OrderService } from "../api/orders-service";
import { PaymentService } from "../api/payments-service";
import type { InitiatePaymentRequest } from "../models/payment-initial-request.model";
import type { OrderRequest } from "../models/order-request.model";
import type { UserResponse } from "../models/user.model";
import type { Dispatch, SetStateAction } from "react";
import type { Action } from "../context/cart-context";

interface UsePaymentFlowResult {
  isLoading: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  handlePayment: (
    user: UserResponse,
    ivaAmount: number,
    totalAmount: number,
    card: CardTokenRequest,
    orderInfo: OrderRequest,
    dispatch: Dispatch<Action>
  ) => Promise<void>;
  resetState: () => void;
}


export const usePaymentFlow = (): UsePaymentFlowResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wompiService = useRef(new WompiService()).current;
  const paymentService = useRef(new PaymentService()).current;
  const orderService = useRef(new OrderService()).current;

  const handlePayment = async (
    user: UserResponse,
    ivaAmount: number,
    totalAmount: number,
    card: CardTokenRequest,
    orderInfo: OrderRequest,
    dispatch: Dispatch<Action>
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const token = await wompiService.tokenizeCard(card);

      if (!token) {
        throw new Error("Token inválido");
      }

      const order = await orderService.saveOrder({
        userId: user.id,
        items: orderInfo.items,
      });

      if (!order.data?.id) {
        throw new Error("No se pudo crear la orden");
      }

      const initialPaymentRequest: InitiatePaymentRequest = {
        orderId: order.data.id,
        wompi: {
          amountInCents: totalAmount,
          amountInCentsIva: ivaAmount,
          currency: "COP",
          installments: 1,
          redirectUrl: "https://docs.wompi.co/docs/colombia/js/",
          customerEmail: user.email,
          paymentToken: token,
        },
      };

      const paymentResult = await paymentService.initiatePayment(initialPaymentRequest);

      if (paymentResult.message !== "Ok") {
        throw new Error("Error en el pago");
      }

      if (paymentResult.message === "Ok") {
        setIsSuccess(true);
        dispatch({ type: "CLEAR_CART" });
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Hubo un problema al procesar tu pago. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setIsSuccess(false);
    setErrorMessage(null);
  };

  return {
    isLoading,
    isSuccess,
    errorMessage,
    setErrorMessage,
    handlePayment,
    resetState,
  };
};