import React from "react";

const AddReference = ({ reference, setReference }: any) => {
  return (
    <div className="stock bg-white rounded-md shadow-md p-3">
      <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
        Référence
      </label>
      <input
        type="string"
        placeholder="Entrer la référence SKU"
        className="w-full p-2 border border-gray-300 outline-slate-500 rounded mt-1"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />
    </div>
  );
};

export default AddReference;
