"use client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import React, { useState } from "react";
import { IoImageOutline } from "react-icons/io5";
import { FiLink } from "react-icons/fi";

// Define proper types for the component props
interface UploadNextToCarouselAdsProps {
  title: string;
  localLargeImage: string;
  setLocalLargeImage: (url: string) => void;
  localInputField: {
    images: string;
    link: string;
    position: string;
  };
  setLocalInputField: (data: any) => void;
}

const LoaderSpiner = () => (
  <div className="flex justify-center items-center h-full w-full">
    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

const UploadNextToCarouselAds: React.FC<UploadNextToCarouselAdsProps> = ({
  title,
  localLargeImage,
  setLocalLargeImage,
  localInputField,
  setLocalInputField,
}) => {
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
        return {
          ...prevField,
          images: [webpUrl],
        };
      });
      setLocalLoadingImages(true);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-4 gap-2">
        <h4 className="text-lg font-medium text-gray-700">
          {title}
        </h4>
        <span className="text-sm text-gray-500">(Recommended size: 455px × 230px)</span>
      </div>

      <div className="w-full mb-6 flex justify-center">
        {localLargeImage ? (
          <div className="w-[455px] h-[230px] relative border rounded-md overflow-hidden">
            <Image
              src={localLargeImage}
              alt="Advertisement preview"
              layout="fill"
              objectFit="contain"
              className="transition-opacity duration-300"
              onLoadingComplete={() => setLocalLoadingImages(false)}
              onError={() => setLocalLoadingImages(false)}
            />
            {localLoadingImages && <LoaderSpiner />}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-[455px] h-[230px] border border-dashed rounded-md bg-gray-100">
            <IoImageOutline className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">No image selected</p>
            <p className="text-gray-400 text-xs mt-1">Recommended: 455px × 230px (PNG, JPG, GIF)</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="image-upload" className="text-sm font-medium text-gray-700">
            Advertisement Image
          </label>
          <div className="flex items-center gap-4">
            <CldUploadWidget
              uploadPreset="ita-luxury"
              onSuccess={(result, { widget }) => {
                handleSuccess(result);
                widget.close();
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                  onClick={() => open()}
                >
                  <IoImageOutline /> Upload Image
                </button>
              )}
            </CldUploadWidget>

            {localInputField?.images.length > 0 && (
              <div className="relative h-[50px] w-[100px] border rounded-md overflow-hidden">
                {localLoadingImages && <LoaderSpiner />}
                <Image
                  src={localInputField.images[0]}
                  alt="Uploaded thumbnail"
                  layout="fill"
                  objectFit="cover"
                  className={`transition-opacity duration-300 ${!localLoadingImages ? "opacity-100" : "opacity-0"}`}
                  onLoadingComplete={() => setLocalLoadingImages(false)}
                  onError={() => setLocalLoadingImages(false)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="link-input" className="text-sm font-medium text-gray-700">
            Destination URL
          </label>
          <div className="relative">
            <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              id="link-input"
              type="url"
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/product"
              value={localInputField.link}
              onChange={handleLocalInputChange}
            />
          </div>
          <p className="text-sm text-gray-500">
            Enter the URL where users will be directed when they click on the advertisement
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadNextToCarouselAds;
