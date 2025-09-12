import { CREATE_PRODUCT_GROUP_VARIANT_MUTATIONS } from '@/app/graph/mutations';
import { GET_ALL_PRODUCT_GROUPS } from '@/app/graph/queries';
import { useMutation, useQuery } from '@apollo/client';
import { useState, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { CiSearch } from 'react-icons/ci';
import { IoIosClose } from 'react-icons/io';

interface AddProductVariantProps {
    selectedGroupId: string | null;
    setSelectedGroupId: (groupId: string | null) => void;
}

const AddVariant = ({ selectedGroupId, setSelectedGroupId }: AddProductVariantProps) => {
    const { toast } = useToast();
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); 

    // Query to get all product groups
    const { data: groupsData, loading: groupsLoading, refetch: refetchGroups } = useQuery(GET_ALL_PRODUCT_GROUPS);

    // Mutation to create new group variant
    const [createGroupVariant, { loading: creatingGroup }] = useMutation(CREATE_PRODUCT_GROUP_VARIANT_MUTATIONS);

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

                // Reset form and refetch groups
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

    const handleGroupSelection = (groupId: string) => {
        setSelectedGroupId(groupId === selectedGroupId ? null : groupId);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    if (groupsLoading) {
        return (
            <div className="bg-white rounded-md shadow-md p-3">
                <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
                    Groupe de produits
                </label>
                <div className="py-3">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    const productGroups = groupsData?.getAllProductGroups || [];

    return (
        <div className="bg-white rounded-md shadow-md p-3">
            <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
                Groupe de produits
            </label>

            <div className="py-3">
                {/* Search Input */}
                {productGroups.length > 0 && (
                    <div className="mb-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CiSearch className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher un groupe..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:border-mainColorAdminDash focus:outline-none focus:ring-1 focus:ring-mainColorAdminDash/20"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700"
                                >
                                    <IoIosClose className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Existing Groups */}
                {productGroups.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                            Sélectionner un groupe existant:
                            {searchTerm && (
                                <span className="ml-1 text-xs text-gray-500">
                                    ({filteredGroups.length} résultat{filteredGroups.length !== 1 ? 's' : ''})
                                </span>
                            )}
                        </p>

                        {filteredGroups.length > 0 ? (
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {filteredGroups.map((group: any) => (
                                    <div
                                        key={group.id}
                                        className={`flex items-center p-2 rounded-md border cursor-pointer transition-all ${selectedGroupId === group.id
                                            ? 'border-mainColorAdminDash bg-mainColorAdminDash/10'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => handleGroupSelection(group.id)}
                                    >
                                        <input
                                            type="radio"
                                            name="productGroup"
                                            value={group.id}
                                            checked={selectedGroupId === group.id}
                                            onChange={() => handleGroupSelection(group.id)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">
                                            {/* Highlight search term */}
                                            {searchTerm ? (
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: group.groupProductName.replace(
                                                            new RegExp(`(${searchTerm})`, 'gi'),
                                                            '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                                                        )
                                                    }}
                                                />
                                            ) : (
                                                group.groupProductName
                                            )}
                                        </span>
                                        {group.Product && group.Product.length > 0 && (
                                            <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {group.Product.length}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                <CiSearch className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                Aucun groupe trouvé pour &quot;{searchTerm}&quot;
                            </div>
                        )}
                    </div>
                )}

                {/* No Group Option */}
                <div
                    className={`flex items-center p-2 rounded-md border cursor-pointer transition-all mb-3 ${selectedGroupId === null
                        ? 'border-mainColorAdminDash bg-mainColorAdminDash/10'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    onClick={() => setSelectedGroupId(null)}
                >
                    <input
                        type="radio"
                        name="productGroup"
                        value=""
                        checked={selectedGroupId === null}
                        onChange={() => setSelectedGroupId(null)}
                        className="mr-2"
                    />
                    <span className="text-sm">Aucun groupe</span>
                </div>

                {/* Create New Group */}
                <div className="border-t pt-3">
                    {!showCreateForm ? (
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateForm(true);
                                // Pre-fill with search term if it exists
                                if (searchTerm && filteredGroups.length === 0) {
                                    setNewGroupName(searchTerm);
                                }
                            }}
                            className="w-full text-left text-sm text-mainColorAdminDash hover:underline"
                        >
                            + Créer un nouveau groupe
                            {searchTerm && filteredGroups.length === 0 && (
                                <span className="ml-1 text-gray-500">
                                    &quot;{searchTerm}&quot;
                                </span>
                            )}
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Nom du nouveau groupe"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:border-mainColorAdminDash focus:outline-none focus:ring-1 focus:ring-mainColorAdminDash/20"
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
                                    className={`flex-1 py-1 px-2 text-sm rounded-md text-white transition-all ${isCreatingGroup || creatingGroup
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
                                    className="flex-1 py-1 px-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-all"
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

export default AddVariant;