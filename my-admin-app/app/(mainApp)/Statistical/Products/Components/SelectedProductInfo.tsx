import React from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

// Updated interfaces to match your GraphQL response
interface Governorate {
    name: string;
}

interface Package {
    status: string;
}

interface Checkout {
    phone: string[];
    package: Package[];
    Governorate: Governorate;
}

interface ProductInCheckout {
    checkout: Checkout;
}

interface Product {
    id: string;
    name: string;
    price: number;
    purchasePrice: number;
    isVisible: boolean;
    reference: string;
    description: string;
    inventory: number;
    solde: number;
    broken: number;
    images: string[];
    createdAt: string;
    ProductInCheckout: ProductInCheckout[];
}

type OrderStatus =
    | "PAYED_AND_DELIVERED"
    | "PAYED_NOT_DELIVERED"
    | "CANCELLED"
    | "PAYMENT_REFUSED"
    | "REFUNDED"
    | "CONFIRMED"
    | "TRANSFER_TO_DELIVERY_COMPANY"
    | "PROCESSING"
    | "NO_STATUS";

type GovStats = Record<OrderStatus, number> & {
    total: number;
};

interface SelectedProductInfoProps {
    selectedProduct: Product;
    onClearSelection: () => void;
    dateRange?: DateRange;
}

