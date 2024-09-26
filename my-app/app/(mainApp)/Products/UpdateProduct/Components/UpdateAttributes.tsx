import React, { useState, ChangeEvent } from "react";

interface Attribute {
  name: string;
  value: string;
}

const UpdateAttribute = ({ attributes, setAttributes }: any) => {
  const handleAttributeChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const newAttributes = [...attributes];
    newAttributes[index][field as keyof Attribute] = value;
    setAttributes(newAttributes);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: "", value: "" }]);
  };

  return (
    <div className="attributes mb-4 bg-white p-6 rounded-lg shadow-lg  w-full mx-auto">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Attributs</h3>
        <button
          type="button"
          className="rounded-full w-8 h-8 hover:bg-blue-400 transition-all bg-blue-500 text-white  "
          onClick={handleAddAttribute}
        >
          +
        </button>
      </div>

      {attributes.map((attribute: any, index: any) => (
        <div key={index} className="mb-2 flex space-x-2">
          <input
            type="text"
            className="w-full p-2 border focus:border-black transition-all  outline-slate-500 focus:shadow-md border-gray-300 rounded"
            placeholder="Nom de l'attribut"
            value={attribute.name}
            onChange={(e) =>
              handleAttributeChange(index, "name", e.target.value)
            }
          />
          <input
            type="text"
            className="w-full p-2 border focus:border-black outline-slate-500 transition-all "
            placeholder="Valeur de l'attribut"
            value={attribute.value}
            onChange={(e) =>
              handleAttributeChange(index, "value", e.target.value)
            }
          />
        </div>
      ))}
    </div>
  );
};

export default UpdateAttribute;
