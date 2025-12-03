import React from 'react';
import { BiEdit, BiPowerOff } from 'react-icons/bi';
import { BsTrash2, BsCheckCircle, BsXCircle } from 'react-icons/bs';
import { Bundle, BundleStatus, getBundleTypeInfo } from './bundle.types';

interface BundleCardProps {
    bundle: Bundle;
    onEdit: (bundle: Bundle) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: BundleStatus) => void;
}

const BundleCard: React.FC<BundleCardProps> = ({ bundle, onEdit, onDelete, onToggleStatus }) => {
    const typeInfo = getBundleTypeInfo(bundle.type);
    const usagePercentage = bundle.maxUsageTotal ? (bundle.currentUsage / bundle.maxUsageTotal) * 100 : 0;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                            {typeInfo.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{bundle.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${bundle.status === 'ACTIVE'
                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                                        : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700'
                                    }`}>
                                    {bundle.status === 'ACTIVE' ? <BsCheckCircle className="inline mr-1" /> : <BsXCircle className="inline mr-1" />}
                                    {bundle.status === 'ACTIVE' ? 'ACTIF' : 'INACTIF'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700">
                                    {typeInfo.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-600 mb-4">{bundle.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {bundle.minPurchaseAmount > 0 && (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3">
                                <span className="text-xs text-purple-600 font-semibold">Achat Min</span>
                                <p className="text-lg font-bold text-purple-700">{bundle.minPurchaseAmount} TND</p>
                            </div>
                        )}
                        {bundle.minQuantity > 0 && (
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3">
                                <span className="text-xs text-orange-600 font-semibold">Quantité Min</span>
                                <p className="text-lg font-bold text-orange-700">{bundle.minQuantity}</p>
                            </div>
                        )}
                        {bundle.discountPercentage > 0 && (
                            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-3">
                                <span className="text-xs text-red-600 font-semibold">Réduction</span>
                                <p className="text-lg font-bold text-red-700">{bundle.discountPercentage}%</p>
                            </div>
                        )}
                        {bundle.maxUsageTotal && (
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3">
                                <span className="text-xs text-blue-600 font-semibold">Utilisation</span>
                                <p className="text-lg font-bold text-blue-700">{bundle.currentUsage}/{bundle.maxUsageTotal}</p>
                                <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                                    <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${usagePercentage}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 ml-4">
                    <button
                        onClick={() => onToggleStatus(bundle.id, bundle.status)}
                        className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-110 ${bundle.status === 'ACTIVE'
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-600 hover:shadow-lg'
                                : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 hover:shadow-lg'
                            }`}
                        title="Changer le Statut"
                    >
                        <BiPowerOff size={20} />
                    </button>
                    <button
                        onClick={() => onEdit(bundle)}
                        className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-110"
                        title="Modifier"
                    >
                        <BiEdit size={20} />
                    </button>
                    <button
                        onClick={() => onDelete(bundle.id)}
                        className="p-3 bg-gradient-to-r from-red-100 to-rose-100 text-red-600 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-110"
                        title="Supprimer"
                    >
                        <BsTrash2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BundleCard;