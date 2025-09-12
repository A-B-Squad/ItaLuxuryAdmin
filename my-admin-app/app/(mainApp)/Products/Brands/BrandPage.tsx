"use client";
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

import {
  DELETE_BRAND_MUTATION,
  ADD_BRAND_MUTATION,
} from "@/app/graph/mutations";
import { GET_BRANDS } from "@/app/graph/queries";
import { useToast } from "@/components/ui/use-toast";
import Loading from "../loading";

interface Brand {
  id: string;
  name: string;
  logo: string;
  Category?: {
    id: string;
    name: string;
  };
}

interface UploadResult {
  info: {
    secure_url: string;
  };
}

interface GetBrandsData {
  fetchBrands: Brand[];
}

const BrandPage = () => {
  const { data, loading, error } = useQuery<GetBrandsData>(GET_BRANDS);
  const [addBrand] = useMutation(ADD_BRAND_MUTATION);
  const [deleteBrand] = useMutation(DELETE_BRAND_MUTATION);
  const { toast } = useToast();

  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandLogo, setNewBrandLogo] = useState("");

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName || !newBrandLogo) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    // Check if the brand name already exists
    const brandExists = data?.fetchBrands.some(
      (brand) => brand.name.toLowerCase() === newBrandName.toLowerCase(),
    );

    if (brandExists) {
      toast({
        title: "Erreur",
        description: "Une marque avec ce nom existe déjà",
        variant: "destructive",
      });
      return;
    }

    try {
      await addBrand({
        variables: {
          name: newBrandName,
          logo: newBrandLogo,
        },
        refetchQueries: [{ query: GET_BRANDS }],
      });
      toast({
        title: "Succès",
        description: "Marque ajoutée avec succès",
        className: "bg-mainColorAdminDash text-white",
      });
      setNewBrandName("");
      setNewBrandLogo("");
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Échec de l'ajout de la marque",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await deleteBrand({
        variables: { brandId: id },
        refetchQueries: [{ query: GET_BRANDS }],
      });
      toast({
        title: "Succès",
        description: "Marque supprimée avec succès",
        className: "bg-mainColorAdminDash text-white",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Échec de la suppression de la marque",
        variant: "destructive",
      });
    }
  };

  const handleUploadSuccess = (result: UploadResult) => {
    // Transform the URL to WebP format while preserving original dimensions
    const originalUrl = result.info.secure_url;
    const webpUrl = originalUrl.replace("/upload/", "/upload/f_webp,q_auto:good/");

    setNewBrandLogo(webpUrl);
    toast({
      title: "Succès",
      description: "Image téléchargée avec succès",
      className: "bg-mainColorAdminDash text-white",
    });
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <p className="text-center text-xl mt-8 text-red-500">
        Erreur: {error.message}
      </p>
    );

  return (
    <div className="w-full bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto container">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
          Gestion des Marques
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Ajouter une Nouvelle Marque
              </h2>
              <form onSubmit={handleAddBrand} className="space-y-6">
                <div>
                  <label
                    htmlFor="brandName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom de la Marque
                  </label>
                  <input
                    type="text"
                    id="brandName"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Entrez le nom de la marque"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo de la Marque
                  </label>
                  <CldUploadWidget
                    uploadPreset="ita-luxury"
                    onSuccess={(result: any, { widget }) => {
                      handleUploadSuccess(result);
                      widget.close();
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Télécharger le Logo
                      </button>
                    )}
                  </CldUploadWidget>
                  {newBrandLogo && (
                    <div className="mt-2">
                      <Image
                        src={newBrandLogo}
                        alt="Logo prévisualisé"
                        width={80}
                        height={80}
                        style={{ objectFit: "contain" }}

                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-mainColorAdminDash text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors duration-300 ease-in-out text-lg font-semibold"
                >
                  Ajouter la Marque
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Marques Existantes
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {data?.fetchBrands.map((brand: Brand) => (
                  <div
                    key={brand.id}
                    className="flex flex-col group relative border rounded-md p-4"
                  >
                    <div className="w-full h-20 relative rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill={true}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

                        style={{ objectFit: "contain" }}

                        className="transition-opacity duration-300 group-hover:opacity-75"
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900 text-center">
                      {brand.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 text-center">
                      {brand.Category?.name}
                    </p>
                    <button
                      onClick={() => handleDeleteBrand(brand.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandPage;
