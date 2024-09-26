"use client";
import React, { useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { CATEGORY_BY_ID_QUERY, CATEGORY_QUERY } from "../../../graph/queries";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import SmallSpinner from "../../components/SmallSpinner";
import { UPDATE_CATEGORY_MUTATIONS } from "../../../graph/mutations";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
  smallImage: string;
  bigImage: string;
  subcategories: Category[];
}

const UpdateCategory = ({ searchParams }: any) => {
  const { toast } = useToast();
  const categoryId = searchParams.categoryId;
  const [category, setCategory] = useState<Category | null>(null);
  const [fetchCategoryById, { loading, error, data }] =
    useLazyQuery(CATEGORY_BY_ID_QUERY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY_MUTATIONS);
  const { data: allCategories } = useQuery(CATEGORY_QUERY);

  const [formData, setFormData] = useState({
    name: "",
    parentCategory: "",
    description: "",
    smallImage: "",
    bigImage: "",
  });

  useEffect(() => {
    fetchCategoryById({
      variables: { categoryId },
      onCompleted(data) {
        setCategory(data.categoryById);
        setFormData({
          name: data.categoryById.name || "",
          parentCategory: data.categoryById.parentId || "",
          description: data.categoryById.description || "",
          smallImage: data.categoryById.smallImage || "",
          bigImage: data.categoryById.bigImage || "",
        });
      },
    });
  }, [categoryId]);

  const [uploadingImage, setUploadingImage] = useState({
    smallImageLoad: false,
    bigImageLoad: false,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { smallImage, bigImage, name, description, parentCategory } =
      formData;

    updateCategory({
      variables: {
        updateCategoryId: categoryId,
        input: {
          name,
          description,
          parentId: parentCategory,
          smallImage,
          bigImage,
        },
      },
      onCompleted() {
        toast({
          title: "Catégorie mise à jour",
          className: "text-white bg-mainColorAdminDash border-0",
          description: "La catégorie a été mise à jour avec succès.",
          duration: 5000,
        });

        setFormData({
          name: "",
          parentCategory: "",
          description: "",
          smallImage: "",
          bigImage: "",
        });
      },
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (result: any, position: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [position]: result.info.secure_url,
    }));

    setUploadingImage((prev) => ({ ...prev, [`${position}Load`]: false }));
  };

  const renderCategoryOptions = (categories: Category[] | undefined) => {
    return (
      <>
        <SelectTrigger className="w-full p-2 border border-gray-300 rounded h-12 outline-none mt-1">
          <SelectValue placeholder="Sélectionner une catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Catégories</SelectLabel>
            {categories?.map((cat) => (
              <React.Fragment key={cat.id}>
                <SelectItem
                  value={cat.id}
                  className="flex items-center font-semibold tracking-wide cursor-pointer"
                >
                  <Image
                    src={
                      cat.smallImage ||
                      "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
                    }
                    alt={
                      cat.name ||
                      "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
                    }
                    width={30}
                    height={30}
                    className="inline-block h-10 w-10 mr-2"
                  />
                  {cat.name}
                </SelectItem>
                {cat.subcategories && (
                  <SelectGroup className="ml-10">
                    {cat.subcategories.map((subcat) => (
                      <SelectItem
                        key={subcat.id}
                        value={subcat.id}
                        className="flex items-center font-semisemibold cursor-pointer"
                      >
                        <Image
                          src={
                            subcat.smallImage ||
                            "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
                          }
                          alt={
                            subcat.name ||
                            "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
                          }
                          width={30}
                          height={30}
                          className="inline-block h-10 w-10 mr-2"
                        />
                        {subcat.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </React.Fragment>
            ))}
          </SelectGroup>
        </SelectContent>
      </>
    );
  };

  return (
    <div className="container mx-auto py-10 h-full bg-white w-full">
      <h1 className="text-2xl font-semibold mb-6">
        Mettre à jour une catégorie
      </h1>
      {loading && <SmallSpinner />}
      {error && (
        <p className="text-red-500">Erreur de chargement de la catégorie</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6 h-full">
        <div className="flex gap-3 w-full">
          <div className="inputs flex flex-col gap-5 bg-white w-full shadow-sm border rounded-md p-3 h-full">
            <div className="flex space-x-4">
              <div className="flex-grow">
                <label htmlFor="name" className="text-lg font-semibold mb-10">
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Nom de la catégorie"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full py-2 px-3 border-gray-300 rounded-md outline-none border"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="parentCategory"
                className="text-lg font-semibold mb-10"
              >
                Catégorie Parentale
              </label>
              <Select
                value={formData.parentCategory}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentCategory: value })
                }
              >
                {renderCategoryOptions(allCategories?.categories)}
              </Select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-lg font-semibold mb-10"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full py-2 px-3 border-gray-300 rounded-md outline-none border"
              />
            </div>

            <div className="largeImage border shadow-sm bg-white w-full h-full p-3 rounded-md">
              <label className="block text-sm font-medium text-gray-700">
                Image de la catégorie (1700 x 443)
              </label>
              <CldUploadWidget
                uploadPreset="ita-luxury"
                onSuccess={(result, { widget }) => {
                  handleImageUpload(result, "bigImage"), widget.close();
                }}
                onOpen={() =>
                  setUploadingImage((prev) => ({ ...prev, bigImageLoad: true }))
                }
              >
                {({ open }) => (
                  <div
                    onClick={() => open()}
                    className="mt-1 flex cursor-pointer justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                  >
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <p className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          Choisissez le fichier à télécharger
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CldUploadWidget>
              {formData.bigImage && (
                <div className="w-full relative h-[120px] border flex items-center justify-center">
                  {uploadingImage.bigImageLoad && <SmallSpinner />}

                  <Image
                    src={formData.bigImage}
                    alt={formData.name}
                    layout="fill"
                    objectFit="contain"
                    onLoadingComplete={() =>
                      setUploadingImage((prev) => ({
                        ...prev,
                        bigImageLoad: false,
                      }))
                    }
                    className="border mt-3"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="smallImage border shadow-sm bg-white w-4/12 h-full p-3 rounded-md">
            <label className="block text-sm font-medium text-gray-700">
              Image de la vignette de la catégorie (120 x 120)
            </label>
            <CldUploadWidget
              uploadPreset="ita-luxury"
              onSuccess={(result, { widget }) => {
                handleImageUpload(result, "smallImage"), widget.close();
              }}
              onOpen={() =>
                setUploadingImage((prev) => ({ ...prev, smallImageLoad: true }))
              }
            >
              {({ open }) => (
                <div
                  onClick={() => open()}
                  className="mt-1 flex cursor-pointer justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                >
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <p className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        Choisissez le fichier à télécharger
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CldUploadWidget>
            {formData.smallImage && (
              <div className="w-[120px] h-[120px] border flex items-center justify-center">
                {uploadingImage.smallImageLoad && <SmallSpinner />}

                <Image
                  src={formData.smallImage}
                  alt={formData.name}
                  width={120}
                  height={120}
                  onLoadingComplete={() =>
                    setUploadingImage((prev) => ({
                      ...prev,
                      smallImageLoad: false,
                    }))
                  }
                  className="border mt-3"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mainColorAdminDash hover:opacity-80 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Mettre à jour la catégorie
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateCategory;
