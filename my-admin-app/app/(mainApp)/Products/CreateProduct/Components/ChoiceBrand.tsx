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

const ChoiceBrand = ({ brand, setBrand }: any) => {
  const { loading, error, data: AllBrands } = useQuery(GET_BRANDS);

  const handleBrandChange = (value: string) => {
    setBrand(value);
  };

  if (loading)
    return (
      <div className=" h-52 relative border bg-[#ffffffc2] rounded-md flex items-center justify-center w-full">
        <Load />
      </div>
    );
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div className="brand bg-white rounded-md shadow-md p-3">
      <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
        Marque
      </label>
      <Select value={brand || ""} onValueChange={handleBrandChange}>
        <SelectTrigger className="w-full p-2 border border-gray-300 rounded mt-1">
          <SelectValue placeholder="Sélectionner une marque" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Marques</SelectLabel>
            {AllBrands?.fetchBrands?.map((brand: any) => (
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

export default ChoiceBrand;
