import React, { useState, useMemo } from "react";
import { FaBox, FaEye, FaCheck, FaSearch } from "react-icons/fa";


interface ConditionsSelectorProps {
  conditions: any;
  setConditions: (conditions: any) => void;
  categories: any[];
  brands: any[];
}

export default function ConditionsSelector({
  conditions,
  setConditions,
  categories,
  brands,
}: ConditionsSelectorProps) {
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Filter brands based on search
  const filteredBrands = useMemo(() => {
    if (!brandSearch) return brands;
    return brands.filter(brand =>
      brand.name.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [brands, brandSearch]);

  const selectedCategoriesCount = conditions.categoryIds?.length || 0;
  const selectedBrandsCount = conditions.brandIds?.length || 0;

  // Toggle all categories
  const handleToggleAllCategories = () => {
    if (selectedCategoriesCount === categories.length) {
      setConditions({ ...conditions, categoryIds: [] });
    } else {
      setConditions({ ...conditions, categoryIds: categories.map((c: any) => c.id) });
    }
  };

  // Toggle all brands
  const handleToggleAllBrands = () => {
    if (selectedBrandsCount === brands.length) {
      setConditions({ ...conditions, brandIds: [] });
    } else {
      setConditions({ ...conditions, brandIds: brands.map((b: any) => b.id) });
    }
  };

  // Toggle individual category
  const handleToggleCategory = (categoryId: string) => {
    const currentIds = conditions.categoryIds || [];
    const newIds = currentIds.includes(categoryId)
      ? currentIds.filter((id: string) => id !== categoryId)
      : [...currentIds, categoryId];
    setConditions({ ...conditions, categoryIds: newIds });
  };

  // Toggle individual brand
  const handleToggleBrand = (brandId: string) => {
    const currentIds = conditions.brandIds || [];
    const newIds = currentIds.includes(brandId)
      ? currentIds.filter((id: string) => id !== brandId)
      : [...currentIds, brandId];
    setConditions({ ...conditions, brandIds: newIds });
  };

  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix Minimum (DT)
          </label>
          <input
            type="number"
            value={conditions.minPrice || ""}
            onChange={(e) =>
              setConditions({
                ...conditions,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.000"
            min="0"
            step="0.001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix Maximum (DT)
          </label>
          <input
            type="number"
            value={conditions.maxPrice || ""}
            onChange={(e) =>
              setConditions({
                ...conditions,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="∞"
            min="0"
            step="0.001"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Catégories {selectedCategoriesCount > 0 && (
              <span className="text-blue-600 font-semibold">({selectedCategoriesCount} sélectionnées)</span>
            )}
          </label>
          <button
            type="button"
            onClick={handleToggleAllCategories}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {selectedCategoriesCount === categories.length ? "Tout désélectionner" : "Tout sélectionner"}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Rechercher une catégorie..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Category List */}
        <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat: any) => {
              const isSelected = conditions.categoryIds?.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition ${isSelected ? "bg-blue-50" : ""
                    } border-b border-gray-200 last:border-b-0`}
                >
                  <span className={`text-sm ${isSelected ? "font-medium text-blue-900" : "text-gray-700"}`}>
                    {cat.name}
                  </span>
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleCategory(cat.id);
                    }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${isSelected
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300 hover:border-blue-400"
                      }`}
                  >
                    {isSelected && <FaCheck className="w-3 h-3 text-white" />}
                  </div>
                </label>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              Aucune catégorie trouvée
            </div>
          )}
        </div>
      </div>

      {/* Brands */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Marques {selectedBrandsCount > 0 && (
              <span className="text-blue-600 font-semibold">({selectedBrandsCount} sélectionnées)</span>
            )}
          </label>
          <button
            type="button"
            onClick={handleToggleAllBrands}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {selectedBrandsCount === brands.length ? "Tout désélectionner" : "Tout sélectionner"}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Rechercher une marque..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Brand List */}
        <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand: any) => {
              const isSelected = conditions.brandIds?.includes(brand.id);
              return (
                <label
                  key={brand.id}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition ${isSelected ? "bg-blue-50" : ""
                    } border-b border-gray-200 last:border-b-0`}
                >
                  <span className={`text-sm ${isSelected ? "font-medium text-blue-900" : "text-gray-700"}`}>
                    {brand.name}
                  </span>
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleBrand(brand.id);
                    }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${isSelected
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300 hover:border-blue-400"
                      }`}
                  >
                    {isSelected && <FaCheck className="w-3 h-3 text-white" />}
                  </div>
                </label>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              Aucune marque trouvée
            </div>
          )}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FaEye className="w-5 h-5 text-blue-600" />
            Produits Visibles Uniquement
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={conditions.isVisible}
              onChange={(e) =>
                setConditions({ ...conditions, isVisible: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>

        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FaBox className="w-5 h-5 text-green-600" />
            Produits en Stock Uniquement
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={conditions.hasInventory}
              onChange={(e) =>
                setConditions({ ...conditions, hasInventory: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </div>
        </label>
      </div>
    </div>
  );
}