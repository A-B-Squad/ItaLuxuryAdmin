"use client";

import React from "react";


// TypeScript Interfaces
interface Review {
    productId: string;
    rating: number;
    product: {
        name: string;
        reference: string;
    };
}

interface ContactUs {
    id: string;
    subject: string;
    document: string;
    message: string;
}

interface Package {
    id: string;
    customId: string;
    status: string;
}

interface Checkout {
    id: string;
    GovernoTaux: {
        name: string;
    };
    package: Package[];
}

interface Voucher {
    id: string;
    code: string;
    amount: number;
    isUsed: boolean;
    createdAt: string;
    expiresAt: string;
    usedAt: string | null;
    userId: string;
    checkoutId: string | null;
}
interface ProductInCheckout {
    product: {
        name: string;
    };
    productQuantity: number;
    price: number;
}

interface Checkout {
    id: string;
    productInCheckout: ProductInCheckout[];
    total: number;
    Governorate: {
        name: string;
    };
    package: Package[];
}
interface PointTransaction {
    id: string;
    amount: number;
    type: 'EARNED' | 'EXPIRED' | 'ADJUSTMENT' | 'ADMIN_ADDED';
    description: string;
    createdAt: string;
    userId: string;
    checkoutId: string | null;
  }

interface User {
    id: string;
    fullName: string;
    email: string;
    number: string;
    points: number;
    reviews: Review[];
    ContactUs: ContactUs[];
    checkout: Checkout[];
    Voucher: Voucher[];
    pointTransactions: PointTransaction[];
}


// User Info Section Component
export const UserInfoSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}> = ({ title, icon, content }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-[#202939] text-white px-4 py-3 flex items-center">
                <div className="mr-3">{icon}</div>
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <div className="p-4">{content}</div>
        </div>
    );
};