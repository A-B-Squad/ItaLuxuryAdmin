"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FiEdit2, FiExternalLink, FiChevronDown, FiChevronRight, FiMove } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { MAIN_CATEGORY_QUERY } from "@/app/graph/queries";
import { useMutation, useQuery } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import SearchBarForTables from "@/app/(mainApp)/components/SearchBarForTables";
import AddCategories from "../components/AddCategoriesButton";
import Loading from "@/app/loading";
import { useToast } from "@/components/ui/use-toast";
import { DELETE_CATEGORIES_MUTATIONS, REORDER_CATEGORIES_MUTATION } from "../../../../graph/mutations";
import DeleteModal from "@/app/(mainApp)/components/DeleteModal";

interface Category {
  id: string;
  name: string;
  smallImage: string;
  order?: number;
  parentId?: string | null;
  subcategories?: Category[];
}

interface AllCategoriesProps {
  searchParams: {
    q?: string;
  };
}

const AllCategories: React.FC<AllCategoriesProps> = ({ searchParams }) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [draggedItem, setDraggedItem] = useState<{
    id: string;
    parentId: string | null;
  } | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const query = searchParams.q;

  const { data, loading, error, refetch } = useQuery(MAIN_CATEGORY_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const [deleteCategoriesMutation, { loading: isDeleting }] = useMutation(DELETE_CATEGORIES_MUTATIONS);
  const [reorderCategoriesMutation] = useMutation(REORDER_CATEGORIES_MUTATION);

  useEffect(() => {
    if (data?.fetchMainCategories) {
      // Sort by order field
      const sortCategories = (cats: Category[]): Category[] => {
        return cats.map(cat => ({
          ...cat,
          subcategories: cat.subcategories ? sortCategories(cat.subcategories) : []
        })).sort((a, b) => (a.order || 0) - (b.order || 0));
      };
      
      setCategories(sortCategories(data.fetchMainCategories));
    }
  }, [data]);

  const filteredCategories = useMemo(() => {
    if (!categories.length) return [];

    const filterAndSortCategories = (categoriesList: Category[]): Category[] => {
      if (!query) return categoriesList;

      return categoriesList
        .filter(category => {
          const isMatch = category.name.toLowerCase().includes(query.toLowerCase());
          const hasMatchingSubcategories = category.subcategories
            ? filterAndSortCategories(category.subcategories).length > 0
            : false;

          return isMatch || hasMatchingSubcategories;
        })
        .map(category => {
          if (category.subcategories) {
            return {
              ...category,
              subcategories: filterAndSortCategories(category.subcategories)
            };
          }
          return category;
        });
    };

    return filterAndSortCategories(categories);
  }, [categories, query]);

  const handleDeleteCategory = useCallback(async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategoriesMutation({
        variables: {
          deleteCategoryId: categoryToDelete.id,
        },
      });

      toast({
        title: "Catégorie supprimée",
        description: `La catégorie "${categoryToDelete.name}" a été supprimée avec succès.`,
        className: "bg-green-600 text-white",
      });

      await refetch();
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la catégorie: ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
        variant: "destructive",
      });
    }
  }, [categoryToDelete, deleteCategoriesMutation, refetch, toast]);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // Helper function to get categories at the same level
  const getCategoriesAtLevel = (parentId: string | null, cats: Category[]): Category[] => {
    if (parentId === null) {
      return cats.filter(c => !c.parentId);
    }
    
    const findChildren = (categories: Category[]): Category[] => {
      for (const cat of categories) {
        if (cat.id === parentId) {
          return cat.subcategories || [];
        }
        if (cat.subcategories) {
          const found = findChildren(cat.subcategories);
          if (found.length > 0) return found;
        }
      }
      return [];
    };
    
    return findChildren(cats);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, categoryId: string, parentId: string | null) => {
    setDraggedItem({ id: categoryId, parentId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(categoryId);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = async (e: React.DragEvent, targetCategoryId: string, targetParentId: string | null) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetCategoryId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Only allow reordering within the same level
    if (draggedItem.parentId !== targetParentId) {
      toast({
        title: "Action non autorisée",
        description: "Vous ne pouvez réorganiser que les catégories du même niveau.",
        variant: "destructive",
      });
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Get categories at the same level
    const sameLevelCategories = getCategoriesAtLevel(targetParentId, filteredCategories);
    
    const draggedIndex = sameLevelCategories.findIndex(cat => cat.id === draggedItem.id);
    const targetIndex = sameLevelCategories.findIndex(cat => cat.id === targetCategoryId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Reorder array
    const newSameLevelCategories = [...sameLevelCategories];
    const [removed] = newSameLevelCategories.splice(draggedIndex, 1);
    newSameLevelCategories.splice(targetIndex, 0, removed);

    // Update order values
    const categoryOrders = newSameLevelCategories.map((cat, index) => ({
      id: cat.id,
      order: index,
    }));

    // Update UI recursively
    const updateCategoriesOrder = (cats: Category[]): Category[] => {
      return cats.map(cat => {
        if (targetParentId === null && !cat.parentId) {
          // Updating main categories
          const foundIndex = newSameLevelCategories.findIndex(c => c.id === cat.id);
          if (foundIndex !== -1) {
            return { ...cat, order: foundIndex };
          }
        } else if (cat.id === targetParentId) {
          // Found parent, update its children
          return {
            ...cat,
            subcategories: newSameLevelCategories
          };
        } else if (cat.subcategories) {
          // Keep searching recursively
          return {
            ...cat,
            subcategories: updateCategoriesOrder(cat.subcategories)
          };
        }
        return cat;
      });
    };

    // Optimistically update UI
    setCategories(targetParentId === null ? newSameLevelCategories : updateCategoriesOrder(categories));

    try {
      await reorderCategoriesMutation({
        variables: { categoryOrders },
      });

      toast({
        title: "Ordre mis à jour",
        description: "L'ordre des catégories a été mis à jour avec succès.",
        className: "bg-green-600 text-white",
      });
    } catch (err) {
      // Revert on error
      await refetch();
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'ordre des catégories.",
        variant: "destructive",
      });
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const renderCategoryRow = useCallback((category: Category, depth = 0, parentId: string | null = null) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isDragging = draggedItem?.id === category.id;
    const isDragOver = dragOverItem === category.id;

    return (
      <React.Fragment key={category.id}>
        <tr 
          className={`border-b border-gray-100 ${depth % 2 === 1 ? 'bg-gray-50/30' : ''} ${
            isDragging ? 'opacity-50' : ''
          } ${isDragOver ? 'bg-blue-50' : ''} transition-all`}
          draggable={!query} // All categories can be dragged (within their level)
          onDragStart={(e) => handleDragStart(e, category.id, parentId)}
          onDragOver={(e) => handleDragOver(e, category.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, category.id, parentId)}
        >
          <td className="px-6 py-4">
            <div
              className="flex items-center"
              style={{ paddingLeft: `${depth * 24}px` }}
            >
              {!query && (
                <div className="mr-3 cursor-move text-gray-400 hover:text-gray-600">
                  <FiMove size={18} />
                </div>
              )}
              
              {hasSubcategories ? (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="mr-3 p-1 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label={isExpanded ? "Collapse category" : "Expand category"}
                >
                  {isExpanded ? (
                    <FiChevronDown className="text-gray-600" size={18} />
                  ) : (
                    <FiChevronRight className="text-gray-600" size={18} />
                  )}
                </button>
              ) : (
                <div className="w-[26px] mr-3"></div>
              )}

              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg shadow-sm mr-3">
                <Image
                  className="h-full w-full object-cover"
                  src={
                    category.smallImage ||
                    "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
                  }
                  fill={true}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  alt={category.name}
                />
              </div>

              <p className="font-medium text-gray-900">
                {category.name}
                {hasSubcategories && (
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    ({category.subcategories?.length || 0})
                  </span>
                )}
              </p>
            </div>
          </td>

          <td className="px-6 py-4">
            <div className="flex items-center justify-end space-x-3">
              <Link
                href={`/Products/Categories/UpdateCategory?categoryId=${category.id}`}
                className="group relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-gray-300 hover:text-blue-600 focus:outline-none"
                title="Modifier"
              >
                <FiEdit2 size={15} />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setCategoryToDelete({ id: category.id, name: category.name });
                  setShowDeleteModal(true);
                }}
                className="group relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-red-200 hover:text-red-600 focus:outline-none"
                title="Supprimer"
                disabled={isDeleting}
              >
                <MdDeleteOutline size={15} />
              </button>

              <Link
                target="_blank"
                href={`${process.env.NEXT_PUBLIC_BASE_URL_DOMAIN}/Collections/tunisie/?${new URLSearchParams({
                  category: category.name,
                })}`}
                className="group relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-gray-300 hover:text-green-600 focus:outline-none"
                title="Voir sur le site"
              >
                <FiExternalLink size={15} />
              </Link>
            </div>
          </td>
        </tr>

        {isExpanded &&
          category.subcategories?.map((subcategory) =>
            renderCategoryRow(subcategory, depth + 1, category.id)
          )}
      </React.Fragment>
    );
  }, [expandedCategories, toggleCategory, isDeleting, draggedItem, dragOverItem, query, categories, filteredCategories]);

  if (loading) return <Loading />;

  if (error) return (
    <div className="container mx-auto p-8">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Erreur lors du chargement des catégories</p>
        <p className="text-sm mt-1">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white border shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-between items-center border-b-2 px-6 py-4">
        <h1 className="font-bold text-xl text-gray-800">
          Catégories{" "}
          <span className="text-gray-500 font-medium text-base ml-2">
            ({filteredCategories.length || 0})
          </span>
        </h1>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <SearchBarForTables page="Products/Categories" />
        </div>

        {!query && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <FiMove size={16} />
              Glissez-déposez les catégories pour modifier leur ordre (au sein du même niveau uniquement)
            </p>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-mainColorAdminDash text-white border-b border-gray-300">
                <th className="px-6 py-4 text-left font-medium text-sm">Nom</th>
                <th className="px-6 py-4 text-right font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => renderCategoryRow(category))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium mb-2">Aucune catégorie trouvée</p>
                      <p className="text-sm text-gray-400 max-w-md">
                        {query ? "Essayez de modifier vos critères de recherche" : "Commencez par ajouter une nouvelle catégorie"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDeleteModal && categoryToDelete && (
        <DeleteModal
          sectionName="Catégorie"
          productName={categoryToDelete.name}
          onConfirm={handleDeleteCategory}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <div className="fixed bottom-6 right-6">
        <AddCategories />
      </div>
    </div>
  );
};

export default AllCategories;