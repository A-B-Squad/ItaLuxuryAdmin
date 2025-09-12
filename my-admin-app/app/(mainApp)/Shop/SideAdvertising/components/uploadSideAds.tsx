"use client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import React, { useState } from "react";
import { IoImageOutline } from "react-icons/io5";

const LoaderSpiner = () => (
  <div className="flex justify-center items-center h-full w-full">
    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

const UploadSideAds = ({
  title,
  localLargeImage,
  setLocalLargeImage,
  localInputField,
  setLocalInputField,
}: any) => {
  const [localLoadingImages, setLocalLoadingImages] = useState<boolean>(false);

  const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalInputField((prev: any) => ({
      ...prev,
      link: e.target.value,
    }));
  };

  const handleSuccess = (result: any) => {
    // Transform the URL to WebP format with quality optimization
    const webpUrl = result.info.secure_url.replace(
      "/upload/",
      "/upload/f_webp,q_auto:good/"
    );

    if (webpUrl) {
      setLocalLargeImage(webpUrl);
      setLocalInputField((prevField: any) => {
        console.log(prevField);
        return {
          ...prevField,
          images: [webpUrl],
        };
      });
      setLocalLoadingImages(true);
    }
  };

  return (
    <div className="upload-banner-ads pt-8">
      <h1 className="text-3xl font-semibold mb-4">Publicités À Côté</h1>

      <div className="flex items-center mb-4 gap-2">
        <h4 className="text-lg font-medium text-gray-600  list-item">
          {title}
        </h4>
        <p className="text-gray-400">240PX / 390PX</p>
      </div>

      <div className="w-full mb-4 flex justify-center">
        {localLargeImage ? (
          <div className="w-[240px] h-[390px] relative  border-2">
            <Image
              src={localLargeImage}
              alt="image de carrousel"
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

              style={{ objectFit: "contain" }}

              onLoad={() => setLocalLoadingImages(false)}
              onError={() => setLocalLoadingImages(false)}
            />
            {localLoadingImages && <LoaderSpiner />}
          </div>
        ) : (
          <div className="uppercase shadow-xl flex-col border-dashed text-sm w-[230px] h-[390px] tracking-wider text-gray-500 border rounded-md border-lightBlack flex items-center justify-center text-center bg-gray-200 transition-colors">
            <span>240px / 390px</span>
            <span>png / jpg / gif</span>
          </div>
        )}
      </div>

      <div className="add-new-carousel-image flex flex-col justify-between mt-4">
        <div className="flex items-center w-full py-2 justify-between mb-2">
          <div className="flex items-center justify-between gap-2">
            <CldUploadWidget
              uploadPreset="ita-luxury"
              onSuccess={(result, { widget }) => {
                handleSuccess(result);
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  className="uppercase shadow-xl flex-col border-dashed text-sm h-[50px] w-[100px] tracking-wider text-gray-500 border rounded-md border-lightBlack flex items-center justify-center text-center bg-gray-200 transition-colors cursor-pointer"
                  onClick={() => open()}
                >
                  <IoImageOutline />
                </button>
              )}
            </CldUploadWidget>
            <input
              type="text"
              className="outline-none border px-2 py-3 w-[500px]"
              placeholder="Lien vers votre site"
              value={localInputField.link}
              onChange={handleLocalInputChange}
            />
            {localInputField?.images.length > 0 && (
              <div className="relative h-[50px] w-[100px] border overflow-hidden rounded-md cursor-pointer">
                {localLoadingImages && <LoaderSpiner />}
                <Image
                  src={localInputField.images[0]}
                  alt="image téléchargée"
                  fill={true}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

                  className={`${!localLoadingImages ? "visible" : "invisible"}`}
                  style={{ objectFit: "contain" }}

                  onLoad={() => setLocalLoadingImages(false)}
                  onError={() => setLocalLoadingImages(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSideAds;
