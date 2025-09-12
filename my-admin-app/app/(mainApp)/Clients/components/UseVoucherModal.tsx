"use client";

import { USE_VOUCHER_MUTATION } from "@/app/graph/mutations";
import { useMutation } from "@apollo/client";
import React, { useState } from "react";


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




export const UseVoucherModal: React.FC<{
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ user, isOpen, onClose, onSuccess }) => {
    const [voucherCode, setVoucherCode] = useState<string>("");
    const [isInStore, setIsInStore] = useState<boolean>(false);
    const [amountUsed, setAmountUsed] = useState<number>(0);
    const [checkoutId, setCheckoutId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const [executeUseVoucher] = useMutation(USE_VOUCHER_MUTATION, {
        refetchQueries: [
            'FETCH_ALL_USERS',
        ],
        awaitRefetchQueries: true,

    });

    const handleUseVoucher = async () => {
        if (!voucherCode.trim()) return;

        setIsLoading(true);
        try {
            const variables: any = {
                input: {
                    voucherCode: voucherCode.trim(),
                    isInStore,
                    expiresAt: new Date().toISOString()
                }
            };

            if (isInStore && amountUsed > 0) {
                variables.input.amountUsed = amountUsed;
            }

            if (!isInStore && checkoutId.trim()) {
                variables.input.checkoutId = checkoutId.trim();
            }


            const { data } = await executeUseVoucher({
                variables
            });

            if (data?.useVoucher?.success) {
                alert(data.useVoucher.message);
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error("Error using voucher:", error);
            alert("Failed to Use Voucher. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetModal = () => {
        setVoucherCode("");
        setIsInStore(false);
        setAmountUsed(0);
        setCheckoutId("");
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Use Voucher - {user.fullName}</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Voucher Code
                        </label>
                        <input
                            type="text"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter Voucher Code"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isInStore"
                            checked={isInStore}
                            onChange={(e) => setIsInStore(e.target.checked)}
                            className="mr-2"
                            disabled={isLoading}
                        />
                        <label htmlFor="isInStore" className="text-sm font-medium text-gray-700">
                            In-store usage
                        </label>
                    </div>

                    {isInStore && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount Used
                            </label>
                            <input
                                type="number"
                                value={amountUsed}
                                onChange={(e) => setAmountUsed(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                                placeholder="Enter Amount Used"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {!isInStore && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order ID (Optional)
                            </label>
                            <input
                                type="text"
                                value={checkoutId}
                                onChange={(e) => setCheckoutId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter order ID"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    <div className="flex space-x-4">
                        <button
                            onClick={handleUseVoucher}
                            disabled={isLoading || !voucherCode.trim()}
                            className="flex-1 py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : 'Use Voucher'}
                        </button>
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium transition-colors disabled:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};