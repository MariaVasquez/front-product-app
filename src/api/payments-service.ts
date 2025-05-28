import axios, { type AxiosInstance } from 'axios';
import type { InitiatePaymentRequest } from '../models/payment-initial-request.model';
import type { Result } from '../models/result.model';
import type { InitiatePaymentResponse } from '../models/payment-initial-response.model';
export class PaymentService {
    private http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL
        });
    }

    async initiatePayment(payment: InitiatePaymentRequest): Promise<Result<InitiatePaymentResponse>> {
        const response = await this.http.post<Result<InitiatePaymentResponse>>('/payments/initiate', payment);
        return response.data;
    }



}