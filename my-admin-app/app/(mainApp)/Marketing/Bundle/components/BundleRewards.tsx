import React from 'react';
import { BiGift } from 'react-icons/bi';
import { BundleFormData } from './bundle.types';

interface BundleRewardsProps {
    formData: BundleFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const BundleRewards: React.FC<BundleRewardsProps> = ({ formData, onChange }) => {
    const { type } = formData;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-green-200">
                <div className="p-2 bg-green-100 rounded-lg">
                    <BiGift className="text-green-600" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-900">Récompenses</h3>
                    <p className="text-sm text-gray-600">Configurer ce que les clients reçoivent</p>
                </div>
            </div>

            {type === 'BUY_X_GET_Y_FREE' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Quantité de Produits Gratuits</label>
                        <input
                            type="number"
                            name="freeProductQuantity"
                            value={formData.freeProductQuantity || ''}
                            onChange={onChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                            placeholder="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Référence Produit Gratuit (Optionnel)</label>
                        <input
                            type="text"
                            name="freeProductRef"
                            value={formData.freeProductRef || ''}
                            onChange={onChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                            placeholder="Laisser vide pour le même produit"
                        />
                        <p className="text-xs text-gray-500 mt-1">Si vide, le produit éligible le moins cher sera gratuit</p>
                    </div>
                </div>
            )}

            {type === 'PERCENTAGE_OFF' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Pourcentage de Réduction (%)</label>
                        <input
                            type="number"
                            name="discountPercentage"
                            value={formData.discountPercentage || ''}
                            onChange={onChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                            placeholder="20"
                            step="0.01"
                            max="100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Appliquer la Réduction à</label>
                        <select
                            name="applyDiscountTo"
                            value={formData.applyDiscountTo}
                            onChange={onChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                        >
                            <option value="ALL">Tous les Produits Éligibles</option>
                            <option value="CHEAPEST">Produit le Moins Cher</option>
                            <option value="MOST_EXPENSIVE">Produit le Plus Cher</option>
                        </select>
                    </div>
                </div>
            )}

            {type === 'FIXED_AMOUNT_OFF' && (
                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Montant de Réduction (TND)</label>
                    <input
                        type="number"
                        name="discountAmount"
                        value={formData.discountAmount || ''}
                        onChange={onChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
                        placeholder="10.00"
                        step="0.01"
                    />
                </div>
            )}

            {type === 'FREE_DELIVERY' && (
                <div className="flex items-center gap-3 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <input
                        type="checkbox"
                        id="givesFreeDelivery"
                        name="givesFreeDelivery"
                        checked={formData.givesFreeDelivery}
                        onChange={onChange}
                        className="w-6 h-6 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="givesFreeDelivery" className="text-sm font-semibold text-gray-800 cursor-pointer">
                        Activer la livraison gratuite lorsque les conditions sont remplies
                    </label>
                </div>
            )}

            {type === 'FREE_GIFT' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Référence Produit Cadeau</label>
                        <input
                            type="text"
                            name="giftProductRef"
                            value={formData.giftProductRef || ''}
                            onChange={onChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                            placeholder="REF003"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Quantité de Cadeau</label>
                        <input
                            type="number"
                            name="giftQuantity"
                            value={formData.giftQuantity || ''}
                            onChange={onChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                            placeholder="1"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BundleRewards;