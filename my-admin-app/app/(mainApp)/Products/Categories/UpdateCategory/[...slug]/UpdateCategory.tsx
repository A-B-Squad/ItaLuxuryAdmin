"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { CATEGORY_QUERY, GET_CATEGORY_BY_ID } from "@/app/graph/queries";
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
import SmallSpinner from "@/app/(mainApp)/components/SmallSpinner";
import { UPDATE_CATEGORY_MUTATION } from "@/app/graph/mutations";
import { useToast } from "@/components/ui/use-toast";
import Loading from "@/app/loading";

interface Category {
  id: string;
  name: string;
  smallImage: string;
  bigImage: string;
  subcategories: Category[];
}

const UpdateCategory = () => {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  const [formData, setFormData] = useState({
    name: "",
    parentCategory: "",
    description: "",
    smallImage: "",
    bigImage: "",
  });

  const [uploadingImage, setUploadingImage] = useState({
    smallImageLoad: false,
    bigImageLoad: false,
  });

  const { data: allCategories, loading: categoriesLoading } =
    useQuery(CATEGORY_QUERY);
  const [getCategory, { data: categoryData, loading: categoryLoading }] =
    useLazyQuery(GET_CATEGORY_BY_ID);
  const [updateCategory] = useMutation(UPDATE_CATEGORY_MUTATION);

  useEffect(() => {
    if (categoryId) {
      getCategory({ variables: { categoryId } });
    }
  }, [categoryId, getCategory]);

  useEffect(() => {
    if (categoryData?.categoryById) {
      const { name, description, parentId, smallImage, bigImage } =
        categoryData.categoryById;
      setFormData({
        name,
        description,
        parentCategory: parentId || "",
        smallImage,
        bigImage,
      });
    }
  }, [categoryData?.categoryById]);

  if (categoriesLoading || categoryLoading) return <Loading />;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { smallImage, bigImage, name, description, parentCategory } =
      formData;

    if (!smallImage || !description || !name) {
      toast({
        title: "Erreur de mise à jour",
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires.",
        duration: 5000,
      });
      return;
    }
    console.log({
      id: categoryId,
      input: {
        name,
        description,
        parentId: parentCategory,
        smallImage,
        bigImage,
      },
    });

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
      },
      onError(err) {
        toast({
          title: "Erreur",
          className: "text-white bg-red-500 border-0",
          description: err.message,
          duration: 5000,
        });
      },
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (result: any, position: string) => {
    // Transform the URL to WebP format
    const originalUrl = result.info.secure_url;
    const webpUrl = originalUrl.replace("/upload/", "/upload/f_webp,q_auto:good/");
    
    setFormData((prevFormData) => ({
      ...prevFormData,
      [position]: webpUrl,
    }));

    setUploadingImage((prev) => ({ ...prev, [`${position}Load`]: false }));
  };

  const renderCategoryOptions = (categories: Category[] | undefined) => {
    // Filter out the current category to prevent self-selection as parent
    const filteredCategories = categories?.filter(cat => cat.id !== categoryId);
    
    return (
      <>
        <SelectTrigger className="w-full p-2 border border-gray-300 rounded h-12 outline-none mt-1">
          <SelectValue placeholder="Sélectionner une catégorie" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          <SelectGroup>
            <SelectLabel className="text-lg font-semibold sticky top-0 bg-white p-2 border-b z-10">
              Catégories
            </SelectLabel>
            {filteredCategories?.map((cat) => (
              <React.Fragment key={cat.id}>
                <SelectItem
                  value={cat.id}
                  className="flex items-center font-semibold tracking-wide cursor-pointer p-2 hover:bg-gray-100"
                >
                  <div className="flex items-center w-full">
                    <Image
                      src={
                        cat.smallImage ||
                        "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
                      }
                      alt={cat.name}
                      width={30}
                      height={30}
                      className="inline-block h-8 w-8 mr-2 object-cover rounded-sm"
                    />
                    <span className="truncate">{cat.name}</span>
                  </div>
                </SelectItem>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <SelectGroup className="ml-6 border-l-2 border-gray-200 pl-2">
                    {cat.subcategories
                      .filter(subcat => subcat.id !== categoryId)
                      .map((subcat) => (
                        <SelectItem
                          key={subcat.id}
                          value={subcat.id}
                          className="flex items-center font-normal cursor-pointer p-2 hover:bg-gray-100"
                        >
                          <div className="flex items-center w-full">
                            <Image
                              src={
                                subcat.smallImage ||
                                "https://res.cloudinary.com/dc1cdbirz/image/upload/v1718970701/b23xankqdny3n1bgrvjz.png"
                              }
                              alt={subcat.name}
                              width={24}
                              height={24}
                              className="inline-block h-6 w-6 mr-2 object-cover rounded-sm"
                            />
                            <span className="truncate">{subcat.name}</span>
                          </div>
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
      <h1 className="text-2xl font-semibold mb-6">Modifier la catégorie</h1>
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
                  handleImageUpload(result, "bigImage");
                  widget.close();
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
                handleImageUpload(result, "smallImage");
                widget.close();
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
              <div className="w-full max-w-[120px] max-h-[120px] h-full border flex items-center justify-center">
                {uploadingImage.smallImageLoad && <SmallSpinner />}
                <Image
                  src={formData.smallImage}
                  alt={formData.name}
                  width={100}
                  height={100}
                  objectFit="contain"
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
