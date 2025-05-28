import type { CardTokenResponse } from "../models/cart-token-response.model";

export interface CardTokenRequest {
    number: string;
    exp_month: string;
    exp_year: string;
    cvc: string;
    card_holder: string;
}

export class WompiService {
    private baseUrl = import.meta.env.VITE_WOMPI_API_URL;
    private publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

    async tokenizeCard(card: CardTokenRequest): Promise<string> {
        const response = await fetch(`${this.baseUrl}/tokens/cards`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.publicKey}`,
            },
            body: JSON.stringify(card),
        });

        const result: CardTokenResponse = await response.json();
        if (result.status === "CREATED") {
            return result.data.id;
        }

        throw new Error("Error al tokenizar tarjeta: " + JSON.stringify(result));
    }

    async getAcceptanceToken(): Promise<string> {
        const response = await fetch(`${this.baseUrl}/merchants/${this.publicKey}`);
        const result = await response.json();
        return result.data.presigned_acceptance.acceptance_token;
    }
}