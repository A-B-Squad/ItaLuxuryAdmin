"use client";

import { GENERATE_VOUCHER_MUTATION } from "@/app/graph/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { useToast } from "@/components/ui/use-toast";
import React, { useState } from "react";
import { GET_POINT_SETTINGS } from "@/app/graph/queries";

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



// Voucher Creation Modal Component
export const VoucherCreationModal: React.FC<{
    user: User;
    isOpen: boolean;
    pointSettingsData: any;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ user, isOpen, onClose, onSuccess, pointSettingsData }) => {
    const [voucherAmount, setVoucherAmount] = useState<number>(0);
    const [expiresAt, setExpiresAt] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const [generateVoucher] = useMutation(GENERATE_VOUCHER_MUTATION, {
        refetchQueries: [
            'FETCH_ALL_USERS',
        ],
        awaitRefetchQueries: true,
        onCompleted: () => {
            onSuccess();
            toast({
                title: "Voucher created successfully",
                description: "The voucher has been created successfully",
            });
            window.location.reload();
        },
    });
    const { toast } = useToast();

    const handleCreateVoucher = async () => {
        const conversionRate = pointSettingsData?.getPointSettings.conversionRate || 0.01;
        const userPoints = user.points;
        const maxAmount = Math.floor(userPoints * conversionRate);

        if (voucherAmount > maxAmount) {
            toast({
                title: "Points insuffisants",
                description: `Vous pouvez uniquement ajouter un bon de ${maxAmount} DT, car vous n’avez pas assez de points.`,
                variant: "destructive",
            });
            return;
        }

        if (voucherAmount <= 0 || !expiresAt) {
            toast({
                title: "Erreur de validation",
                description: "Veuillez saisir un montant et une date d’expiration valides.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await generateVoucher({
                variables: {
                    input: {
                        userId: user.id,
                        amount: voucherAmount,
                        expiresAt: expiresAt
                    }
                }
            });

            toast({
                title: "Bon créé avec succès",
                description: `${voucherAmount} DT ont été attribués à ${user.fullName}`,
                variant: "default",
            });

            onSuccess();
            onClose();
            setVoucherAmount(0);
            setExpiresAt("");
        } catch (error) {
            toast({
                title: "Erreur lors de la création",
                description: `Impossible de créer le bon. ${error}`,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };


    const resetModal = () => {
        setVoucherAmount(0);
        setExpiresAt("");
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    // Get minimum date (current date + 1 day)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().slice(0, 16);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Créer un bon - {user.fullName}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        Montant du bon
                        </label>
                        <input
                            type="number"
                            value={voucherAmount}
                            onChange={(e) => setVoucherAmount(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            step="0.01"
                            placeholder="Saisir le montant du bon
"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expire le
                        </label>
                        <input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min={getMinDate()}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={handleCreateVoucher}
                            disabled={isLoading || voucherAmount <= 0 || !expiresAt}
                            className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Créer le bon...' : 'Création en cours...'}
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