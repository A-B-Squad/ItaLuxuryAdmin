"use client";
import React from "react";
import { IoImageOutline } from "react-icons/io5";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { IoMdAlert } from "react-icons/io";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { FaTrashAlt } from "react-icons/fa";

const UploadImage = ({ uploadedImages, setUploadedImages }: any) => {
  const handleSuccessUpload = (result: any) => {
    setUploadedImages((prevImages: any) => [
      ...prevImages,
      result.info.secure_url,
    ]);
  };

  const handleDeleteImage = (index: number) => {
    setUploadedImages((prevImages: any) =>
      prevImages.filter((_: any, i: number) => i !== index),
    );
  };

  return (
    <div className="upload-image bg-white p-6 rounded-lg shadow-lg w-full mx-auto">
      <h3 className="text-lg font-bold mb-4">Upload Image</h3>
      <CldUploadWidget
        uploadPreset="MaisonNg"
        onSuccess={(result, { widget }) => {
          handleSuccessUpload(result);
          widget.close();
        }}
      >
        {({ open }) => (
          <button
            type="button"
            className="uppercase shadow-xl flex-col border-dashed text-sm h-[50px] w-[100px] tracking-wider text-gray-500 border rounded-md border-lightBlack flex items-center justify-center text-center bg-gray-200 transition-colors cursor-pointer"
            onClick={() => open()}
          >
            <IoImageOutline className="text-2xl" />
          </button>
        )}
      </CldUploadWidget>
      <div className="mt-4 flex items-center border border-gray-200 text-blue-500 border-l-mainColorAdminDash py-2 rounded-md border-l-4 px-2">
        <IoMdAlert />
        <p>
          Remarque: pour une meilleure apparence visuelle, utilisez l’image du
          produit avec une taille de 800x800
        </p>
      </div>
      <div className="mt-4 flex gap-1 flex-wrap">
        {uploadedImages.map((url: string | StaticImport, index: number) => (
          <div key={index} className="relative">
            <Image
              width={800}
              height={800}
              src={url}
              objectFit="contain"
              alt={`Uploaded image ${index + 1}`}
              className="h-32 w-32  rounded-md"
            />
            <button
              type="button"
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
              onClick={() => handleDeleteImage(index)}
            >
              <FaTrashAlt className="text-sm" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadImage;
