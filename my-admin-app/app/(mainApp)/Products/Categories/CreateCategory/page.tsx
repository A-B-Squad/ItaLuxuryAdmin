"use client";
import React, { useState, useCallback } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { useMutation, useQuery } from "@apollo/client";
import { CATEGORY_QUERY } from "../../../../graph/queries";
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
import SmallSpinner from "../../../components/SmallSpinner";
import { CREATE_CATEGORY_MUTATIONS } from "../../../../graph/mutations";
import { useToast } from "@/components/ui/use-toast";
import Loading from "./loading";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  smallImage: string;
  bigImage: string;
  subcategories: Category[];
}

const CreateCategory = () => {
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    parentCategory: "",
    description: "",
    smallImage: "",
    bigImage: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
    smallImage: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState({
    smallImageLoad: false,
    bigImageLoad: false,
  });

  const { data: allCategories, loading } = useQuery(CATEGORY_QUERY);
  const [createCategory] = useMutation(CREATE_CATEGORY_MUTATIONS);

  const validateForm = useCallback(() => {
    const errors = {
      name: "",
      description: "",
      smallImage: "",
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Le nom de la catégorie est requis";
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = "La description est requise";
      isValid = false;
    }

    if (!formData.smallImage) {
      errors.smallImage = "L'image de vignette est requise";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Formulaire incomplet",
        variant: "destructive",
        description: "Veuillez corriger les erreurs dans le formulaire.",
        duration: 5000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createCategory({
        variables: {
          input: {
            name: formData.name,
            description: formData.description,
            parentId: formData.parentCategory || null,
            smallImage: formData.smallImage,
            bigImage: formData.bigImage || null,
          },
        },
      });

      toast({
        title: "Catégorie créée",
        className: "text-white bg-mainColorAdminDash border-0",
        description: "La catégorie a été créée avec succès.",
        duration: 5000,
      });

      // Reset form
      setFormData({
        name: "",
        parentCategory: "",
        description: "",
        smallImage: "",
        bigImage: "",
      });

      // Navigate to categories list
      router.push("/Products/Categories");
      router.refresh();

    } catch (error: any) {
      toast({
        title: "Erreur",
        className: "text-white bg-red-500 border-0",
        description: error.message || "Une erreur est survenue",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  }, [formErrors]);

  const handleImageUpload = useCallback((result: any, position: "smallImage" | "bigImage") => {
    const optimizedUrl = result.info.secure_url.replace(
      "/upload/",
      "/upload/f_auto,q_auto/"
    );

    setFormData(prev => ({
      ...prev,
      [position]: optimizedUrl,
    }));



    setUploadingImage(prev => ({
      ...prev,
      [`${position}Load`]: false
    }));

    // Clear error when image is uploaded
    if (position === "smallImage" && formErrors.smallImage) {
      setFormErrors(prev => ({
        ...prev,
        smallImage: "",
      }));
    }
  }, [formErrors]);

  const renderCategoryOptions = (categories: Category[] | undefined) => {
    if (!categories || categories.length === 0) {
      return (
        <SelectTrigger className="w-full p-2 border border-gray-300 rounded h-12 outline-none mt-1">
          <SelectValue placeholder="Aucune catégorie disponible" />
        </SelectTrigger>
      );
    }

    return (
      <>
        <SelectTrigger className="w-full p-2 border border-gray-300 rounded h-12 outline-none mt-1">
          <SelectValue placeholder="Sélectionner une catégorie (optionnel)" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Catégories</SelectLabel>
            {categories.map((cat) => (
              <React.Fragment key={cat.id}>
                <SelectItem
                  value={cat.id}
                  className="flex items-center font-semibold tracking-wide cursor-pointer"
                >
                  {cat.smallImage && (
                    <Image
                      src={cat.smallImage}
                      alt={cat.name}
                      width={30}
                      height={30}
                      className="inline-block h-10 w-10 mr-2"
                    />
                  )}
                  {cat.name}
                </SelectItem>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <SelectGroup className="ml-10">
                    {cat.subcategories.map((subcat) => (
                      <SelectItem
                        key={subcat.id}
                        value={subcat.id}
                        className="flex items-center font-semisemibold cursor-pointer"
                      >
                        {subcat.smallImage && (
                          <Image
                            src={subcat.smallImage}
                            alt={subcat.name}
                            width={30}
                            height={30}
                            className="inline-block h-10 w-10 mr-2"
                          />
                        )}
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

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto py-10 h-full bg-white w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Créer une catégorie</h1>
        <button
          onClick={() => router.push("/Products/Categories")}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Retour aux catégories
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 h-full">
        <div className="flex gap-3 w-full">
          <div className="inputs flex flex-col gap-5 bg-white w-full shadow-sm border rounded-md p-5 h-full">
            <div className="flex space-x-4">
              <div className="flex-grow">
                <label htmlFor="name" className="text-lg font-semibold mb-1 block">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Nom de la catégorie"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`block w-full py-2 px-3 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="parentCategory"
                className="text-lg font-semibold mb-1 block"
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
              <p className="mt-1 text-sm text-gray-500">
                Optionnel - Sélectionnez une catégorie parente si vous créez une sous-catégorie
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-lg font-semibold mb-1 block"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`mt-1 block w-full py-2 px-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.description ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
              )}
            </div>

            <div className="largeImage border shadow-sm bg-white w-full h-full p-4 rounded-md">
              <label className="block text-lg font-semibold mb-2">
                Image de bannière
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Format recommandé: 1700 x 443 pixels
              </p>
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
                    className="mt-1 flex cursor-pointer justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors"
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
                      <div className="flex justify-center text-sm text-gray-600">
                        <p className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                          Choisissez le fichier à télécharger
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF jusqu'à 10MB
                      </p>
                    </div>
                  </div>
                )}
              </CldUploadWidget>
              {formData.bigImage && (
                <div className="w-full relative h-[120px] border mt-3 rounded overflow-hidden">
                  {uploadingImage.bigImageLoad ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <SmallSpinner />
                    </div>
                  ) : (
                    <Image
                      src={formData.bigImage}
                      alt={formData.name || "Image de bannière"}
                      layout="fill"
                      objectFit="contain"
                      className="p-2"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="smallImage border shadow-sm bg-white w-4/12 h-full p-5 rounded-md">
            <label className="block text-lg font-semibold mb-2">
              Image de vignette <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Format recommandé: 120 x 120 pixels
            </p>
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
                  className={`mt-1 flex cursor-pointer justify-center px-6 pt-5 pb-6 border-2 rounded-md hover:border-blue-400 transition-colors ${formErrors.smallImage ? "border-red-500 border-dashed" : "border-gray-300 border-dashed"
                    }`}
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
                    <div className="flex justify-center text-sm text-gray-600">
                      <p className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        Choisissez le fichier à télécharger
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF jusqu'à 10MB
                    </p>
                  </div>
                </div>
              )}
            </CldUploadWidget>
            {formData.smallImage && (
              <div className="w-full relative h-[120px] border mt-3 rounded-md overflow-hidden flex items-center justify-center">
                {uploadingImage.smallImageLoad ? (
                  <SmallSpinner />
                ) : (
                  <Image
                    src={formData.smallImage}
                    alt={formData.name || "Vignette de catégorie"}
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                )}
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">
                Cette image sera utilisée comme icône de la catégorie dans les menus et les listes.
              </p>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mainColorAdminDash hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Créer la catégorie
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;
