import { useQuery } from "@apollo/client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { MAIN_CATEGORY_QUERY } from "@/app/graph/queries";

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
  subcategories: SubSubcategory[];
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
  setSelectedIds,
}) => {
  const safeSelectedIds = useMemo(
    () => ({
      categoryId: selectedIds?.categoryId || "",
      subcategoryId: selectedIds?.subcategoryId || "",
      subSubcategoryId: selectedIds?.subSubcategoryId || "",
    }),
    [selectedIds]
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [orphanedSelections, setOrphanedSelections] = useState<{
    categoryName?: string;
    subcategoryName?: string;
    subSubcategoryName?: string;
  }>({});

  const { loading, error, data: AllCategory } = useQuery(MAIN_CATEGORY_QUERY);

  useEffect(() => {
    if (AllCategory?.fetchMainCategories) {
      setCategories(AllCategory.fetchMainCategories);
    } else {
      setCategories([]);
    }
  }, [AllCategory]);

  const validateSelections = useCallback(() => {
    if (!categories?.length) return;
    if (
      !safeSelectedIds.categoryId &&
      !safeSelectedIds.subcategoryId &&
      !safeSelectedIds.subSubcategoryId
    )
      return;

    try {
      const newOrphanedSelections: typeof orphanedSelections = {};
      let updatedIds = { ...safeSelectedIds };
      let hasChanges = false;

      //  Check category
      if (safeSelectedIds.categoryId) {
        const category = categories.find(
          (cat) => cat.id === safeSelectedIds.categoryId
        );
        if (!category) {
          newOrphanedSelections.categoryName = `Deleted Category (ID: ${safeSelectedIds.categoryId})`;
          updatedIds = { categoryId: "", subcategoryId: "", subSubcategoryId: "" };
          hasChanges = true;
        } else {
          //  Check subcategory
          if (safeSelectedIds.subcategoryId) {
            const subcategory = category.subcategories?.find(
              (sub) => sub.id === safeSelectedIds.subcategoryId
            );
            if (!subcategory) {
              newOrphanedSelections.subcategoryName = `Deleted Subcategory (ID: ${safeSelectedIds.subcategoryId})`;
              updatedIds = {
                categoryId: safeSelectedIds.categoryId,
                subcategoryId: "",
                subSubcategoryId: "",
              };
              hasChanges = true;
            } else {
              //  Check sub-subcategory
              if (safeSelectedIds.subSubcategoryId) {
                const subSubcategory = subcategory.subcategories?.find(
                  (sub) => sub.id === safeSelectedIds.subSubcategoryId
                );
                if (!subSubcategory) {
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
  }, [categories, safeSelectedIds, setSelectedIds]);

  useEffect(() => {
    validateSelections();
  }, [validateSelections]);

  const getSubcategories = useMemo(() => {
    if (!safeSelectedIds.categoryId) return [];
    const category = categories.find(
      (cat) => cat.id === safeSelectedIds.categoryId
    );
    return category?.subcategories || [];
  }, [categories, safeSelectedIds.categoryId]);

  const getSubSubcategories = useMemo(() => {
    if (!safeSelectedIds.subcategoryId) return [];
    const subcategory = getSubcategories.find(
      (subcat) => subcat.id === safeSelectedIds.subcategoryId
    );
    return subcategory?.subcategories || [];
  }, [getSubcategories, safeSelectedIds.subcategoryId]);

  const handleCategoryChange = useCallback(
    (value: string) => {
      setSelectedIds({
        categoryId: value || "",
        subcategoryId: "",
        subSubcategoryId: "",
      });
      setOrphanedSelections({});
    },
    [selectedIds]
  );

  const handleSubcategoryChange = useCallback(
    (value: string) => {
      setSelectedIds({
        ...safeSelectedIds,
        subcategoryId: value || "",
        subSubcategoryId: "",
      });
      setOrphanedSelections((prev) => ({
        ...prev,
        subcategoryName: undefined,
        subSubcategoryName: undefined,
      }));
    },
    [safeSelectedIds, setSelectedIds]
  );

  const handleSubSubcategoryChange = useCallback(
    (value: string) => {
      setSelectedIds({
        ...safeSelectedIds,
        subSubcategoryId: value || "",
      });
      setOrphanedSelections((prev) => ({
        ...prev,
        subSubcategoryName: undefined,
      }));
    },
    [safeSelectedIds, setSelectedIds]
  );

  const renderOrphanedWarning = useCallback(
    (type: "category" | "subcategory" | "subSubcategory") => {
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
    },
    [orphanedSelections]
  );

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
      {/* Category */}
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
        {renderOrphanedWarning("category")}
      </div>

      {/* Subcategory */}
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
        {renderOrphanedWarning("subcategory")}
      </div>

      {/* Sub-subcategory */}
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
        {renderOrphanedWarning("subSubcategory")}
      </div>
    </div>
  );
};

export default ChoiceCategory;
