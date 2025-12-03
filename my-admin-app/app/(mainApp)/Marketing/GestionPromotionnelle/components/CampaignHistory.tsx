import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  FaHistory,
  FaSearch,
  FaPercentage,
  FaDollarSign,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
  FaBox,
  FaUndo,
  FaPlay,
  FaPause,
  FaFilter,
  FaExclamationTriangle,
} from "react-icons/fa";
import { GET_ALL_CAMPAIGNS_QUERY } from "@/app/graph/queries";
import { 
  REMOVE_PROMOTIONAL_CAMPAIGN_MUTATION,
  REACTIVATE_CAMPAIGN_MUTATION 
} from "@/app/graph/mutations";
import moment from "moment";

interface Props {
  selectedProductId?: string;
}

export default function CampaignHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "deleted">("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<"soft" | "hard">("soft");

  // Queries
  const { data, loading, error, refetch } = useQuery(GET_ALL_CAMPAIGNS_QUERY);

  // Mutations
  const [removeCampaign, { loading: removing }] = useMutation(
    REMOVE_PROMOTIONAL_CAMPAIGN_MUTATION,
    {
      onCompleted: (data) => {
        const result = data?.removePromotionalCampaigns;
        if (result?.success) {
          alert(`✅ ${result.message}\n${result.removedCount} réductions supprimées`);
        } else {
          alert("✅ Campagne supprimée avec succès");
        }
        refetch();
        setShowDeleteModal(false);
        setCampaignToDelete(null);
      },
      onError: (error) => {
        alert(`❌ Erreur: ${error.message}`);
        setShowDeleteModal(false);
      },
    }
  );

  const [reactivateCampaign, { loading: reactivating }] = useMutation(
    REACTIVATE_CAMPAIGN_MUTATION,
    {
      onCompleted: () => {
        alert("✅ Campagne réactivée avec succès");
        refetch();
      },
      onError: (error) => {
        alert(`❌ Erreur: ${error.message}`);
      },
    }
  );

  const campaigns = data?.getAllCampaigns || [];

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign: any) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === "active") {
      matchesFilter = campaign.isActive && !campaign.isDeleted;
    } else if (filterStatus === "inactive") {
      matchesFilter = !campaign.isActive && !campaign.isDeleted;
    } else if (filterStatus === "deleted") {
      matchesFilter = campaign.isDeleted;
    }
    
    return matchesSearch && matchesFilter;
  });

  const openDeleteModal = (campaign: any) => {
    setCampaignToDelete(campaign);
    setDeleteType("soft");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!campaignToDelete) return;

    // Parse conditions if they exist
    let conditions = undefined;
    if (campaignToDelete.conditions) {
      const parsed = typeof campaignToDelete.conditions === "string" 
        ? JSON.parse(campaignToDelete.conditions) 
        : campaignToDelete.conditions;
      
      // Build conditions object matching the mutation's expected format
      conditions = {
        categoryIds: parsed.categoryIds || undefined,
        brandIds: parsed.brandIds || undefined,
        productIds: parsed.productIds || undefined,
      };
    }

    removeCampaign({
      variables: {
        conditions,
        campaignName: campaignToDelete.name,
        softDelete: deleteType === "soft",
      },
    });
  };

  const handleReactivate = (campaignName: string) => {
    if (confirm(`Réactiver la campagne "${campaignName}" ?`)) {
      reactivateCampaign({
        variables: { campaignName },
      });
    }
  };

  const getDiscountTypeIcon = (type: string) => {
    return type === "PERCENTAGE" ? (
      <FaPercentage className="w-4 h-4 text-blue-600" />
    ) : (
      <FaDollarSign className="w-4 h-4 text-green-600" />
    );
  };

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case "BLACK_FRIDAY":
        return "bg-red-100 text-red-700";
      case "CYBER_MONDAY":
        return "bg-purple-100 text-purple-700";
      case "FLASH_SALE":
        return "bg-orange-100 text-orange-700";
      case "SEASONAL":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusBadge = (campaign: any) => {

    if (campaign.isActive) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          <FaCheckCircle className="w-3 h-3" />
          Active
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
        <FaTimesCircle className="w-3 h-3" />
        Terminée
      </span>
    );
  };

  const renderConditions = (conditionsObj: any) => {
    if (!conditionsObj) return "Tous les produits";
    
    const parsed = typeof conditionsObj === "string" ? JSON.parse(conditionsObj) : conditionsObj;
    const parts = [];

    if (parsed.minPrice) parts.push(`Prix min: ${parsed.minPrice} DT`);
    if (parsed.maxPrice) parts.push(`Prix max: ${parsed.maxPrice} DT`);
    if (parsed.categoryIds?.length) parts.push(`${parsed.categoryIds.length} catégories`);
    if (parsed.brandIds?.length) parts.push(`${parsed.brandIds.length} marques`);
    if (parsed.isVisible) parts.push("Visibles");
    if (parsed.hasInventory) parts.push("En stock");

    return parts.length > 0 ? parts.join(" • ") : "Tous les produits";
  };

  return (
    <div className="space-y-6">
      {/* Delete Modal */}
      {showDeleteModal && campaignToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <FaExclamationTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Supprimer la campagne</h3>
            </div>

            <p className="text-gray-600 mb-4">
              Campagne: <span className="font-semibold">{campaignToDelete.name}</span>
            </p>

            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                <input
                  type="radio"
                  name="deleteType"
                  value="soft"
                  checked={deleteType === "soft"}
                  onChange={() => setDeleteType("soft")}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FaUndo className="text-blue-600" />
                    <span className="font-semibold">Suppression douce</span>
                  </div>
                  <p className="text-sm text-gray-600">Désactive mais conserve l'historique</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
                <input
                  type="radio"
                  name="deleteType"
                  value="hard"
                  checked={deleteType === "hard"}
                  onChange={() => setDeleteType("hard")}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FaTrash className="text-red-600" />
                    <span className="font-semibold">Suppression définitive</span>
                  </div>
                  <p className="text-sm text-red-600">⚠️ Action irréversible</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCampaignToDelete(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={removing}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white ${
                  deleteType === "soft" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {removing ? "Suppression..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaHistory className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Historique des Campagnes</h2>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une campagne..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaFilter className="inline mr-2" />
            Toutes ({campaigns.length})
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === "active"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaCheckCircle className="inline mr-2" />
            Actives
          </button>
          <button
            onClick={() => setFilterStatus("inactive")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === "inactive"
                ? "bg-gray-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaTimesCircle className="inline mr-2" />
            Terminées
          </button>
     
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement...</p>
        </div>
      )}

      {error && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <FaTimesCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Erreur</h3>
          <p className="text-red-600">{error.message}</p>
        </div>
      )}

      {!loading && !error && filteredCampaigns.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FaBox className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">Aucune campagne trouvée</h3>
          <p className="text-gray-500">
            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : "Créez votre première campagne"}
          </p>
        </div>
      )}

      {/* Campaign List */}
      {!loading && !error && filteredCampaigns.length > 0 && (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign: any) => (
            <div
              key={campaign.id}
              className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                campaign.isDeleted
                  ? "border-red-400 opacity-75"
                  : campaign.isActive
                  ? "border-green-400"
                  : "border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h4 className="text-xl font-bold text-gray-800">{campaign.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCampaignTypeColor(campaign.type)}`}>
                      {campaign.type}
                    </span>
                    {getStatusBadge(campaign)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {campaign.isDeleted ? (
                    <button
                      onClick={() => handleReactivate(campaign.name)}
                      disabled={reactivating}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all disabled:opacity-50 flex items-center gap-2"
                      title="Restaurer la campagne"
                    >
                      <FaUndo />
                      Restaurer
                    </button>
                  ) : !campaign.isActive ? (
                    <button
                      onClick={() => handleReactivate(campaign.name)}
                      disabled={reactivating}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all disabled:opacity-50 flex items-center gap-2"
                      title="Réactiver la campagne"
                    >
                      <FaPlay />
                      Réactiver
                    </button>
                  ) : null}
                  
                  {!campaign.isDeleted && (
                    <button
                      onClick={() => openDeleteModal(campaign)}
                      disabled={removing}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <FaTrash />
                      Supprimer
                    </button>
                  )}
                </div>
              </div>

              {/* Campaign Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">Produits Affectés</p>
                  <p className="text-lg font-bold text-blue-900">{campaign.productsAffected || 0}</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 font-medium mb-1">Revenu Total</p>
                  <p className="text-lg font-bold text-green-900">
                    {campaign.totalRevenue?.toFixed(2) || 0} DT
                  </p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium mb-1">Début</p>
                  <p className="text-sm font-bold text-purple-900">
                    {moment(Number(campaign.dateStart)).format("DD/MM/YYYY")}
                  </p>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-600 font-medium mb-1">Fin</p>
                  <p className="text-sm font-bold text-orange-900">
                    {moment(Number(campaign.dateEnd)).format("DD/MM/YYYY")}
                  </p>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Période:</span>
                  <span className="font-semibold text-gray-800">
                    {moment(Number(campaign.dateStart)).format("DD/MM/YYYY HH:mm")} → {moment(Number(campaign.dateEnd)).format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Conditions:</span> {renderConditions(campaign.conditions)}
                </p>

                <p className="text-xs text-gray-500">
                  Créée le {moment(campaign.createdAt).format("DD/MM/YYYY à HH:mm")}
                  {campaign.createdBy && ` par ${campaign.createdBy.fullName}`}
                  {campaign.updatedAt && campaign.updatedAt !== campaign.createdAt && (
                    ` • Modifiée le ${moment(Number(campaign.updatedAt)).format("DD/MM/YYYY à HH:mm")}`
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}