"use client";

import { useQuery, useMutation } from "@apollo/client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FaSave, FaCoins } from "react-icons/fa";
import Loading from "../loading";
import { GET_POINT_SETTINGS } from "@/app/graph/queries";
import { UPDATE_POINT_SETTINGS } from "@/app/graph/mutations";

const PointSettingsPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for form fields
  const [settings, setSettings] = useState({
    conversionRate: 0,
    redemptionRate: 0,
    minimumPointsToUse: 0,
    loyaltyThreshold: 0,
    loyaltyRewardValue: 0,
    isActive: false,
  });

  // Fetch current settings
  const { data, loading, error } = useQuery(GET_POINT_SETTINGS, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error('GraphQL Error:', error);
      if (error.message.includes('Cannot return null for non-nullable field')) {
        console.log('No point settings found, using default values');
      }
    }
  });
  
  const [updateSettings] = useMutation(UPDATE_POINT_SETTINGS);

  useEffect(() => {
    if (data?.getPointSettings) {
      setSettings(data.getPointSettings);
    }
  }, [data]);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateSettings({
        variables: {
          input: {
            conversionRate: settings.conversionRate,
            redemptionRate: settings.redemptionRate,
            minimumPointsToUse: settings.minimumPointsToUse,
            loyaltyThreshold: settings.loyaltyThreshold,
            loyaltyRewardValue: settings.loyaltyRewardValue,
            isActive: settings.isActive,
          },
        },
      });

      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres du système de points ont été mis à jour avec succès.",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour des paramètres de points.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  
  if (error) {
    if (error.message.includes('Cannot return null for non-nullable field Query.getPointSettings')) {
      console.log('No point settings found, using default values');
    } else {
      return (
        <div className="container mx-auto py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Erreur lors du chargement des paramètres</h2>
            <p className="text-red-600">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
          <FaCoins className="text-2xl text-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres du Système de Points</h1>
          <p className="text-sm text-gray-500">Gérez les récompenses et la fidélité de vos clients</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          {/* Status Toggle Section */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Statut du Système</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {settings.isActive 
                    ? "Le système de points est actuellement actif" 
                    : "Le système de points est actuellement désactivé"}
                </p>
              </div>
              
              {/* Fixed Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isActive}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-semibold text-gray-900">
                  {settings.isActive ? "Actif" : "Inactif"}
                </span>
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Conversion Rate */}
              <div className="space-y-2">
                <label htmlFor="conversionRate" className="block text-sm font-semibold text-gray-700">
                  Taux de Conversion
                  <span className="text-gray-500 font-normal ml-1">(DT → Points)</span>
                </label>
                <div className="relative">
                  <input
                    id="conversionRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.conversionRate}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        conversionRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Ex: 10"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <div className="absolute right-3 top-3 text-gray-400 text-sm">pts</div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Points gagnés par 1 DT dépensé
                </p>
              </div>

              {/* Redemption Rate */}
              <div className="space-y-2">
                <label htmlFor="redemptionRate" className="block text-sm font-semibold text-gray-700">
                  Taux de Remboursement
                  <span className="text-gray-500 font-normal ml-1">(Points → DT)</span>
                </label>
                <div className="relative">
                  <input
                    id="redemptionRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.redemptionRate}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        redemptionRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Ex: 0.1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <div className="absolute right-3 top-3 text-gray-400 text-sm">DT</div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Valeur en DT par point lors du remboursement
                </p>
              </div>

              {/* Minimum Points */}
              <div className="space-y-2">
                <label htmlFor="minimumPointsToUse" className="block text-sm font-semibold text-gray-700">
                  Points Minimum à Utiliser
                </label>
                <div className="relative">
                  <input
                    id="minimumPointsToUse"
                    type="number"
                    min="0"
                    value={settings.minimumPointsToUse}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        minimumPointsToUse: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="Ex: 100"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <div className="absolute right-3 top-3 text-gray-400 text-sm">pts</div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  Points minimum requis pour un remboursement
                </p>
              </div>

              {/* Loyalty Threshold */}
              <div className="space-y-2">
                <label htmlFor="loyaltyThreshold" className="block text-sm font-semibold text-gray-700">
                  Seuil de Fidélité
                </label>
                <div className="relative">
                  <input
                    id="loyaltyThreshold"
                    type="number"
                    min="0"
                    value={settings.loyaltyThreshold}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        loyaltyThreshold: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="Ex: 500"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <div className="absolute right-3 top-3 text-gray-400 text-sm">pts</div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Points nécessaires pour obtenir des récompenses
                </p>
              </div>

              {/* Loyalty Reward Value */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="loyaltyRewardValue" className="block text-sm font-semibold text-gray-700">
                  Valeur de Récompense de Fidélité
                </label>
                <div className="relative max-w-md">
                  <input
                    id="loyaltyRewardValue"
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.loyaltyRewardValue}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        loyaltyRewardValue: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Ex: 50"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <div className="absolute right-3 top-3 text-gray-400 text-sm">DT</div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                  Valeur des récompenses obtenues au seuil de fidélité
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              <FaSave className="text-lg" />
              {isSubmitting ? "Enregistrement en cours..." : "Enregistrer les Paramètres"}
            </button>
          </div>
        </div>
      </form>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold">ℹ</span>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Comment ça marche ?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Les clients gagnent des points à chaque achat selon le taux de conversion</li>
              <li>• Les points peuvent être échangés contre des réductions selon le taux de remboursement</li>
              <li>• Un minimum de points est requis pour effectuer un remboursement</li>
              <li>• Les clients fidèles reçoivent des récompenses bonus au seuil de fidélité</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointSettingsPage;