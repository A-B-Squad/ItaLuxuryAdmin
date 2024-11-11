import React from "react";
import { useQuery } from "@apollo/client";
import { GET_BRANDS } from "@/app/graph/queries";

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
import { IoMdClose } from "react-icons/io";

const UpdateBrand = ({ selectedBrandId, setBrand }: any) => {
  const { loading, error, data: AllBrands } = useQuery(GET_BRANDS);

  const handleBrandChange = (value: string) => {
    setBrand(value);
  };

  const handleRemoveBrand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBrand(null);
  };



  if (loading)
    return (
      <div className="h-52 relative border bg-[#ffffffc2] rounded-md flex items-center justify-center w-full">
        <Load />
      </div>
    );
  if (error) return <p>Erreur : {error.message}</p>;

  const brands = AllBrands?.fetchBrands || [];

  return (
    <div className="brand bg-white rounded-md shadow-md p-3">
      <div className="label flex items-center">

        <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
          Marque
        </label>
        {selectedBrandId && (
          <button
            onClick={handleRemoveBrand}
            className=" bg-red-500   p-1 hover:bg-gray-100 rounded-full"
            type="button"
          >
            <IoMdClose className="h-4 w-4 text-white" />
          </button>
        )}
      </div>
      <Select value={selectedBrandId || ""} onValueChange={handleBrandChange}>
        <SelectTrigger className="w-full p-2 border border-gray-300 rounded mt-1">
          <SelectValue placeholder="Sélectionner une marque" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Marques</SelectLabel>
            <SelectItem value="empty">Aucune marque sélectionnée</SelectItem>
            {brands.map((brand: any) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UpdateBrand;
