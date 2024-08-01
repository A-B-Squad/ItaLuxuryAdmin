// File: src/types/index.ts

export interface User {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface GovernmentInfo {
  id: string;
  name: string;
}

export interface CustomerInfo {
  userId?: string;
  userName: string;
  familyName: string;
  email: string;
  phone1: string;
  phone2: string;
  governorate: string;
  address: string;
}

export interface ProductInCheckout {
  productQuantity: number;
  price: number;
  discountedPrice: number;
  product: {
    id: string;
    name: string;
    reference: string;
    images: string[];
    productDiscounts?: any[]; // You might want to define a more specific type for productDiscounts
  };
}



export interface Checkout {
  id: string;
  total: number;
  Coupons: { discount: number };
  userId: string;
  userName: string;
  phone: string[];
  email: string;
  address: string;
  governorateId: string;
  manualDiscount: number;
  productInCheckout: ProductInCheckout[];
  User?: User;
}

export interface Order {
  id: string;
  comments: string;
  createdAt: string;
  customId: string;
  status: string;
  Checkout: Checkout;
}
