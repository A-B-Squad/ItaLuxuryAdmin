"use client";
import React from "react";
import { CiSaveDown2 } from "react-icons/ci";
import { MdOutlineDeleteOutline } from "react-icons/md";

const BackUp = ({ onSave, showBackUp }: any) => {
  const onDelete = () => {
    window.location.reload();
  };
  return (
    <div
      className={` 
        bg-white shadow-md fixed left-0 bottom-0 w-full py-4 flex items-center gap-2 px-2 border justify-end
    transition-all duration-500 ease-in-out transform
        ${
          showBackUp
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }
        
        `}
    >
      <button
        className="bg-red-500 flex items-center gap-1 hover:bg-red-300 transition-all text-white px-3 py-2 rounded-md tracking-wider"
        onClick={onDelete}
      >
        Supprimer les Modifications
        <MdOutlineDeleteOutline size={25} />
      </button>
      <button
        onClick={onSave}
        className="text-white flex items-center gap-1 bg-mainColorAdminDash hover:opacity-85 transition-all px-3 py-2 rounded-md tracking-wider"
      >
        Sauvegarde
        <CiSaveDown2 size={25} />
      </button>
    </div>
  );
};

export default BackUp;
