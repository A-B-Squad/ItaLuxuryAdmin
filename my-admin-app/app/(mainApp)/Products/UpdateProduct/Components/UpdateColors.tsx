import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { COLORS_QUERY } from "@/app/graph/queries";

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

interface Color {
  id: string;
  color: string;
  Hex: string;
}

const UpdateColors = ({ selectedColor, setSelectedColor }: any) => {
  const { loading, error, data } = useQuery(COLORS_QUERY);

  const handleColorChange = (value: string) => {
    setSelectedColor(value);
  };

  if (loading)
    return (
      <div className=" h-52 relative border bg-[#ffffffc2] rounded-md flex items-center justify-center w-full">
        <Load />
      </div>
    );
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full my-3 mx-auto">
      <h1 className="text-lg font-bold mb-4">Sélectionner une couleur</h1>
      <div className="mb-4 relative">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Choisissez une couleur
        </label>
        <Select value={selectedColor || ""} onValueChange={handleColorChange}>
          <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:outline-none">
            <SelectValue placeholder="Sélectionner une couleur" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className="relative">
              <SelectLabel>Couleurs</SelectLabel>
              {data.colors.map((color: Color) => (
                <SelectItem
                  className="relative flex items-center "
                  key={color.id}
                  value={color.id}
                >
                  <span
                    className="w-5 h-5 absolute  right-5 rounded-full mr-2"
                    style={{ backgroundColor: color.Hex }}
                  ></span>
                  {color.color}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UpdateColors;
