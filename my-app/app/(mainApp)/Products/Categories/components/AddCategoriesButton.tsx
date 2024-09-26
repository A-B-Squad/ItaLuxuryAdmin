import Link from "next/link";
import React from "react";

const AddCategories = () => {
  return (
    <div className="bg-white shadow-lg  fixed left-0 bottom-0 w-full py-8 flex items-center gap-2  rounded-md px-2 border justify-end">
      <Link
        href={"Categories/CreateCategory"}
        type="button"
        className="bg-mainColorAdminDash hover:opacity-85 transition-all  fixed text-white px-5 py-3 mr-8 text-center rounded-md text-sm"
      >
        Ajouter une catégorie
      </Link>
    </div>
  );
};

export default AddCategories;
