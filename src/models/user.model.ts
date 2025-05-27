export interface Address {
  addressLine1: string;
  city: string;
  region: string;
  country: string;
  addressLine2?: string;
  postalCode?: string;
  isActive?: boolean;
}

export interface UserRequest {
  name: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  typeDocument: string;
  documentNumber: string;
  address: Address[];
}

export interface UserResponse extends UserRequest {
  id: number;
}