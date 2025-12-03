import React from 'react';
import { BiInfoCircle } from 'react-icons/bi';
import { BsCheckCircle } from 'react-icons/bs';
import { BundleFormData } from './bundle.types';

interface BundleConditionsProps {
    formData: BundleFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onArrayChange: (name: keyof BundleFormData, value: string) => void;
}

const BundleConditions: React.FC<BundleConditionsProps> = ({ formData, onChange, onArrayChange }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <BiInfoCircle className="text-blue-600" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-900">Conditions</h3>
                    <p className="text-sm text-gray-600">Définir quand ce pack doit être appliqué</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Montant d'Achat Min (TND)</label>
                    <input
                        type="number"
                        name="minPurchaseAmount"
                        value={formData.minPurchaseAmount || ''}
                        onChange={onChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                        placeholder="0.00"
                        step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Valeur minimale du panier requise</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Quantité Min</label>
                    <input
                        type="number"
                        name="minQuantity"
                        value={formData.minQuantity || ''}
                        onChange={onChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                        placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Nombre minimum d'articles requis</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Références Produits Requis</label>
                <input
                    type="text"
                    value={formData.requiredProductRefs.join(', ')}
                    onChange={(e) => onArrayChange('requiredProductRefs', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    placeholder="REF001, REF002"
                />
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-2">
                    <BsCheckCircle className="text-green-500" />
                    Tous les produits listés doivent être dans le panier
                </p>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">N'importe Quelles Références Produits</label>
                <input
                    type="text"
                    value={formData.anyProductRefs.join(', ')}
                    onChange={(e) => onArrayChange('anyProductRefs', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    placeholder="REF001, REF002, REF003"
                />
                <p className="text-xs text-gray-600 mt-2">Au moins la quantité minimale de ces produits</p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                    type="checkbox"
                    id="requireAllProducts"
                    name="requireAllProducts"
                    checked={formData.requireAllProducts}
                    onChange={onChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="requireAllProducts" className="text-sm font-semibold text-gray-800 cursor-pointer">
                    Exiger TOUS les produits spécifiés (pas seulement la quantité minimale)
                </label>
            </div>
        </div>
    );
};

export default BundleConditions;