export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  userId: number;
  items: OrderItemRequest[];
}