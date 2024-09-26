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

const ChoiceCategory = ({ selectedIds, setSelectedIds }: any) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { loading, error, data: AllCategory } = useQuery(CATEGORY_QUERY);

  useEffect(() => {
    if (AllCategory) {
      const transformedCategories = transformCategories(AllCategory.categories);
      setCategories(transformedCategories);
    }
  }, [AllCategory]);

  const transformCategories = (categoriesData: any) => {
    return (
      categoriesData?.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        subcategories:
          cat?.subcategories?.map((subcat: any) => ({
            id: subcat.id,
            name: subcat.name,
            subSubcategories: subcat?.subcategories?.map((subSubcat: any) => ({
              id: subSubcat.id,
              name: subSubcat.name,
            })),
          })) || [],
      })) || []
    );
  };

  const handleCategoryChange = (value: string) => {
    setSelectedIds({
      categoryId: value,
      subcategoryId: "",
      subSubcategoryId: "",
    });
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedIds({
      ...selectedIds,
      subcategoryId: value,
      subSubcategoryId: "",
    });
  };

  const handleSubSubcategoryChange = (value: string) => {
    setSelectedIds({
      ...selectedIds,
      subSubcategoryId: value,
    });
  };

  const getSubcategories = useMemo(() => {
    const selectedCategoryObj = categories.find(
      (cat) => cat.id === selectedIds.categoryId,
    );
    return selectedCategoryObj ? selectedCategoryObj.subcategories : [];
  }, [categories, selectedIds.categoryId]);

  const getSubSubcategories = useMemo(() => {
    const selectedSubcategoryObj = getSubcategories.find(
      (subcat) => subcat.id === selectedIds.subcategoryId,
    );
    return selectedSubcategoryObj
      ? selectedSubcategoryObj.subSubcategories
      : [];
  }, [getSubcategories, selectedIds.subcategoryId]);

  const getSelectedIdsArray = (): string[] => {
    const selectedIdsArray = [];
    if (selectedIds.categoryId) selectedIdsArray.push(selectedIds.categoryId);
    if (selectedIds.subcategoryId)
      selectedIdsArray.push(selectedIds.subcategoryId);
    if (selectedIds.subSubcategoryId)
      selectedIdsArray.push(selectedIds.subSubcategoryId);
    return selectedIdsArray;
  };

  useEffect(() => {
    getSelectedIdsArray();
  }, [selectedIds]);

  if (loading)
    return (
      <div className=" h-52 relative border bg-[#ffffffc2] rounded-md flex items-center justify-center w-full">
        <Load />
      </div>
    );
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="category bg-white rounded-md shadow-md p-3">
        <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
          Catégorie
        </label>
        <Select
          value={selectedIds.categoryId || ""}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-full p-2 border border-gray-300 rounded mt-1">
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Catégories</SelectLabel>
              {categories?.map((cat, idx) => (
                <SelectItem key={idx} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="subcategory bg-white rounded-md shadow-md p-3">
        <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
          Sous-catégorie
        </label>
        <Select
          value={selectedIds.subcategoryId || ""}
          onValueChange={handleSubcategoryChange}
        >
          <SelectTrigger className="w-full p-2 border border-gray-300 rounded mt-1">
            <SelectValue placeholder="Sélectionner une sous-catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sous-catégories</SelectLabel>
              {getSubcategories?.map((subcat, idx) => (
                <SelectItem key={idx} value={subcat.id}>
                  {subcat.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="subSubcategory bg-white rounded-md shadow-md p-3">
        <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
          Sous-sous-catégorie
        </label>
        <Select
          value={selectedIds.subSubcategoryId || ""}
          onValueChange={handleSubSubcategoryChange}
        >
          <SelectTrigger className="w-full p-2 border border-gray-300 rounded mt-1">
            <SelectValue placeholder="Sélectionner une sous-sous-catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sous-sous-catégories</SelectLabel>
              {getSubSubcategories?.map((subSubcat, idx) => (
                <SelectItem key={idx} value={subSubcat.id}>
                  {subSubcat.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ChoiceCategory;
