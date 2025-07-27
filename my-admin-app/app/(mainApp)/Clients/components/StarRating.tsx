"use client";

import React from "react";
import {
    FaRegStar,
    FaStar,
    FaStarHalfAlt
} from "react-icons/fa";


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

interface FetchAllUsersData {
    fetchAllUsers: User[];
}


// Star Rating Component
export const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;

    for (let i = 1; i <= 5; i++) {
        if (i <= roundedRating) {
            stars.push(<FaStar key={i} className="text-yellow-400" />);
        } else if (i - 0.5 === roundedRating) {
            stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
        } else {
            stars.push(<FaRegStar key={i} className="text-yellow-400" />);
        }
    }

    return <div className="flex">{stars}</div>;
};