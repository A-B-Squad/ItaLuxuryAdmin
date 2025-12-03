"use client";

import { useMutation } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { convertToMillimes } from "../../Helpers/_convertToMillimes";
import { formatAmount } from "../../Helpers/_formatAmount";
import { MANAGE_POINTS_MUTATION } from "@/app/graph/mutations";
import { FETCH_ALL_USERS } from "@/app/graph/queries";
import { printReceipt } from "./ReceiptPrinter";

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
    const [showPrintOption, setShowPrintOption] = useState(false);
    const [lastTransaction, setLastTransaction] = useState<any>(null);

    const [managePoints] = useMutation(MANAGE_POINTS_MUTATION, {
        refetchQueries: [
            { query: FETCH_ALL_USERS },
            'FETCH_ALL_USERS'
        ],
        awaitRefetchQueries: true,
        update: (cache, { data }) => {
            if (data?.manageUserPoints) {
                cache.evict({ 
                    id: `User:${user.id}`,
                    fieldName: 'points'
                });
                cache.evict({ 
                    id: `User:${user.id}`,
                    fieldName: 'pointTransactions'
                });
                cache.gc();
            }
        },
        optimisticResponse: {
            manageUserPoints: "Points managed successfully"
        }
    });

    useEffect(() => {
        if (pointSettingsData?.getPointSettings) {
            const settings = pointSettingsData.getPointSettings;
            if (settings.isActive && purchaseAmount > 0) {
                const purchaseAmountInMillimes = convertToMillimes(purchaseAmount);
                const points = Math.floor(purchaseAmountInMillimes * settings.conversionRate);
                setCalculatedPoints(points);
            } else {
                setCalculatedPoints(0);
            }
        }
    }, [purchaseAmount, pointSettingsData]);

    const handlePrintReceipt = () => {
        if (!lastTransaction) return;

        const receiptData = {
            brandName: "ITA LUXURY",
            brandLogo: "/images/LOGO.png", 
            userName: user.fullName,
            userEmail: user.email,
            userPhone: user.number,
            pointsAdded: lastTransaction.pointsAdded,
            newBalance: lastTransaction.newBalance,
            purchaseAmount: lastTransaction.purchaseAmount,
            description: lastTransaction.description,
            date: new Date().toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            transactionId: `TXN${Date.now().toString().slice(-8)}`
        };

        printReceipt(receiptData);
    };

    const handleAddPoints = async () => {
        if (purchaseAmount <= 0 || calculatedPoints <= 0) {
            return;
        }

        setIsLoading(true);
        try {
            await managePoints({
                variables: {
                    input: {
                        userId: user.id,
                        amount: calculatedPoints, 
                        type: 'EARNED', 
                        description: description ||
                            `Achat en magasin de ${formatAmount(purchaseAmount)} - ${calculatedPoints} points gagnés`
                    }
                }
            });

            // Store transaction data for receipt
            setLastTransaction({
                pointsAdded: calculatedPoints,
                newBalance: user.points + calculatedPoints,
                purchaseAmount: formatAmount(purchaseAmount),
                description: description || `Achat en magasin de ${formatAmount(purchaseAmount)}`
            });

            // Show print option
            setShowPrintOption(true);

            await onSuccess();
        } catch (error) {
            console.error("Error adding points:", error);
            alert("Failed to Add Points. Please try again.");
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const resetModal = () => {
        setPurchaseAmount(0);
        setDescription("");
        setCalculatedPoints(0);
        setShowPrintOption(false);
        setLastTransaction(null);
    };

    if (!isOpen) return null;

    const pointSettings = pointSettingsData?.getPointSettings;

    // Show success screen with print option
    if (showPrintOption && lastTransaction) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold mb-4 text-green-600">
                            Points Ajoutés avec Succès!
                        </h2>
                        
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-6">
                            <div className="text-4xl font-bold text-green-600 mb-2">
                                +{lastTransaction.pointsAdded.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 mb-3">points gagnés</div>
                            <div className="border-t border-gray-300 pt-3">
                                <div className="text-lg font-semibold">
                                    Nouveau solde: {lastTransaction.newBalance.toLocaleString()} points
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handlePrintReceipt}
                                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium flex items-center justify-center space-x-2 transition-colors"
                            >
                                <span>🖨️</span>
                                <span>Imprimer le Reçu</span>
                            </button>
                            
                            <button
                                onClick={handleClose}
                                className="w-full py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium transition-colors"
                            >
                                Terminer
                            </button>
                        </div>

                        <div className="mt-4 text-xs text-gray-500">
                            Le reçu peut être imprimé plusieurs fois
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Ajouter Points - {user.fullName}</h2>

                <div className="bg-blue-50 p-3 rounded-md mb-4">
                    <p className="text-sm text-blue-700">
                        Solde actuel: <span className="font-bold text-lg">{user.points.toLocaleString()}</span> points
                    </p>
                </div>

                {pointSettings?.isActive ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Montant d'Achat (Dinars.Millimes)
                            </label>
                            <input
                                type="number"
                                value={purchaseAmount || ''}
                                onChange={(e) => setPurchaseAmount(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="0.001"
                                placeholder="Ex: 2.500 (2 DT et 500 millimes)"
                                disabled={isLoading}
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Entrez le montant en dinars (3 décimales = millimes)
                                <br />
                                Exemple: 2.500 = 2 dinars et 500 millimes
                            </p>
                        </div>

                        {calculatedPoints > 0 && (
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-md border border-green-200">
                                <p className="text-sm font-semibold text-green-700 mb-2">
                                    Points à gagner: <span className="text-xl">+{calculatedPoints.toLocaleString()}</span>
                                </p>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p>• Montant: {formatAmount(purchaseAmount)} ({convertToMillimes(purchaseAmount).toLocaleString()} millimes)</p>
                                    <p>• Taux: {pointSettings.conversionRate} points/millime</p>
                                    <p className="font-semibold text-blue-700">• Nouveau solde: {(user.points + calculatedPoints).toLocaleString()} points</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description (Optionnelle)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Ex: Achat vêtements, Référence ticket #12345..."
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={handleAddPoints}
                                disabled={isLoading || purchaseAmount <= 0 || calculatedPoints <= 0}
                                className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Traitement...' : '✓ Valider l\'Achat'}
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
                ) : (
                    <div className="text-center py-4">
                        <p className="text-red-500">The points system is currently disabled.</p>
                        <button
                            onClick={handleClose}
                            className="mt-4 py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};