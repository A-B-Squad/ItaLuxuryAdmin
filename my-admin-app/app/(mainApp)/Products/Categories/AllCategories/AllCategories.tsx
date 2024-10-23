"use client";
import React, { useEffect, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { BiShow } from "react-icons/bi";
import { MdDeleteOutline } from "react-icons/md";
import { CATEGORY_QUERY } from "@/app/graph/queries";
import { useMutation, useQuery } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import SearchBarForTables from "@/app/(mainApp)/components/SearchBarForTables";
import { CiSquareMinus, CiSquarePlus } from "react-icons/ci";
import AddCategories from "../components/AddCategoriesButton";
import prepRoute from "@/app/(mainApp)/Helpers/_prepRoute";
import Loading from "@/app/loading";
import { useToast } from "@/components/ui/use-toast";
import { DELETE_CATEGORIES_MUTATIONS } from "../../../../graph/mutations";

// Main component for displaying and managing categories
const AllCategories = ({ searchParams }: any) => {
  console.log(searchParams);

  //toast for notification
  const { toast } = useToast();

  // State management
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Extract search query from URL parameters
  const query = searchParams.q;

  // Fetch categories data using Apollo Client
  const { data, loading, error, refetch } = useQuery(CATEGORY_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  const [deleteCategoriesMutation] = useMutation(DELETE_CATEGORIES_MUTATIONS);

  // Update categories state when data is fetched
  useEffect(() => {
    if (data && data.categories) {
      setCategories(data.categories);
    }
  }, [data]);

  // Recursive function to search through categories and subcategories
  const filterAndSortCategories = (categoriesList: any) => {
    // If no search query is provided, return all categories
    if (!query) {
      return categoriesList;
    }

    let filteredCategories = categoriesList
      .map((category: any) => {
        // Check if the category name matches the search query
        const isMatch = category.name
          .toLowerCase()
          .includes(query.toLowerCase());

        // Recursively search in subcategories
        const matchedSubcategories = category.subcategories
          ? filterAndSortCategories(category.subcategories)
          : [];

        // If there's a match in either the category or its subcategories, return the category
        if (isMatch || matchedSubcategories.length > 0) {
          return {
            ...category,
            subcategories: matchedSubcategories, // Include only matching subcategories
          };
        }

        return null;
      })
      .filter((category: any) => category !== null);

    return filteredCategories;
  };

  const filteredCategories = filterAndSortCategories(categories);

  // Handle category deletion
  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;

    deleteCategoriesMutation({
      variables: {
        deleteCategoryId: categoryToDelete.id,
      },
      onCompleted: () => {
        toast({
          title: "Succès",
          className: "text-white bg-green-500 border-0",
          description: `La catégorie "${categoryToDelete.name}" a été supprimée avec succès.`,
          duration: 5000,
        });
        refetch();
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      },
      onError: (err) => {
        toast({
          title: "Erreur",
          className: "text-white bg-red-500 border-0",
          description: `Error deleting category: ${err}`,
          duration: 5000,
        });
      },
    });
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Render a single category row (recursive for subcategories)
  const renderCategoryRow = (category: any, depth = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasSubcategories =
      category.subcategories && category.subcategories.length > 0;

    return (
      <>
        <tr className="text-gray-700" key={category.id}>
          {/* Category name and image */}
          <td className="px-4 py-3 border">
            <div
              className="flex items-center text-sm"
              style={{ paddingLeft: `${depth * 20}px` }}
            >
              {/* Expand/collapse button for categories with subcategories */}
              {hasSubcategories && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="mr-2"
                >
                  {isExpanded ? (
                    <CiSquareMinus
                      color="#a8a8a8"
                      className="outline-none"
                      size={30}
                    />
                  ) : (
                    <CiSquarePlus
                      color="black"
                      className="outline-none"
                      size={30}
                    />
                  )}
                </button>
              )}
              {/* Category image */}
              <div className="relative w-12 h-12 mr-3 rounded-full border">
                <Image
                  className="w-full h-full rounded-full"
                  src={
                    category.smallImage ||
                    "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
                  }
                  layout="fill"
                  objectFit="contain"
                  alt=""
                />
              </div>
              {/* Category name */}
              <p className="font-semibold text-black">{category.name}</p>
            </div>
          </td>

          {/* Action buttons */}
          <td className="px-4 py-3 text-sm border">
            <div className="flex justify-center items-center gap-2">
              {/* Edit button */}
              <Link
                href={`/Products/UpdateCategory?categoryId=${category.id}`}
                className="p-2 w-10 h-10 hover:opacity-40 transition-opacity shadow-md rounded-full border-2"
              >
                <FiEdit2 size={20} />
              </Link>
              {/* Delete button */}
              <button
                type="button"
                onClick={() => {
                  setCategoryToDelete({ id: category.id, name: category.name });
                  setShowDeleteModal(true);
                }}
                className="p-2 w-10 h-10 hover:opacity-40 transition-opacity shadow-md rounded-full border-2"
              >
                <MdDeleteOutline size={20} />
              </button>
              {/* View button */}
              <Link
                target="_blank"
                href={`${
                  process.env.NEXT_PUBLIC_BASE_URL_DOMAIN
                }/Collections/tunisie/${prepRoute(category.name)}/?category=${
                  category.name
                }&categories=${encodeURIComponent(category.name)}`}
                className="p-2 hover:opacity-40 transition-opacity shadow-md w-10 h-10 rounded-full border-2"
              >
                <BiShow size={20} />
              </Link>
            </div>
          </td>
        </tr>
        {/* Render subcategories if expanded */}
        {isExpanded &&
          category.subcategories?.map((subcategory: any) =>
            renderCategoryRow(subcategory, depth + 1),
          )}
      </>
    );
  };

  // Show loading state while fetching data
  if (loading) return <Loading />;

  // Show error message if data fetch fails
  if (error) return <p>Error loading categories</p>;

  return (
    <div className="container mx-auto relative border shadow-md rounded-sm pb-24">
      {/* Header */}
      <h1 className="font-bold text-xl py-5 px-4 border-b-2">
        Catégories{"  "}
        <span className="text-gray-600 font-medium text-base">
          ({categories.length || 0})
        </span>
      </h1>
      <div className="mt-5">
        {/* Search bar component */}
        <SearchBarForTables page="Products/Categories" />
        <div className="overflow-x-auto">
          {/* Categories table */}
          <table className="w-full shadow-md">
            <thead className="bg-mainColorAdminDash text-white">
              <tr>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category: any) =>
                  renderCategoryRow(category),
                )
              ) : (
                <tr>
                  <td colSpan={2} className="text-center py-5">
                    Aucune catégorie trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="my-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete Category
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the category "
                  {categoryToDelete?.name}"? Cette action est irréversible.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2"
                  onClick={handleDeleteCategory}
                >
                  Delete
                </button>
                <button
                  id="cancel-btn"
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Component for adding new categories */}
      <AddCategories />
    </div>
  );
};

export default AllCategories;
