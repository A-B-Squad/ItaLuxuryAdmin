import React from "react";

const AddStock = ({ stock, setStock }: any) => {
  return (
    <div className="stock bg-white rounded-md shadow-md p-3">
      <label className="block border-b py-2 w-full text-gray-700 font-semibold tracking-wider">
        Stock
      </label>
      <input
        type="number"
        className="w-full p-2 border border-gray-300 rounded mt-1"
        value={stock}
        onChange={(e) => setStock(parseInt(e.target.value))}
      />
    </div>
  );
};

export default AddStock;
