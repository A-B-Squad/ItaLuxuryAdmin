"use client";
import React, { useEffect, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { BiShow } from "react-icons/bi";
import { MdDeleteOutline } from "react-icons/md";
import { CATEGORY_QUERY } from "../../graph/queries";
import { useMutation, useQuery } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { DELETE_CATEGORIES_MUTATIONS } from "../../graph/mutations";
import SearchBar from "../../components/SearchBar";
import Loading from "./loading";
import { CiSquareMinus, CiSquarePlus } from "react-icons/ci";
import AddCategories from "./AddCategoriesButton";
import prepRoute from "../../Helpers/_prepRoute";

const Categories = ({ searchParams }: any) => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const query = searchParams.q;
  const { data, loading, error, refetch } = useQuery(CATEGORY_QUERY);
  const [deleteCategoriesMutation] = useMutation(DELETE_CATEGORIES_MUTATIONS);

  useEffect(() => {
    if (data && data.categories) {
      setCategories(data.categories);
    }
  }, [data]);

  const filterAndSortCategories = (categorie: any) => {
    let filteredCategories = categories;

    // Filter categories based on search query
    if (query) {
      filteredCategories = filteredCategories.filter(
        (category: { name: string }) =>
          category.name.toLowerCase().includes(query.toLowerCase()),
      );
    }
    return filteredCategories;
  };

  const filteredCategories = filterAndSortCategories(categories);

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategoriesMutation({
        variables: {
          deleteCategoryId: categoryToDelete.id,
        },
      });
      // Refetch the categories to get the updated list
      await refetch();
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      // You might want to show an error message to the user here
    }
  };

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

  const renderCategoryRow = (category: any, depth = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasSubcategories =
      category.subcategories && category.subcategories.length > 0;

    return (
      <>
        <tr className="text-gray-700" key={category.id}>
          <td className="px-4 py-3 border">
            <div
              className="flex items-center   text-sm"
              style={{ paddingLeft: `${depth * 20}px` }}
            >
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
              <div className="relative w-12 h-12 mr-3 rounded-full border">
                <Image
                  className=" w-full h-full rounded-full"
                  src={
                    category.smallImage ||
                    "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
                  }
                  layout="fill"
                  objectFit="contain"
                  alt=""
                />
              </div>
              <p className="font-semibold text-black">{category.name}</p>
            </div>
          </td>

          <td className="px-4 py-3 text-sm border">
            <div className="flex justify-center items-center gap-2">
              <Link
                href={`/UpdateCategory?categoryId=${category.id}`}
                className="p-2 w-10 h-10 hover:opacity-40 transition-opacity shadow-md rounded-full border-2"
              >
                <FiEdit2 size={20} />
              </Link>
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
              <Link
                target="_blank"
                href={`http://localhost:3000/Collections/tunisie/${prepRoute(
                  category.name,
                )}/?category=${category.id}`}
                className="p-2 hover:opacity-40 transition-opacity shadow-md w-10 h-10 rounded-full border-2"
              >
                <BiShow size={20} />
              </Link>
            </div>
          </td>
        </tr>
        {isExpanded &&
          category.subcategories?.map((subcategory: any) =>
            renderCategoryRow(subcategory, depth + 1),
          )}
      </>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Loading />
      </div>
    );
  if (error) return <p>Error loading categories</p>;

  return (
    <div className="container mx-auto relative border shadow-md rounded-sm pb-24">
      <h1 className="font-bold text-xl py-5 px-4 border-b-2">
        Catégories{"  "}
        <span className="text-gray-600 font-medium text-base">
          ({categories.length || 0})
        </span>
      </h1>
      <div className="mt-5">
        <SearchBar page="Products/Categories" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-sm font-semibold text-gray-900 bg-gray-100 border-b border-gray-600">
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white border">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) =>
                  renderCategoryRow(category),
                )
              ) : (
                <>
                  <tr className="bg-gray-50">
                    <td className="text-center  w-full py-5   ">
                      Aucune catégorie trouvée
                    </td>
                    <td className="text-center  w-full py-5 "></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
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
      <AddCategories />
    </div>
  );
};

export default Categories;
