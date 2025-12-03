"use client";

import React, { use } from "react";
import { StarRating } from "./StarRating";
import moment from "moment-timezone";


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
    Governorate: {
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
    createdAt: string
    points: number;
    reviews: Review[];
    ContactUs: ContactUs[];
    checkout: Checkout[];
    Voucher: Voucher[];
    pointTransactions: PointTransaction[];
}


// User Row Component
export const UserRow: React.FC<{ user: User; onClick: () => void }> = ({
    user,
    onClick,
}) => {
    const averageRating =
        user.reviews.length > 0
            ? user.reviews.reduce((sum, review) => sum + review.rating, 0) /
            user.reviews.length
            : 0;

    return (
        <tr
            className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
            onClick={onClick}
        >
            <td className="px-6 py-4 whitespace-nowrap">{user.fullName}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-center">{user.points}</td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                {user.checkout.length}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                {user.reviews.length}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                {moment(Number(user.createdAt)).format("DD/MM/YYYY HH:mm")}
            </td>

        </tr>
    );
};