import { CREATE_PRODUCT_GROUP_VARIANT_MUTATIONS, DELETE_PRODUCT_GROUP_VARIANT_MUTATIONS } from '@/app/graph/mutations';
import { GET_ALL_PRODUCT_GROUPS } from '@/app/graph/queries';
import { useMutation, useQuery } from '@apollo/client';
import { useState, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { CiSearch } from 'react-icons/ci';
import { IoIosClose } from 'react-icons/io';
import { HiOutlineTrash } from 'react-icons/hi2';
import { BiCheckCircle } from 'react-icons/bi';

interface UpdateProductVariantProps {
    selectedGroupId: string | null;
    setSelectedGroupId: (groupId: string | null) => void;
}

const UpdateVariant = ({ selectedGroupId, setSelectedGroupId }: UpdateProductVariantProps) => {

    const { toast } = useToast();
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // Query to get all product groups
    const { data: groupsData, loading: groupsLoading, refetch: refetchGroups } = useQuery(GET_ALL_PRODUCT_GROUPS);

    // Mutation to create new group variant
    const [createGroupVariant, { loading: creatingGroup }] = useMutation(CREATE_PRODUCT_GROUP_VARIANT_MUTATIONS);

    // Mutation to delete group variant
    const [deleteGroupVariant] = useMutation(DELETE_PRODUCT_GROUP_VARIANT_MUTATIONS, {
        refetchQueries: [{ query: GET_ALL_PRODUCT_GROUPS }],
    });

    // Filter groups based on search term
    const filteredGroups = useMemo(() => {
        const productGroups = groupsData?.getAllProductGroups || [];

        if (!searchTerm.trim()) {
            return productGroups;
        }

        return productGroups.filter((group: any) =>
            group.groupProductName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [groupsData?.getAllProductGroups, searchTerm]);

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            toast({
                title: "Erreur",
                variant: "destructive",
                description: "Veuillez entrer un nom pour le groupe.",
                duration: 3000,
            });
            return;
        }

        setIsCreatingGroup(true);
        try {
            const response = await createGroupVariant({
                variables: {
                    input: {
                        groupProductName: newGroupName.trim()
                    }
                }
            });

            if (response.data?.createGroupProductVariant) {
                toast({
                    title: "Succès",
                    className: "text-white bg-mainColorAdminDash border-0",
                    description: "Groupe créé avec succès.",
                    duration: 3000,
                });

                setNewGroupName('');
                setShowCreateForm(false);
                setSearchTerm('');
                await refetchGroups();

                if (response.data.createGroupProductVariant.id) {
                    setSelectedGroupId(response.data.createGroupProductVariant.id);
                }
            }
        } catch (error: any) {
            toast({
                title: "Erreur",
                variant: "destructive",
                description: error.message || "Erreur lors de la création du groupe.",
                duration: 5000,
            });
        } finally {
            setIsCreatingGroup(false);
        }
    };

    const handleDeleteGroup = async (groupId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        setDeletingGroupId(groupId);

        try {
            const response = await deleteGroupVariant({
                variables: {
                    deleteGroupProductVariantId: groupId
                }
            });

            if (response.data?.deleteGroupProductVariant) {
                toast({
                    title: "Succès",
                    className: "text-white bg-mainColorAdminDash border-0",
                    description: "Groupe supprimé avec succès.",
                    duration: 3000,
                });

                if (selectedGroupId === groupId) {
                    setSelectedGroupId(null);
                }

                await refetchGroups();
            }
        } catch (error: any) {
            toast({
                title: "Erreur",
                variant: "destructive",
                description: error.message || "Erreur lors de la suppression du groupe.",
                duration: 5000,
            });
        } finally {
            setDeletingGroupId(null);
            setShowDeleteConfirm(null);
        }
    };

    const handleGroupSelection = (groupId: string) => {
        setSelectedGroupId(groupId === selectedGroupId ? null : groupId);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const highlightSearchTerm = (text: string, term: string) => {
        if (!term) return text;
        return text.replace(
            new RegExp(`(${term})`, 'gi'),
            '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
        );
    };

    if (groupsLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <h3 className="text-base font-semibold text-gray-800">Groupe de produits</h3>
                </div>
                <div className="py-4">
                    <div className="animate-pulse space-y-3">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    const productGroups = groupsData?.getAllProductGroups || [];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800">Groupe de produits</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {productGroups.length} groupe{productGroups.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="pt-4 space-y-4">
                {/* Search Input */}
                {productGroups.length > 0 && (
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CiSearch className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un groupe..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-mainColorAdminDash focus:outline-none focus:ring-2 focus:ring-mainColorAdminDash/20 transition-all"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700"
                            >
                                <IoIosClose className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                )}

                {/* Existing Groups */}
                {productGroups.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600 font-medium">
                                Sélectionner un groupe
                            </p>
                            {searchTerm && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {filteredGroups.length} résultat{filteredGroups.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {filteredGroups.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                {filteredGroups.map((group: any) => (
                                    <div
                                        key={group.id}
                                        className={`group relative flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedGroupId === group.id
                                            ? 'border-mainColorAdminDash bg-mainColorAdminDash/10 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        onClick={() => handleGroupSelection(group.id)}
                                    >
                                        {/* Radio Button */}
                                        <div className="flex-shrink-0">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedGroupId === group.id
                                                ? 'border-mainColorAdminDash bg-mainColorAdminDash'
                                                : 'border-gray-300 group-hover:border-gray-400'
                                                }`}>
                                                {selectedGroupId === group.id && (
                                                    <BiCheckCircle className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Group Name */}
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-gray-800 block truncate">
                                                {searchTerm ? (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: highlightSearchTerm(group.groupProductName, searchTerm)
                                                        }}
                                                    />
                                                ) : (
                                                    group.groupProductName
                                                )}
                                            </span>
                                        </div>

                                        {/* Product Count Badge */}
                                        {group.Product && group.Product.length > 0 && (
                                            <span className="flex-shrink-0 text-xs font-medium text-gray-600 bg-gray-200 px-2.5 py-1 rounded-full">
                                                {group.Product.length}
                                            </span>
                                        )}

                                        {/* Delete Button */}
                                        {showDeleteConfirm === group.id ? (
                                            <div className="flex-shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => handleDeleteGroup(group.id, e)}
                                                    disabled={deletingGroupId === group.id}
                                                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                                                >
                                                    {deletingGroupId === group.id ? 'Suppression...' : 'Confirmer'}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowDeleteConfirm(null);
                                                    }}
                                                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowDeleteConfirm(group.id);
                                                }}
                                                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                                                title="Supprimer le groupe"
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <CiSearch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">Aucun groupe trouvé pour &quot;{searchTerm}&quot;</p>
                            </div>
                        )}
                    </div>
                )}

                {/* No Group Option */}
                <div
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedGroupId === null
                        ? 'border-mainColorAdminDash bg-mainColorAdminDash/10 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    onClick={() => setSelectedGroupId(null)}
                >
                    <div className="flex-shrink-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedGroupId === null
                            ? 'border-mainColorAdminDash bg-mainColorAdminDash'
                            : 'border-gray-300'
                            }`}>
                            {selectedGroupId === null && (
                                <BiCheckCircle className="w-4 h-4 text-white" />
                            )}
                        </div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">Aucun groupe</span>
                </div>

                {/* Create New Group */}
                <div className="pt-3 border-t border-gray-200">
                    {!showCreateForm ? (
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateForm(true);
                                if (searchTerm && filteredGroups.length === 0) {
                                    setNewGroupName(searchTerm);
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-mainColorAdminDash bg-mainColorAdminDash/10 rounded-lg hover:bg-mainColorAdminDash/20 transition-colors"
                        >
                            <span>+ Créer un nouveau groupe</span>
                            {searchTerm && filteredGroups.length === 0 && (
                                <span className="text-gray-500">&quot;{searchTerm}&quot;</span>
                            )}
                        </button>
                    ) : (
                        <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <input
                                type="text"
                                placeholder="Nom du nouveau groupe"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:border-mainColorAdminDash focus:outline-none focus:ring-2 focus:ring-mainColorAdminDash/20"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreateGroup();
                                    }
                                }}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleCreateGroup}
                                    disabled={isCreatingGroup || creatingGroup}
                                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg text-white transition-all ${isCreatingGroup || creatingGroup
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-mainColorAdminDash hover:opacity-90'
                                        }`}
                                >
                                    {isCreatingGroup || creatingGroup ? 'Création...' : 'Créer'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewGroupName('');
                                    }}
                                    className="flex-1 py-2 px-4 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateVariant;