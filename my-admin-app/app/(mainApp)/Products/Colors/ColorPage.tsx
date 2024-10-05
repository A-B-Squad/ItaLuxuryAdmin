"use client";
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  ADD_COLOR_MUTATION,
  DELETE_COLOR_MUTATION,
} from "@/app/graph/mutations";
import { COLORS_QUERY } from "@/app/graph/queries";
import { HexColorPicker } from "react-colorful";
import { useToast } from "@/components/ui/use-toast";
import namer from "color-namer";
import Loading from "../loading";

const ColorPage = () => {
  const { data, loading, error } = useQuery(COLORS_QUERY);
  const [addColor] = useMutation(ADD_COLOR_MUTATION);
  const [deleteColor] = useMutation(DELETE_COLOR_MUTATION);
  const [newColor, setNewColor] = useState<string>("#000000");
  const [colorName, setColorName] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const names = namer(newColor);
    setColorName(names.ntc[0].name);
  }, [newColor]);

  const handleAddColor = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      await addColor({
        variables: { color: colorName, hex: newColor },
        refetchQueries: [{ query: COLORS_QUERY }],
      });
      toast({
        title: "Succès",
        description: "Couleur ajoutée avec succès",
        className: "bg-mainColorAdminDash text-white",
      });
      setNewColor("#000000");
    } catch (err) {
      console.log(err);
      toast({
        title: "Erreur",
        description: "Échec de l'ajout de la couleur",
        variant: "destructive",
      });
    }
  };

  const handleDeleteColor = async (hex: any) => {
    try {
      await deleteColor({
        variables: { hex },
        refetchQueries: [{ query: COLORS_QUERY }],
      });
      toast({
        title: "Succès",
        description: "Couleur supprimée avec succès",
        className: "bg-mainColorAdminDash text-white",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Échec de la suppression de la couleur",
        variant: "destructive",
      });
    }
  };

  if (loading) return <Loading />;
  if (error) return <p>Erreur: {error.message}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
          Gestion des Couleurs
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Ajouter une Nouvelle Couleur
              </h2>
              <form onSubmit={handleAddColor} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner une Couleur
                  </label>
                  <div className="border-2 border-gray-200 w-full rounded-lg p-4">
                    <HexColorPicker
                      style={{ width: "100%" }}
                      color={newColor}
                      onChange={setNewColor}
                    />
                  </div>
                  <div className="mt-4 flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-full shadow-inner"
                      style={{ backgroundColor: newColor }}
                    ></div>
                    <span className="text-lg font-medium">{newColor}</span>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="colorName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom de la Couleur
                  </label>
                  <input
                    type="text"
                    id="colorName"
                    value={colorName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-mainColorAdminDash text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors duration-300 ease-in-out text-lg font-semibold"
                >
                  Ajouter la Couleur
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-y-auto max-h-[612px] h-full">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Couleurs Existantes
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {data.colors.map(
                  (color: { id: React.Key; Hex: string; color: string }) => (
                    <div key={color.id} className="group relative">
                      <div
                        className="w-full aspect-square rounded-lg shadow-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                        style={{ backgroundColor: color.Hex }}
                      ></div>
                      <div className="mt-2 text-center">
                        <span className="block text-sm font-medium text-gray-900">
                          {color.color}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {color.Hex}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteColor(color.Hex)}
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
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPage;
