"use client";
import React, { useState } from "react";
import { IoImageOutline } from "react-icons/io5";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { IoMdAlert } from "react-icons/io";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { FaTrashAlt } from "react-icons/fa";

const UploadImage = ({ uploadedImages, setUploadedImages }: any) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleSuccessUpload = (result: any) => {
    
    // If eager transformations exist in your preset, use them
    if (result.info.eager && result.info.eager.length > 0) {
      setUploadedImages((prevImages: any) => [
        ...prevImages,
        result.info.eager[0].secure_url,
      ]);
    } else {
      // Otherwise, apply transformation to URL
      // Check if crop coordinates exist
      if (result.info.coordinates && result.info.coordinates.custom && result.info.coordinates.custom.length > 0) {
        const crop = result.info.coordinates.custom[0];
        const transformedUrl = result.info.secure_url.replace(
          "/upload/",
          `/upload/c_crop,x_${crop[0]},y_${crop[1]},w_${crop[2]},h_${crop[3]}/c_fill,w_800,h_800,f_webp,q_auto:good/`
        );
        setUploadedImages((prevImages: any) => [
          ...prevImages,
          transformedUrl,
        ]);
      } else {
        // No crop, just resize
        const transformedUrl = result.info.secure_url.replace(
          "/upload/",
          "/upload/c_fill,w_800,h_800,f_webp,q_auto:good/"
        );
        setUploadedImages((prevImages: any) => [
          ...prevImages,
          transformedUrl,
        ]);
      }
    }
  };

  const handleDeleteImage = (index: number) => {
    setUploadedImages((prevImages: any) =>
      prevImages.filter((_: any, i: number) => i !== index),
    );
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...uploadedImages];
    const draggedImage = newImages[draggedIndex];

    newImages.splice(draggedIndex, 1);
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newImages.splice(adjustedDropIndex, 0, draggedImage);

    setUploadedImages(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="upload-image bg-white p-6 rounded-lg shadow-lg w-full mx-auto">
      <h3 className="text-lg font-bold mb-4">Upload Image</h3>
      <CldUploadWidget
        uploadPreset="ita-luxury"
        options={{
          sources: ['local', 'url', 'camera'],
          multiple: false,
          maxFiles: 1,
          cropping: true,
          croppingAspectRatio: 1,
          croppingDefaultSelectionRatio: 0.9,
          croppingShowDimensions: true,
          croppingCoordinatesMode: 'custom',
          showSkipCropButton: false,
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#90A0B3",
              tabIcon: "#0078FF",
              menuIcons: "#5A616A",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#0078FF",
              action: "#FF620C",
              inactiveTabIcon: "#0E2F5A",
              error: "#F44235",
              inProgress: "#0078FF",
              complete: "#20B832",
              sourceBg: "#E4EBF1"
            }
          }
        }}
        onSuccess={(result, { widget }) => {
          handleSuccessUpload(result);
        }}
      >
        {({ open }) => (
          <button
            type="button"
            className="uppercase shadow-xl flex-col border-dashed text-sm h-[50px] w-[100px] tracking-wider text-gray-500 border rounded-md border-lightBlack flex items-center justify-center text-center bg-gray-200 transition-colors cursor-pointer hover:bg-gray-300"
            onClick={() => open()}
          >
            <IoImageOutline className="text-2xl" />
          </button>
        )}
      </CldUploadWidget>
      <div className="mt-4 flex items-center border border-gray-200 text-blue-500 border-l-mainColorAdminDash py-2 rounded-md border-l-4 px-2">
        <IoMdAlert className="mr-2" />
        <p className="text-sm">
          Remarque: l'image sera recadrée en format carré (1:1) avant l'upload. 
          Glissez-déposez pour réorganiser l'ordre.
        </p>
      </div>
      <div className="mt-4 flex gap-2 flex-wrap">
        {uploadedImages.map((url: string | StaticImport, index: number) => (
          <div
            key={index}
            className={`relative cursor-move transition-all duration-200 ${
              draggedIndex === index ? 'opacity-50 transform rotate-2' : ''
            } ${
              dragOverIndex === index && draggedIndex !== index
                ? 'transform scale-105 ring-2 ring-blue-400 ring-opacity-50'
                : ''
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            title="Drag to reorder"
          >
            <Image
              width={800}
              height={800}
              src={url}
              style={{ objectFit: "contain" }}
              alt={`Uploaded image ${index + 1}`}
              className="h-32 w-32 rounded-md pointer-events-none"
            />
            <button
              type="button"
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 z-10 hover:bg-red-700 transition-colors"
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