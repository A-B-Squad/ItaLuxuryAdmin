"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
    FaBox,
    FaFilter,
    FaTrash,
    FaChartLine,
    FaCheckCircle,
    FaTimesCircle,
    FaHistory,
    FaTrashRestore,
    FaExclamationTriangle,
} from "react-icons/fa";
import DiscountForm from "./components/DiscountForm";
import ProductPreview from "./components/ProductPreview";
import ConditionsSelector from "./components/ConditionsSelector";
import CampaignHistory from "./components/CampaignHistory";

import {
    MAIN_CATEGORY_QUERY,
    GET_BRANDS,
    GET_ACTIVE_CAMPAIGNS_QUERY,
} from "@/app/graph/queries";
import {
    ADD_PROMOTIONAL_CAMPAIGN_MUTATION,
    REMOVE_PROMOTIONAL_CAMPAIGN_MUTATION,
} from "@/app/graph/mutations";
import moment from "moment-timezone";

export default function GestionPromotionnellePage() {
    const [activeTab, setActiveTab] = useState<"create" | "campaigns" | "history">("create");
    const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [dateStart, setDateStart] = useState<string>("");
    const [dateEnd, setDateEnd] = useState<string>("");
    const [campaignName, setCampaignName] = useState<string>("Campagne Promotionnelle 2025");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
    const [deleteType, setDeleteType] = useState<"soft" | "hard">("soft");
    const [conditions, setConditions] = useState({
        minPrice: undefined,
        maxPrice: undefined,
        categoryIds: [],
        brandIds: [],
        isVisible: true,
        hasInventory: true,
    });

    // Queries
    const {
        data: campaignsData,
        refetch: refetchCampaigns,
        loading: loadingCampaigns,
    } = useQuery(GET_ACTIVE_CAMPAIGNS_QUERY);

    const { data: categoriesData, loading: loadingCategories } = useQuery(MAIN_CATEGORY_QUERY);
    const { data: brandsData, loading: loadingBrands } = useQuery(GET_BRANDS);

    // Mutations
    const [addDiscount, { loading: addingDiscount }] = useMutation(
        ADD_PROMOTIONAL_CAMPAIGN_MUTATION,
        {
            onCompleted: (data) => {
                alert(
                    `✅ ${data.addPromotionalCampaign.message}\n\nProduits affectés: ${data.addPromotionalCampaign.affectedProducts}\nCampaign ID: ${data.addPromotionalCampaign.campaignId}`
                );
                refetchCampaigns();
                resetForm();
                setActiveTab("campaigns");
            },
            onError: (error) => {
                alert(`❌ Erreur: ${error.message}`);
            },
        }
    );

    const [removeDiscounts, { loading: removingDiscounts }] = useMutation(
        REMOVE_PROMOTIONAL_CAMPAIGN_MUTATION,
        {
            onCompleted: (data) => {
                alert(
                    `✅ ${data.removePromotionalCampaigns.message}\n\nRemises supprimées: ${data.removePromotionalCampaigns.removedCount}`
                );
                refetchCampaigns();
                setShowDeleteModal(false);
                setCampaignToDelete(null);
            },
            onError: (error) => {
                alert(`❌ Erreur: ${error.message}`);
                setShowDeleteModal(false);
            },
        }
    );

    const resetForm = () => {
        setDiscountValue(0);
        setDateStart("");
        setDateEnd("");
        setCampaignName("Campagne Promotionnelle 2025");
        setConditions({
            minPrice: undefined,
            maxPrice: undefined,
            categoryIds: [],
            brandIds: [],
            isVisible: true,
            hasInventory: true,
        });
    };

    const handleApplyDiscount = () => {
        if (!dateStart || !dateEnd) {
            alert("⚠️ Veuillez sélectionner les dates de début et de fin");
            return;
        }

        if (discountValue <= 0) {
            alert("⚠️ La valeur de remise doit être supérieure à 0");
            return;
        }

        if (!campaignName.trim()) {
            alert("⚠️ Veuillez entrer un nom de campagne");
            return;
        }

        const input: any = {
            dateOfStart: dateStart,
            dateOfEnd: dateEnd,
            campaignName: campaignName.trim(),
            conditions: {
                ...conditions,
                minPrice: conditions.minPrice || undefined,
                maxPrice: conditions.maxPrice || undefined,
            },
        };

        if (discountType === "percentage") {
            input.discountPercentage = discountValue;
        } else {
            input.discountAmount = discountValue;
        }

        addDiscount({ variables: { input } });
    };

    const openDeleteModal = (campaignNameToDelete: string) => {
        setCampaignToDelete(campaignNameToDelete);
        setDeleteType("soft");
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (!campaignToDelete) return;

        removeDiscounts({
            variables: {
                campaignName: campaignToDelete,
                softDelete: deleteType === "soft",
            },
        });
    };

    const renderConditions = (conditionsObj: any) => {
        if (!conditionsObj) return "Aucune condition";

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

    const isLoading = loadingCategories || loadingBrands;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Gestionnaire Promotionnelle</h1>
                            <p className="text-red-100">Créez et gérez vos campagnes de remises</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <FaBox className="w-12 h-12" />
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-red-100 rounded-full p-3">
                                    <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Supprimer la campagne
                                </h3>
                            </div>

                            <p className="text-gray-600 mb-4">
                                Campagne: <span className="font-semibold">{campaignToDelete}</span>
                            </p>

                            {/* Delete Type Selection */}
                            <div className="space-y-3 mb-6">
                                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="deleteType"
                                        value="soft"
                                        checked={deleteType === "soft"}
                                        onChange={() => setDeleteType("soft")}
                                        className="mt-1 w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FaTrashRestore className="text-blue-600" />
                                            <span className="font-semibold text-gray-800">
                                                Suppression douce (Recommandé)
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Désactive les remises mais conserve l'historique. Les remises peuvent être restaurées ultérieurement.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-4 border-2 border-red-200 rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="deleteType"
                                        value="hard"
                                        checked={deleteType === "hard"}
                                        onChange={() => setDeleteType("hard")}
                                        className="mt-1 w-4 h-4 text-red-600 focus:ring-2 focus:ring-red-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FaTrash className="text-red-600" />
                                            <span className="font-semibold text-gray-800">
                                                Suppression définitive
                                            </span>
                                        </div>
                                        <p className="text-sm text-red-600">
                                            ⚠️ Supprime définitivement toutes les données. Cette action est irréversible !
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setCampaignToDelete(null);
                                    }}
                                    disabled={removingDiscounts}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={removingDiscounts}
                                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                                        deleteType === "soft"
                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                            : "bg-red-600 hover:bg-red-700 text-white"
                                    }`}
                                >
                                    {removingDiscounts ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Suppression...
                                        </>
                                    ) : (
                                        <>
                                            {deleteType === "soft" ? <FaTrashRestore /> : <FaTrash />}
                                            Confirmer
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg mb-6 p-2 flex gap-2">
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                            activeTab === "create"
                                ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <FaFilter className="inline mr-2" />
                        Créer une Campagne
                    </button>
                    <button
                        onClick={() => setActiveTab("campaigns")}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                            activeTab === "campaigns"
                                ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <FaChartLine className="inline mr-2" />
                        Campagnes Actives
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                            activeTab === "history"
                                ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <FaHistory className="inline mr-2" />
                        Historique
                    </button>
                </div>

                {/* Create Campaign Tab */}
                {activeTab === "create" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Campaign Name */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom de la Campagne
                                </label>
                                <input
                                    type="text"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="ex: Campagne Promotionnelle 2025"
                                />
                            </div>

                            {/* Discount Form Component */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Configuration de la Remise
                                </h2>
                                <DiscountForm
                                    discountType={discountType}
                                    setDiscountType={setDiscountType}
                                    discountValue={discountValue}
                                    setDiscountValue={setDiscountValue}
                                    dateStart={dateStart}
                                    setDateStart={setDateStart}
                                    dateEnd={dateEnd}
                                    setDateEnd={setDateEnd}
                                />
                            </div>

                            {/* Conditions Selector Component */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    <FaFilter className="mr-2 text-blue-600" />
                                    Filtres de Produits
                                </h2>

                                {isLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-gray-500 mt-4">Chargement des filtres...</p>
                                    </div>
                                ) : (
                                    <ConditionsSelector
                                        conditions={conditions}
                                        setConditions={setConditions}
                                        categories={categoriesData?.fetchMainCategories || []}
                                        brands={brandsData?.fetchBrands || []}
                                    />
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleApplyDiscount}
                                    disabled={addingDiscount || isLoading}
                                    className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50 shadow-lg"
                                >
                                    {addingDiscount ? "Création en cours..." : "Créer la Campagne"}
                                </button>
                                <button
                                    onClick={resetForm}
                                    disabled={addingDiscount}
                                    className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
                                >
                                    Réinitialiser
                                </button>
                            </div>
                        </div>

                        {/* Product Preview Component */}
                        <ProductPreview
                            discountType={discountType}
                            discountValue={discountValue}
                            conditions={conditions}
                            campaignName={campaignName}
                        />
                    </div>
                )}

                {/* Active Campaigns Tab */}
                {activeTab === "campaigns" && (
                    <div className="space-y-6">
                        {loadingCampaigns ? (
                            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
                                <p className="text-gray-500 mt-4">Chargement des campagnes...</p>
                            </div>
                        ) : campaignsData?.getActiveCampaigns?.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                <FaChartLine className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-600 mb-2">
                                    Aucune campagne active
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Créez votre première campagne pour commencer
                                </p>
                                <button
                                    onClick={() => setActiveTab("create")}
                                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all"
                                >
                                    Créer une Campagne
                                </button>
                            </div>
                        ) : (
                            campaignsData?.getActiveCampaigns?.map((campaign: any) => (
                                <div key={campaign.id} className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-bold text-gray-800">{campaign.name}</h3>
                                                {campaign.isActive ? (
                                                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                        <FaCheckCircle />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                                                        <FaTimesCircle />
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            {campaign.description && (
                                                <p className="text-gray-600 mb-3">{campaign.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => openDeleteModal(campaign.name)}
                                            disabled={removingDiscounts}
                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <FaTrash />
                                            Supprimer
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <p className="text-xs text-blue-600 font-medium mb-1">Produits Affectés</p>
                                            <p className="text-2xl font-bold text-blue-900">
                                                {campaign.productsAffected}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <p className="text-xs text-green-600 font-medium mb-1">Revenu Total</p>
                                            <p className="text-2xl font-bold text-green-900">
                                                {campaign.totalRevenue?.toFixed(2) || 0} DT
                                            </p>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-lg">
                                            <p className="text-xs text-purple-600 font-medium mb-1">Début</p>
                                            <p className="text-sm font-bold text-purple-900">
                                                {moment(Number(campaign.dateStart)).format("DD/MM/YYYY")}
                                                
                                            </p>
                                        </div>
                                        <div className="p-4 bg-orange-50 rounded-lg">
                                            <p className="text-xs text-orange-600 font-medium mb-1">Fin</p>
                                            <p className="text-sm font-bold text-orange-900">
                                                {moment(Number(campaign.dateEnd)).format("DD/MM/YYYY")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-semibold">Conditions:</span>{" "}
                                            {renderConditions(campaign.conditions)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Créée le {moment(Number(campaign.createdAt)).format("DD/MM/YYYY à HH:mm")}
                                            
                                            {campaign.createdBy && ` par ${campaign.createdBy.fullName}`}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === "history" && (
                    <CampaignHistory  />
                )}
            </div>
        </div>
    );
}