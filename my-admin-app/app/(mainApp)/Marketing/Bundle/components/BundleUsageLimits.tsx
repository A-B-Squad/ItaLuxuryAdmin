import React from 'react';
import { BiPackage } from 'react-icons/bi';
import { BundleFormData } from './bundle.types';

interface BundleUsageLimitsProps {
    formData: BundleFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BundleUsageLimits: React.FC<BundleUsageLimitsProps> = ({ formData, onChange }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <BiPackage className="text-white" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Limites d'Utilisation</h3>
                    <p className="text-sm text-gray-500">Contrôler combien de fois ce pack peut être utilisé</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Utilisation Max par Utilisateur</label>
                    <input
                        type="number"
                        name="maxUsagePerUser"
                        value={formData.maxUsagePerUser || ''}
                        onChange={onChange}
                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all text-gray-900 font-medium"
                        placeholder="Illimité"
                    />
                    <p className="text-xs text-gray-500">Laisser vide pour un nombre illimité d'utilisations par utilisateur</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Utilisation Max Totale</label>
                    <input
                        type="number"
                        name="maxUsageTotal"
                        value={formData.maxUsageTotal || ''}
                        onChange={onChange}
                        className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all text-gray-900 font-medium"
                        placeholder="Illimité"
                    />
                    <p className="text-xs text-gray-500">Nombre total de fois que ce pack peut être utilisé</p>
                </div>
            </div>
        </div>
    );
};

export default BundleUsageLimits;