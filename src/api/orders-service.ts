import axios, { type AxiosInstance } from 'axios';
import type { OrderRequest } from '../models/order-request.model';
import type { OrderResponse } from '../models/order-response.model';
import type { Result } from '../models/result.model';

export class OrderService {
    private http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL
        });
    }

    async saveOrder(order: OrderRequest): Promise<Result<OrderResponse>> {
        const response = await this.http.post<Result<OrderResponse>>('/orders', order);
        return response.data;
    }

}