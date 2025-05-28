export type Currency = 'COP' | 'USD' | 'EUR';

export interface InitiatePaymentResponse {
  reference: string;
  amountInCents: number;
  currency: Currency;
  customerEmail: string;
  publicKey: string;
}

export interface WompiResponse {
  transactionId: string;
  status: string;
  redirectUrl: string;
}