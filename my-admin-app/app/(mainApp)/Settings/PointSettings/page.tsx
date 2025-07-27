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
      // If no settings exist, we'll continue with default values
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

    console.log(settings)
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
      console.log(error)
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
    // Handle the specific case where getPointSettings returns null
    if (error.message.includes('Cannot return null for non-nullable field Query.getPointSettings')) {
      // Initialize with default settings when no settings exist
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
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <FaCoins className="text-3xl text-yellow-500" />
        <h1 className="text-2xl font-bold">Paramètres du Système de Points</h1>
      </div>

      <div onSubmit={handleSubmit}>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold">Statut du Système</h2>
              <p className="text-sm text-gray-500">Activer ou désactiver le système de points</p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isActive}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="sr-only"
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${settings.isActive ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
              </label>
              <span className="text-sm font-medium text-gray-700">
                {settings.isActive ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="conversionRate" className="block text-sm font-medium text-gray-700">
                Taux de Conversion (DT vers Points)
              </label>
              <input
                id="conversionRate"
                type="number"
                step="0.01"
                value={settings.conversionRate}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    conversionRate: parseFloat(e.target.value),
                  }))
                }
                placeholder="Entrez le taux de conversion"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500">
                Points gagnés par 1 DT dépensé
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="redemptionRate" className="block text-sm font-medium text-gray-700">
                Taux de Remboursement (Points vers DT)
              </label>
              <input
                id="redemptionRate"
                type="number"
                step="0.01"
                value={settings.redemptionRate}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    redemptionRate: parseFloat(e.target.value),
                  }))
                }
                placeholder="Entrez le taux de remboursement"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500">
                Valeur en DT par point lors du remboursement
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="minimumPointsToUse" className="block text-sm font-medium text-gray-700">
                Points Minimum à Utiliser
              </label>
              <input
                id="minimumPointsToUse"
                type="number"
                value={settings.minimumPointsToUse}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    minimumPointsToUse: parseInt(e.target.value),
                  }))
                }
                placeholder="Entrez le minimum de points"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500">
                Points minimum requis pour un remboursement
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="loyaltyThreshold" className="block text-sm font-medium text-gray-700">
                Seuil de Fidélité
              </label>
              <input
                id="loyaltyThreshold"
                type="number"
                value={settings.loyaltyThreshold}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    loyaltyThreshold: parseInt(e.target.value),
                  }))
                }
                placeholder="Entrez le seuil de fidélité"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500">
                Points nécessaires pour obtenir des récompenses de fidélité
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="loyaltyRewardValue" className="block text-sm font-medium text-gray-700">
                Valeur de Récompense de Fidélité (DT)
              </label>
              <input
                id="loyaltyRewardValue"
                type="number"
                step="0.01"
                value={settings.loyaltyRewardValue}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    loyaltyRewardValue: parseFloat(e.target.value),
                  }))
                }
                placeholder="Entrez la valeur de récompense"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500">
                Valeur des récompenses obtenues au seuil de fidélité
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaSave />
              {isSubmitting ? "Enregistrement..." : "Enregistrer les Paramètres"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointSettingsPage;