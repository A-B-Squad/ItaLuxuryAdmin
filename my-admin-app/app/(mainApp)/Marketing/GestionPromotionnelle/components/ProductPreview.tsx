import React from "react";
import { FaTag, FaArrowDown, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaClock } from "react-icons/fa";

interface Props {
  discountType: "percentage" | "amount";
  discountValue: number;
  conditions: any;
  campaignName?: string;
}

export default function ProductPreview({ discountType, discountValue, conditions, campaignName }: Props) {
  const originalPrice = 100;
  
  // Calculate new price with validation
  const calculateNewPrice = () => {
    if (discountValue <= 0) return originalPrice;
    
    if (discountType === "percentage") {
      return originalPrice * (1 - discountValue / 100);
    } else {
      return Math.max(0, originalPrice - discountValue);
    }
  };
  
  const newPrice = calculateNewPrice();
  const savings = originalPrice - newPrice;
  const savingsPercentage = ((savings / originalPrice) * 100).toFixed(0);
  
  // Check if discount is valid
  const isValidDiscount = discountValue > 0 && newPrice < originalPrice;
  const isPriceZero = newPrice <= 0;

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-red-200 sticky top-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <FaTag className="mr-2 text-red-600" />
        Aperçu de la Remise
      </h3>

      {/* Campaign Name */}
      {campaignName && (
        <div className="bg-white rounded-lg p-3 mb-4 border-l-4 border-red-600">
          <div className="flex items-center gap-2">
            <FaClock className="w-4 h-4 text-red-600" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Campagne</p>
              <p className="text-sm font-bold text-gray-800">{campaignName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Price Preview */}
      <div className="bg-white rounded-lg p-4 mb-4">
        {isValidDiscount ? (
          <>
            <div className="flex items-baseline gap-3">
              <span className={`text-3xl font-bold ${isPriceZero ? 'text-red-600' : 'text-green-600'}`}>
                {newPrice.toFixed(3)} DT
              </span>
              <span className="text-lg text-gray-400 line-through">
                {originalPrice.toFixed(3)} DT
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <FaArrowDown className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-600">
                Économisez {savings.toFixed(3)} DT ({savingsPercentage}%)
              </span>
            </div>
            {isPriceZero && (
              <div className="flex items-center gap-2 mt-2 text-orange-600">
                <FaExclamationTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">Prix final de 0 DT - Vérifiez votre remise</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-2">
            <span className="text-lg text-gray-500">
              Configurez une remise pour voir l'aperçu
            </span>
          </div>
        )}
      </div>

      {/* Discount Configuration */}
      <div className="space-y-3 text-sm">
        <div className="bg-white rounded-lg p-3">
          <h4 className="font-semibold text-gray-700 mb-2">Configuration</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Type de Remise:</span>
              <span className="font-semibold text-gray-800 bg-red-100 px-2 py-1 rounded">
                {discountType === "percentage" ? `${discountValue}%` : `${discountValue} DT`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Type de Campagne:</span>
              <span className="font-semibold text-xs text-white bg-red-600 px-2 py-1 rounded">
                PROMOTIONNELLE
              </span>
            </div>
          </div>
        </div>

        {/* Filters Applied */}
        <div className="bg-white rounded-lg p-3">
          <h4 className="font-semibold text-gray-700 mb-2">Filtres Appliqués</h4>
          <div className="space-y-2">
            {conditions.minPrice !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Prix Minimum:</span>
                <span className="font-semibold text-gray-800">{conditions.minPrice} DT</span>
              </div>
            )}
            {conditions.maxPrice !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Prix Maximum:</span>
                <span className="font-semibold text-gray-800">{conditions.maxPrice} DT</span>
              </div>
            )}
            {conditions.categoryIds?.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Catégories:</span>
                <span className="font-semibold text-gray-800">{conditions.categoryIds.length} sélectionnées</span>
              </div>
            )}
            {conditions.brandIds?.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Marques:</span>
                <span className="font-semibold text-gray-800">{conditions.brandIds.length} sélectionnées</span>
              </div>
            )}
            {conditions.categoryIds?.length === 0 && conditions.brandIds?.length === 0 && (
              <div className="text-center py-2 text-gray-500 italic text-xs">
                Aucun filtre spécifique - s'appliquera à tous les produits
              </div>
            )}
          </div>
        </div>

        {/* Status Toggles */}
        <div className="bg-white rounded-lg p-3">
          <h4 className="font-semibold text-gray-700 mb-2">Critères</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Visibles uniquement:</span>
              <span className="flex items-center gap-1">
                {conditions.isVisible ? (
                  <FaCheckCircle className="text-green-600" />
                ) : (
                  <FaTimesCircle className="text-gray-400" />
                )}
                <span className="font-semibold text-gray-800">
                  {conditions.isVisible ? "Oui" : "Non"}
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">En stock uniquement:</span>
              <span className="flex items-center gap-1">
                {conditions.hasInventory ? (
                  <FaCheckCircle className="text-green-600" />
                ) : (
                  <FaTimesCircle className="text-gray-400" />
                )}
                <span className="font-semibold text-gray-800">
                  {conditions.hasInventory ? "Oui" : "Non"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning for extreme discounts */}
      {discountType === "percentage" && discountValue > 70 && (
        <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
            <span className="text-xs text-orange-800">
              Remise importante ({discountValue}%) - Vérifiez que c'est intentionnel
            </span>
          </div>
        </div>
      )}

      {/* Info about new discount system */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <FaCheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">Système de remise amélioré:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Plusieurs remises par produit</li>
              <li>Historique complet des campagnes</li>
              <li>Suppression "soft" (données conservées)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}