const SelectedProductInfo: React.FC<SelectedProductInfoProps> = ({
    selectedProduct,
    onClearSelection,
    dateRange,
}) => {
    // Process governorate data with all order status types
    const governorateStats = selectedProduct.ProductInCheckout.reduce(
        (acc: Record<string, GovStats>, checkout: ProductInCheckout) => {
            const govName = checkout.checkout.Governorate.name.trim();
            const packages = checkout.checkout.package;

            if (!acc[govName]) {
                acc[govName] = {
                    total: 0,
                    PAYED_AND_DELIVERED: 0,
                    PAYED_NOT_DELIVERED: 0,
                    CANCELLED: 0,
                    PAYMENT_REFUSED: 0,
                    REFUNDED: 0,
                    CONFIRMED: 0,
                    TRANSFER_TO_DELIVERY_COMPANY: 0,
                    PROCESSING: 0,
                    NO_STATUS: 0,
                };
            }

            acc[govName].total += 1;

            if (packages.length === 0) {
                acc[govName].NO_STATUS += 1;
            } else {
                const status = packages[0].status as OrderStatus;
                if (status in acc[govName]) {
                    acc[govName][status] += 1;
                } else {
                    acc[govName].NO_STATUS += 1;
                }
            }

            return acc;
        },
        {} as Record<string, GovStats>
    );

    const sortedGovernorates = Object.entries(governorateStats)
        .sort(([, a], [, b]) => b.total - a.total);

    const totalPurchases = selectedProduct.ProductInCheckout.length;

    // Calculate overall statistics for all statuses
    const overallStats: Record<OrderStatus, number> = {
        PAYED_AND_DELIVERED: 0,
        PAYED_NOT_DELIVERED: 0,
        CANCELLED: 0,
        PAYMENT_REFUSED: 0,
        REFUNDED: 0,
        CONFIRMED: 0,
        TRANSFER_TO_DELIVERY_COMPANY: 0,
        PROCESSING: 0,
        NO_STATUS: 0,
    };

    Object.values(governorateStats).forEach((gov: GovStats) => {
        (Object.keys(overallStats) as OrderStatus[]).forEach(status => {
            overallStats[status] += gov[status] || 0;
        });
    });

    const getStatusConfig = (status: OrderStatus) => {
        const configs: Record<
            OrderStatus,
            { color: string; icon: string; label: string }
        > = {
            PAYED_AND_DELIVERED: { color: "bg-green-50 text-green-700", icon: "✅", label: "Livrés" },
            PAYED_NOT_DELIVERED: { color: "bg-blue-50 text-blue-700", icon: "💳", label: "Payés en ligne" },
            CANCELLED: { color: "bg-red-50 text-red-700", icon: "❌", label: "Annulés" },
            PAYMENT_REFUSED: { color: "bg-orange-50 text-orange-700", icon: "⚠️", label: "Refusés en ligne" },
            REFUNDED: { color: "bg-purple-50 text-purple-700", icon: "💸", label: "Remboursés" },
            CONFIRMED: { color: "bg-emerald-50 text-emerald-700", icon: "✓", label: "Confirmés" },
            TRANSFER_TO_DELIVERY_COMPANY: { color: "bg-yellow-50 text-yellow-700", icon: "🚚", label: "En livraison" },
            PROCESSING: { color: "bg-indigo-50 text-indigo-700", icon: "⚙️", label: "En traitement" },
            NO_STATUS: { color: "bg-gray-50 text-gray-700", icon: "⏳", label: "En attente" },
        };
        return configs[status];
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-md border-l-4 border-l-blue-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Analyse Produit</h3>
                        <p className="text-gray-600 text-xs">
                            Statuts des commandes par gouvernorat
                            {dateRange && dateRange.from && dateRange.to && (
                                <span className="block text-blue-600 font-medium mt-1">
                                    {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClearSelection}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    title="Fermer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Product Info */}
            <div className="bg-white p-3 rounded-lg mb-3">
                <h4 className="font-medium text-gray-800 mb-2 text-sm truncate" title={selectedProduct.name}>
                    {selectedProduct.name}
                </h4>
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>Réf: <strong>{selectedProduct.reference}</strong></span>
                    <span>
                        Total: <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{totalPurchases}</span>
                        {dateRange && dateRange.from && dateRange.to && (
                            <span className="ml-2 text-blue-600">(période sélectionnée)</span>
                        )}
                    </span>
                </div>
            </div>

            {/* Date Range Indicator */}
            {dateRange && dateRange.from && dateRange.to && (
                <div className="bg-blue-100 border border-blue-200 text-blue-800 p-2 rounded-lg mb-3 text-xs">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>
                            <strong>Données filtrées</strong> - Cette analyse ne montre que les commandes de la période sélectionnée
                        </span>
                    </div>
                </div>
            )}

            {/* Overall Statistics - Compact Grid */}
            <div className="bg-white p-3 rounded-lg mb-3">
                <h5 className="font-medium text-gray-800 mb-2 text-sm">Statistiques Générales</h5>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                    {(Object.entries(overallStats) as [OrderStatus, number][]).map(([status, count]) => {
                        if (count === 0) return null;
                        const config = getStatusConfig(status);
                        const percentage = ((count / totalPurchases) * 100).toFixed(1);

                        return (
                            <div key={status} className={`${config.color} p-2 rounded text-center`}>
                                <div className="text-lg mb-1">{config.icon}</div>
                                <div className="font-semibold">{count}</div>
                                <div className="text-xs opacity-75">{config.label}</div>
                                <div className="text-xs opacity-75">{percentage}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detailed Governorate Analysis - Grid Layout */}
            <div className="bg-white p-3 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-2 text-sm">Détails par Gouvernorat</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {sortedGovernorates.map(([governorate, stats], index) => {
                        const govStats = stats as GovStats;
                        const successRate = govStats.total > 0 ? ((govStats.PAYED_AND_DELIVERED / govStats.total) * 100).toFixed(1) : '0';
                        const onlinePaymentRate = govStats.total > 0 ? ((govStats.PAYED_NOT_DELIVERED / govStats.total) * 100).toFixed(1) : '0';

                        return (
                            <div key={governorate} className="border border-gray-200 rounded p-2 hover:shadow-sm transition-shadow">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <div
                                            className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                                            style={{
                                                backgroundColor: `hsl(${(index * 360) / sortedGovernorates.length}, 70%, 60%)`
                                            }}
                                        ></div>
                                        <h6 className="font-medium text-gray-800 text-xs truncate" title={governorate}>
                                            {governorate.length > 12 ? governorate.substring(0, 12) + '...' : governorate}
                                        </h6>
                                    </div>
                                    <div className="text-right text-xs flex-shrink-0">
                                        <div className="font-semibold text-gray-800">{govStats.total}</div>
                                        <div className="text-gray-500 text-xs">{((govStats.total / totalPurchases) * 100).toFixed(1)}%</div>
                                    </div>
                                </div>

                                {/* Status breakdown  */}
                                <div className="grid grid-cols-3 gap-1 text-xs mb-2">
                                    {(Object.entries(govStats) as [string, number][]).map(([status, count]) => {
                                        if (status === "total" || count === 0) return null;

                                        const config = getStatusConfig(status as OrderStatus);
                                        const percentage = ((count / govStats.total) * 100).toFixed(0);

                                        return (
                                            <div
                                                key={status}
                                                className={`${config.color} p-1 rounded text-center`}
                                                title={`${config.label}: ${count} (${percentage}%)`}
                                            >
                                                <div className="text-xs">{config.icon}</div>
                                                <div className="font-semibold text-xs">{count}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Key Metrics - Compact */}
                                <div className="text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-green-600">✅ {successRate}%</span>
                                        <span className="text-red-600">❌ {((govStats.CANCELLED / govStats.total) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-center space-x-3">
                                        {govStats.PAYED_NOT_DELIVERED > 0 && (
                                            <span className="text-blue-600">💳 {onlinePaymentRate}%</span>
                                        )}
                                        {govStats.PAYMENT_REFUSED > 0 && (
                                            <span className="text-orange-600">⚠️ {((govStats.PAYMENT_REFUSED / govStats.total) * 100).toFixed(1)}%</span>
                                        )}
                                    </div>
                                </div>

                                {/* Mini Progress Bar */}
                                <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                                    <div
                                        className="bg-green-500 h-1 rounded-full transition-all duration-300"
                                        style={{ width: `${successRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {sortedGovernorates.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Aucune donnée disponible pour cette période
                            {dateRange && dateRange.from && dateRange.to && (
                                <span className="block text-xs mt-1">
                                    Essayez d'élargir la période de dates
                                </span>
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectedProductInfo;