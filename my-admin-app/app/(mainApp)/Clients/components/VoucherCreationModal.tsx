"use client";

import { GENERATE_VOUCHER_MUTATION, USE_VOUCHER_MUTATION } from "@/app/graph/mutations";
import { FETCH_ALL_USERS } from "@/app/graph/queries";
import { useMutation } from "@apollo/client";
import { useToast } from "@/components/ui/use-toast";
import React, { useState } from "react";

interface User {
    id: string;
    fullName: string;
    email: string;
    number: string;
    points: number;
    reviews: any[];
    ContactUs: any[];
    checkout: any[];
    Voucher: any[];
    pointTransactions: any[];
}

// ============ VOUCHER CREATION MODAL ============
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
    const { toast } = useToast();

    const [generateVoucher] = useMutation(GENERATE_VOUCHER_MUTATION, {
        refetchQueries: [
            { query: FETCH_ALL_USERS },
            'FETCH_ALL_USERS'
        ],
        awaitRefetchQueries: true,
        // ADDED: Cache update
        update: (cache) => {
            cache.evict({ 
                id: `User:${user.id}`,
                fieldName: 'Voucher'
            });
            cache.evict({ 
                id: `User:${user.id}`,
                fieldName: 'points'
            });
            cache.gc();
        }
    });

    const handleCreateVoucher = async () => {
        const conversionRate = pointSettingsData?.getPointSettings.reimbursementRate || 0.01;
        const minVoucherAmount = pointSettingsData?.getPointSettings.loyaltyRewardValue || 0;
        const userPoints = user.points;
        const maxAmount = Math.round(userPoints * conversionRate * 100) / 100; 

        if (voucherAmount <= 0 || !expiresAt) {
            toast({
                title: "Erreur de validation",
                description: "Veuillez saisir un montant et une date d'expiration valides.",
                variant: "destructive",
            });
            return;
        }

        if (voucherAmount < minVoucherAmount) {
            toast({
                title: "Montant insuffisant",
                description: `Le montant minimum pour créer un bon est de ${minVoucherAmount} DT.`,
                variant: "destructive",
            });
            return;
        }

        if (voucherAmount > maxAmount) {
            toast({
                title: "Points insuffisants",
                description: `Vous pouvez uniquement créer un bon de maximum ${maxAmount.toFixed(2)} DT avec vos ${userPoints.toLocaleString()} points.`,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await generateVoucher({
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

            await onSuccess(); // IMPORTANT: Wait for success callback
            onClose();
            resetModal();
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

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().slice(0, 16);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Créer un bon - {user.fullName}</h2>
                <p className="text-sm text-gray-600 mb-2">
                    Points disponibles: <span className="font-semibold">{user.points.toLocaleString()}</span>
                </p>
      
                <p className="text-sm text-orange-600 mb-4">
                    Montant minimum: <span className="font-bold">{pointSettingsData?.getPointSettings.loyaltyRewardValue || 0} DT</span>
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Montant du bon (DT)
                        </label>
                        <input
                            type="number"
                            value={voucherAmount}
                            onChange={(e) => setVoucherAmount(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min={pointSettingsData?.getPointSettings.loyaltyRewardValue || 1}
                            step="0.01"
                            placeholder={`Minimum ${pointSettingsData?.getPointSettings.loyaltyRewardValue || 0} DT`}
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
                            {isLoading ? 'Création en cours...' : 'Créer le bon'}
                        </button>
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium transition-colors disabled:bg-gray-300"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};