"use client";

import { ADD_POINTS_MUTATION } from "@/app/graph/mutations";
import { useMutation } from "@apollo/client";
import React, { useEffect, useState } from "react";


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



// Points Management Modal Component
export const PointsManagementModal: React.FC<{
    user: User;
    isOpen: boolean;
    pointSettingsData: any;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ user, isOpen, onClose, onSuccess, pointSettingsData }) => {
    const [purchaseAmount, setPurchaseAmount] = useState<number>(0);
    const [description, setDescription] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [calculatedPoints, setCalculatedPoints] = useState<number>(0);

    const [addPoints] = useMutation(ADD_POINTS_MUTATION, {
        refetchQueries: ['FETCH_ALL_USERS'],
        awaitRefetchQueries: true
    });
    // Add this helper function
    const formatAmount = (value: number): string => {
        const amount = value * 1000;
        return `${amount.toLocaleString()} DT`;
    };

    // Update the useEffect for points calculation
    useEffect(() => {
        if (pointSettingsData?.getPointSettings) {
            const settings = pointSettingsData.getPointSettings;
            if (settings.isActive) {
                const purchaseAmountInDT = purchaseAmount * 100;
                const points = purchaseAmount === 0 ? 0 : Math.floor(purchaseAmountInDT * settings.conversionRate);
                setCalculatedPoints(points);
            }
        }
    }, [purchaseAmount, pointSettingsData]);

    // Update the input section to allow zero
    <input
        type="number"
        value={purchaseAmount}
        onChange={(e) => setPurchaseAmount(Number(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        min="0"
        step="1"
        disabled={isLoading}
    />

    // Update the handleAddPoints function
    const handleAddPoints = async () => {
        if (purchaseAmount < 0 || calculatedPoints < 0) return;

        setIsLoading(true);
        try {
            await addPoints({
                variables: {
                    userId: user.id,
                    points: calculatedPoints,
                    PointType: 'ADMIN_ADDED',
                    description: description || `Vous avez gagné des points pour un achat de ${formatAmount(purchaseAmount)}`,
                    purchaseAmount: purchaseAmount * 1000
                }
            });
            onSuccess();
            onClose();
            setPurchaseAmount(0);
            setDescription("");
            setCalculatedPoints(0);
        } catch (error) {
            console.error("Error adding points:", error);
            alert("Failed to Add Points. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetModal = () => {
        setPurchaseAmount(0);
        setDescription("");
        setCalculatedPoints(0);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    if (!isOpen) return null;

    const pointSettings = pointSettingsData?.getPointSettings;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Add Points - {user.fullName}</h2>
                <p className="text-gray-600 mb-4">Current Points: {user.points}</p>

                {pointSettings?.isActive ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Purchase Amount (DT)
                            </label>
                            <input
                                type="number"
                                value={purchaseAmount}
                                onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="1"
                                step="0.01"
                                disabled={isLoading}
                            />
                        </div>

                        {calculatedPoints > 0 && (
                            <div className="bg-blue-50 p-3 rounded-md">
                                <p className="text-sm text-blue-700">
                                    Points to be earned: <span className="font-bold">{calculatedPoints}</span>
                                    <br />
                                    <span className="text-xs">
                                        (Rate: {pointSettings.conversionRate} points per DT)
                                    </span>
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Additional purchase details..."
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={handleAddPoints}
                                disabled={isLoading || purchaseAmount <= 0 || calculatedPoints <= 0}
                                className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Processing...' : 'Add Points'}
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
                ) : (
                    <div className="text-center py-4">
                        <p className="text-red-500">The points system is currently disabled.</p>
                    </div>
                )}
            </div>
        </div>
    );
};