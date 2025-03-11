
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
  userId: string | null;
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
    productDiscounts?: any[];
  };
}

export interface Checkout {
  id: string;
  User?: User;
  guestEmail?: string;
  freeDelivery: boolean;
  userId?: string;
  phone: string[];
  userName: string;
  address: string;
  productInCheckout: ProductInCheckout[];
  total: number;
  Governorate: {
    id: string;
    name: string
  };
  manualDiscount: number;
  Coupons: { discount: number };
  paymentMethod: string;
}

export interface Order {
  id: string;
  comments: string;
  status: string;
  customId: string;
  createdAt: string;
  Checkout: Checkout;
}



export interface Package {
  id: string;
  checkoutId: string;
  status: string;
  createdAt: string;
  Checkout: Checkout;
}


export interface StatsPeriod {
  count: number;
  total: number;
}

export interface DetailedStats {
  today: StatsPeriod;
  thisWeek: StatsPeriod;
  thisMonth: StatsPeriod;
  thisYear: StatsPeriod;
  byStatus: Record<string, number>;
}

export interface PackageData {
  getAllPackages: Package[];
}

export interface StatsPeriod {
  count: number;
  total: number;
}

export interface DetailedStats {
  today: StatsPeriod;
  thisWeek: StatsPeriod;
  thisMonth: StatsPeriod;
  thisYear: StatsPeriod;
  byStatus: Record<string, number>;
}

export interface SimpleStats {
  orders: number[];
  earnings: number[];
}