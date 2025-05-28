export interface WompiTransaction {
  amountInCents: number;
  currency: string;
  customerEmail: string;
  paymentToken: string;
  redirectUrl: string;
  installments: number;
}

export interface InitiatePaymentRequest {
  orderId: number;
  wompi: WompiTransaction;
}