import { useQuery } from "@apollo/client";
import React, { useState, useMemo, useEffect } from "react";
import { CATEGORY_QUERY } from "@/app/graph/queries";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Load from "./Load";

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  subSubcategories: SubSubcategory[];
}

interface SubSubcategory {
  id: string;
  name: string;
}

interface SelectedIds {
  categoryId: string;
  subcategoryId: string;
  subSubcategoryId: string;
}

interface ChoiceCategoryProps {
  selectedIds: SelectedIds;
  setSelectedIds: (ids: SelectedIds) => void;
}

const defaultSelectedIds: SelectedIds = {
  categoryId: "",
  subcategoryId: "",
  subSubcategoryId: "",
};

const ChoiceCategory: React.FC<ChoiceCategoryProps> = ({
  selectedIds,
  setSelectedIds
}) => {
  // Ensure selectedIds is always properly initialized, handling null or undefined values
  const safeSelectedIds = useMemo(() => ({
    categoryId: selectedIds?.categoryId || "",
    subcategoryId: selectedIds?.subcategoryId || "",
    subSubcategoryId: selectedIds?.subSubcategoryId || "",
  }), [selectedIds]);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [orphanedSelections, setOrphanedSelections] = useState<{
    categoryName?: string;
    subcategoryName?: string;
    subSubcategoryName?: string;
  }>({});

  const { loading, error, data: AllCategory } = useQuery(CATEGORY_QUERY);

  const transformCategories = (categoriesData: any) => {
    try {
      if (!Array.isArray(categoriesData)) return [];
  
      const rootCategories = categoriesData.filter((cat: any) => !cat.parentId);
      if (!Array.isArray(rootCategories) || rootCategories.length === 0) return [];
  
      return rootCategories.map((rootCat: any) => ({
        id: rootCat.id,
        name: rootCat.name,
        subcategories: Array.isArray(rootCat.subcategories)
          ? rootCat.subcategories.map((subcat: any) => ({
              id: subcat.id,
              name: subcat.name,
              subSubcategories: Array.isArray(subcat.subcategories)
                ? subcat.subcategories.map((subSubcat: any) => ({
                    id: subSubcat.id,
                    name: subSubcat.name,
                  }))
                : [],
            }))
          : [],
      }));
    } catch (error) {
      console.error("Error transforming categories:", error);
      return [];
    }
  };
  
  useEffect(() => {
    if (AllCategory?.categories) {
      const transformedCategories = transformCategories(AllCategory.categories);
      setCategories(transformedCategories);
    } else {
      setCategories([]); 
    }
  }, [AllCategory]);
  
  // Enhanced validation with orphaned category tracking
  useEffect(() => {
    // Skip validation if categories aren't loaded yet
    if (!categories?.length) return;
    
    // Skip validation if no selectedIds are provided (new product or product without categories)
    if (!safeSelectedIds.categoryId && !safeSelectedIds.subcategoryId && !safeSelectedIds.subSubcategoryId) return;

    try {
      const newOrphanedSelections: typeof orphanedSelections = {};
      let updatedIds = { ...safeSelectedIds };
      let hasChanges = false;

      // Check if category exists
      if (safeSelectedIds.categoryId) {
        const category = categories.find(cat => cat.id === safeSelectedIds.categoryId);
        if (!category) {
          // Category was deleted - mark as orphaned
          newOrphanedSelections.categoryName = `Deleted Category (ID: ${safeSelectedIds.categoryId})`;
          updatedIds = {
            categoryId: "",
            subcategoryId: "",
            subSubcategoryId: "",
          };
          hasChanges = true;
        } else {
          // Category exists, check subcategory
          if (safeSelectedIds.subcategoryId) {
            const subcategory = category.subcategories?.find(
              sub => sub.id === safeSelectedIds.subcategoryId
            );
            if (!subcategory) {
              // Subcategory was deleted
              newOrphanedSelections.subcategoryName = `Deleted Subcategory (ID: ${safeSelectedIds.subcategoryId})`;
              updatedIds = {
                categoryId: safeSelectedIds.categoryId,
                subcategoryId: "",
                subSubcategoryId: "",
              };
              hasChanges = true;
            } else {
              // Subcategory exists, check sub-subcategory
              if (safeSelectedIds.subSubcategoryId) {
                const subSubcategory = subcategory.subSubcategories?.find(
                  sub => sub.id === safeSelectedIds.subSubcategoryId
                );
                if (!subSubcategory) {
                  // Sub-subcategory was deleted
                  newOrphanedSelections.subSubcategoryName = `Deleted Sub-subcategory (ID: ${safeSelectedIds.subSubcategoryId})`;
                  updatedIds = {
                    categoryId: safeSelectedIds.categoryId,
                    subcategoryId: safeSelectedIds.subcategoryId,
                    subSubcategoryId: "",
                  };
                  hasChanges = true;
                }
              }
            }
          }
        }
      }

      setOrphanedSelections(newOrphanedSelections);

      if (hasChanges) {
        setSelectedIds(updatedIds);
      }
    } catch (error) {
      console.error("Error validating selections:", error);
      setSelectedIds(defaultSelectedIds);
      setOrphanedSelections({});
    }
  }, [categories, safeSelectedIds.categoryId, safeSelectedIds.subcategoryId, safeSelectedIds.subSubcategoryId, setSelectedIds]);

  const getSubcategories = useMemo(() => {
    if (!safeSelectedIds.categoryId) return [];
    const category = categories.find(cat => cat.id === safeSelectedIds.categoryId);
    return category?.subcategories || [];
  }, [categories, safeSelectedIds.categoryId]);

  const getSubSubcategories = useMemo(() => {
    if (!safeSelectedIds.subcategoryId) return [];
    const subcategory = getSubcategories.find(
      subcat => subcat.id === safeSelectedIds.subcategoryId
    );
    return subcategory?.subSubcategories || [];
  }, [getSubcategories, safeSelectedIds.subcategoryId]);

  const handleCategoryChange = (value: string) => {
    setSelectedIds({
      categoryId: value || "",
      subcategoryId: "",
      subSubcategoryId: "",
    });
    setOrphanedSelections({}); // Clear orphaned selections when user makes new selection
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedIds({
      ...safeSelectedIds,
      subcategoryId: value || "",
      subSubcategoryId: "",
    });
    setOrphanedSelections(prev => ({
      ...prev,
      subcategoryName: undefined,
      subSubcategoryName: undefined
    }));
  };

  const handleSubSubcategoryChange = (value: string) => {
    setSelectedIds({
      ...safeSelectedIds,
      subSubcategoryId: value || "",
    });
    setOrphanedSelections(prev => ({
      ...prev,
      subSubcategoryName: undefined
    }));
  };

  const renderOrphanedWarning = (type: 'category' | 'subcategory' | 'subSubcategory') => {
    const messages = {
      category: orphanedSelections.categoryName,
      subcategory: orphanedSelections.subcategoryName,
      subSubcategory: orphanedSelections.subSubcategoryName,
    };

    if (!messages[type]) return null;

    return (
      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          ⚠️ {messages[type]} - Please select a new {type}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-52 relative border bg-[#ffffffc2] rounded-md flex items-center justify-center w-full">
        <Load />
      </div>
    );
  }

  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="category bg-white rounded-md shadow-md p-3">
        <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
          Catégorie
        </label>
        <Select
          value={safeSelectedIds.categoryId || ""}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-full p-2 border border-gray-300 rounded mt-1">
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Catégories</SelectLabel>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {renderOrphanedWarning('category')}
      </div>

      <div className="subcategory bg-white rounded-md shadow-md p-3">
        <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
          Sous-catégorie
        </label>
        <Select
          value={safeSelectedIds.subcategoryId || ""}
          onValueChange={handleSubcategoryChange}
          disabled={!safeSelectedIds.categoryId}
        >
          <SelectTrigger className="w-full p-2 border border-gray-300 rounded mt-1">
            <SelectValue placeholder="Sélectionner une sous-catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sous-catégories</SelectLabel>
              {getSubcategories?.map((subcat) => (
                <SelectItem key={subcat.id} value={subcat.id}>
                  {subcat.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {renderOrphanedWarning('subcategory')}
      </div>

      <div className="subSubcategory bg-white rounded-md shadow-md p-3">
        <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
          Sous-sous-catégorie
        </label>
        <Select
          value={safeSelectedIds.subSubcategoryId || ""}
          onValueChange={handleSubSubcategoryChange}
          disabled={!safeSelectedIds.subcategoryId}
        >
          <SelectTrigger className="w-full p-2 border border-gray-300 rounded mt-1">
            <SelectValue placeholder="Sélectionner une sous-sous-catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sous-sous-catégories</SelectLabel>
              {getSubSubcategories?.map((subSubcat) => (
                <SelectItem key={subSubcat.id} value={subSubcat.id}>
                  {subSubcat.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {renderOrphanedWarning('subSubcategory')}
      </div>
    </div>
  );
};

export default ChoiceCategory;