
"use client"
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_All_BUNDLES } from '@/app/graph/queries';
import { CREATE_BUNDLE_MUTATION, DELETE_BUNDLE_MUTATION, TOGGLE_BUNDLE_STATUS_MUTATION, UPDATE_BUNDLE_MUTATION } from '@/app/graph/mutations';

// Import all components
import BundleHeader from './components/BundleHeader';
import BundleFilters from './components/BundleFilters';
import BundleCard from './components/BundleCard';
import BundleEmptyState from './components/BundleEmptyState';
import BundleModalHeader from './components/BundleModalHeader';
import StepIndicator from './components/StepIndicator';
import BundleBasicInfo from './components/BundleBasicInfo';
import BundleConditions from './components/BundleConditions';
import BundleRewards from './components/BundleRewards';
import BundleUsageLimits from './components/BundleUsageLimits';
import BundleModalFooter from './components/BundleModalFooter';

// Import types
import { Bundle, BundleFormData, BundleType, BundleStatus } from './components/bundle.types';

const BundleAdminDashboard: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<BundleStatus | ''>('');
    const [filterType, setFilterType] = useState<BundleType | ''>('');

    // GraphQL Queries
    const { data: bundlesData, loading: bundlesLoading, error: bundlesError, refetch: refetchBundles } = useQuery(GET_All_BUNDLES, {
        variables: {
            status: filterStatus || undefined,
            type: filterType || undefined
        }
    });

    // GraphQL Mutations
    const [createBundle] = useMutation(CREATE_BUNDLE_MUTATION, { onCompleted: () => refetchBundles() });
    const [updateBundle] = useMutation(UPDATE_BUNDLE_MUTATION, { onCompleted: () => refetchBundles() });
    const [deleteBundle] = useMutation(DELETE_BUNDLE_MUTATION, { onCompleted: () => refetchBundles() });
    const [toggleBundleStatus] = useMutation(TOGGLE_BUNDLE_STATUS_MUTATION, { onCompleted: () => refetchBundles() });

    const [formData, setFormData] = useState<BundleFormData>({
        name: '',
        description: '',
        type: 'BUY_X_GET_Y_FREE',
        status: 'ACTIVE',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        minPurchaseAmount: 0,
        minQuantity: 0,
        requiredProductRefs: [],
        anyProductRefs: [],
        requiredCategoryIds: [],
        requiredBrandIds: [],
        requireAllProducts: false,
        freeProductQuantity: 0,
        freeProductRef: '',
        discountPercentage: 0,
        discountAmount: 0,
        applyDiscountTo: 'ALL',
        givesFreeDelivery: false,
        giftProductRef: '',
        giftQuantity: 1,
        maxUsagePerUser: null,
        maxUsageTotal: null
    });

    const bundles = bundlesData?.getAllBundles || [];

    const filteredBundles = bundles.filter((bundle: Bundle) => {
        const matchesSearch = bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bundle.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !filterStatus || bundle.status === filterStatus;
        const matchesType = !filterType || bundle.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    // Helper function to safely format date
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    const handleOpenModal = (bundle: Bundle | null = null) => {
        if (bundle) {
            setEditingBundle(bundle);
            setFormData({
                name: bundle.name,
                description: bundle.description,
                type: bundle.type,
                status: bundle.status,
                startDate: formatDate(bundle.startDate),
                endDate: formatDate(bundle.endDate),
                minPurchaseAmount: bundle.minPurchaseAmount || 0,
                minQuantity: bundle.minQuantity || 0,
                requiredProductRefs: bundle.requiredProductRefs || [],
                anyProductRefs: bundle.anyProductRefs || [],
                requiredCategoryIds: bundle.requiredCategoryIds || [],
                requiredBrandIds: bundle.requiredBrandIds || [],
                requireAllProducts: bundle.requireAllProducts || false,
                freeProductQuantity: bundle.freeProductQuantity || 0,
                freeProductRef: bundle.freeProductRef || '',
                discountPercentage: bundle.discountPercentage || 0,
                discountAmount: bundle.discountAmount || 0,
                applyDiscountTo: bundle.applyDiscountTo || 'ALL',
                givesFreeDelivery: bundle.givesFreeDelivery || false,
                giftProductRef: bundle.giftProductRef || '',
                giftQuantity: bundle.giftQuantity || 1,
                maxUsagePerUser: bundle.maxUsagePerUser || null,
                maxUsageTotal: bundle.maxUsageTotal || null
            });
        } else {
            setEditingBundle(null);
            setFormData({
                name: '',
                description: '',
                type: 'BUY_X_GET_Y_FREE',
                status: 'ACTIVE',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                minPurchaseAmount: 0,
                minQuantity: 0,
                requiredProductRefs: [],
                anyProductRefs: [],
                requiredCategoryIds: [],
                requiredBrandIds: [],
                requireAllProducts: false,
                freeProductQuantity: 0,
                freeProductRef: '',
                discountPercentage: 0,
                discountAmount: 0,
                applyDiscountTo: 'ALL',
                givesFreeDelivery: false,
                giftProductRef: '',
                giftQuantity: 1,
                maxUsagePerUser: null,
                maxUsageTotal: null
            });
        }
        setShowModal(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                type === 'number' ? (value === '' ? null : parseFloat(value)) :
                    value
        }));
    };

    const handleArrayChange = (name: keyof BundleFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value.split(',').map(v => v.trim()).filter(v => v)
        }));
    };

    // Helper function to safely convert date to ISO string
    const toISOStringOrNull = (dateString: string): string | null => {
        if (!dateString || dateString.trim() === '') {
            return null;
        }
        try {
            // For date inputs (YYYY-MM-DD), append time at noon UTC to avoid timezone issues
            const date = new Date(dateString + 'T12:00:00.000Z');

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return null;
            }

            // Return ISO string, but the comparison should only use the date part
            return date.toISOString();
        } catch {
            return null;
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            alert('Veuillez entrer un nom de pack');
            return;
        }

        const bundleData = {
            name: formData.name,
            description: formData.description,
            type: formData.type,
            startDate: toISOStringOrNull(formData.startDate),
            endDate: toISOStringOrNull(formData.endDate),
            minPurchaseAmount: formData.minPurchaseAmount || 0,
            minQuantity: formData.minQuantity || 0,
            discountPercentage: formData.discountPercentage || 0,
            discountAmount: formData.discountAmount || 0,
            giftQuantity: formData.giftQuantity || 1,
            freeProductQuantity: formData.freeProductQuantity || 0,
            maxUsagePerUser: formData.maxUsagePerUser || null,
            maxUsageTotal: formData.maxUsageTotal || null,
            requiredProductRefs: formData.requiredProductRefs,
            anyProductRefs: formData.anyProductRefs,
            requiredCategoryIds: formData.requiredCategoryIds,
            requiredBrandIds: formData.requiredBrandIds,
            requireAllProducts: formData.requireAllProducts,
            freeProductRef: formData.freeProductRef || '',
            applyDiscountTo: formData.applyDiscountTo,
            giftProductRef: formData.giftProductRef || '',
            givesFreeDelivery: formData.type === 'FREE_DELIVERY' ? true : formData.givesFreeDelivery,
        };

        try {
            if (editingBundle) {
                await updateBundle({
                    variables: {
                        id: editingBundle.id,
                        input: { ...bundleData, status: formData.status }
                    }
                });
            } else {
                await createBundle({
                    variables: { input: bundleData }
                });
            }
            setShowModal(false);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du pack:', error);
            alert('Échec de la sauvegarde du pack. Veuillez réessayer.');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce pack?')) {
            try {
                await deleteBundle({ variables: { id } });
            } catch (error) {
                console.error('Erreur lors de la suppression du pack:', error);
                alert('Échec de la suppression du pack');
            }
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: BundleStatus) => {
        const newStatus: BundleStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await toggleBundleStatus({ variables: { id, status: newStatus } });
        } catch (error) {
            console.error('Erreur lors du changement de statut:', error);
            alert('Échec de la mise à jour du statut du pack');
        }
    };

    if (bundlesLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Chargement des packs...</p>
                </div>
            </div>
        );
    }

    if (bundlesError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center text-red-600">
                    <p className="text-lg font-semibold">Erreur lors du chargement des packs</p>
                    <p className="text-sm mt-2">{bundlesError.message}</p>
                    <button
                        onClick={() => refetchBundles()}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                <BundleHeader
                    filteredBundles={filteredBundles}
                    onCreateBundle={() => handleOpenModal()}
                />

                <BundleFilters
                    searchTerm={searchTerm}
                    filterStatus={filterStatus}
                    filterType={filterType}
                    onSearchChange={setSearchTerm}
                    onStatusChange={setFilterStatus}
                    onTypeChange={setFilterType}
                />

                <div className="grid gap-6">
                    {filteredBundles.map((bundle: Bundle) => (
                        <BundleCard
                            key={bundle.id}
                            bundle={bundle}
                            onEdit={handleOpenModal}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleStatus}
                        />
                    ))}

                    {filteredBundles.length === 0 && <BundleEmptyState />}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden animate-slideUp">
                        <BundleModalHeader
                            isEditing={!!editingBundle}
                            onClose={() => setShowModal(false)}
                        />

                        <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(95vh-180px)]">
                            <StepIndicator />

                            <BundleBasicInfo
                                formData={formData}
                                onChange={handleInputChange}
                            />

                            <BundleConditions
                                formData={formData}
                                onChange={handleInputChange}
                                onArrayChange={handleArrayChange}
                            />

                            <BundleRewards
                                formData={formData}
                                onChange={handleInputChange}
                            />

                            <BundleUsageLimits
                                formData={formData}
                                onChange={handleInputChange}
                            />
                        </div>

                        <BundleModalFooter
                            isEditing={!!editingBundle}
                            onCancel={() => setShowModal(false)}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BundleAdminDashboard;