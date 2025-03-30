"use client";
import { useMutation, useQuery } from "@apollo/client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { IoImageOutline } from "react-icons/io5";
import { FiLink, FiPlus } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import BackUp from "@/app/(mainApp)/components/BackUp";
import { CREATE_CAROUSEL_ADVERTISEMENT_MUTATIONS } from "@/app/graph/mutations";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useToast } from "@/components/ui/use-toast";


// Define types for the state
interface ImageData {
  urlImage: string;
  linkImage: string;
}

const Loader = () => (
  <div className="flex justify-center items-center h-full w-full">
    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

const CarouselAdvertisingPage = () => {
  const { toast } = useToast();
  const [showBackUp, setShowBackUp] = useState(false);
  const [imagesSlider, setImagesSlider] = useState<ImageData[]>([]);
  const [inputFields, setInputFields] = useState<ImageData[]>([
    { urlImage: "", linkImage: "" },
  ]);
  const [largeImageTest, setLargeImageTest] = useState<string>("");
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {},
  );

  const { data: centerCarouselAds, loading: loadingCenterCarouselAds } =
    useQuery(ADVERTISSMENT_QUERY, {
      variables: { position: "slider" },
    });
  const [createAdvertisement, { loading: isSaving }] = useMutation(
    CREATE_CAROUSEL_ADVERTISEMENT_MUTATIONS,
  );

  const handleSave = async () => {
    try {
      // Filter out empty fields
      const validInputFields = inputFields.filter(
        field => field.urlImage && field.linkImage
      );
      
      if (validInputFields.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one image with a link.",
          variant: "destructive",
        });
        return;
      }

      const input = validInputFields.map((field) => ({
        images: [field.urlImage],
        link: field.linkImage,
        position: "slider",
      }));

      await createAdvertisement({ variables: { input } });
      toast({
        title: "Success",
        description: "Carousel advertisements created successfully.",
        className: "bg-green-600 text-white",
      });
      setShowBackUp(false);
    } catch (error) {
      console.error("Error while saving:", error);
      toast({
        title: "Error",
        description: "Failed to create advertisements. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (centerCarouselAds?.advertismentByPosition) {
      const allImages: ImageData[] =
        centerCarouselAds.advertismentByPosition.flatMap(
          (ad: { images: string[]; link: string }) =>
            ad.images.map((image: string) => ({
              urlImage: image,
              linkImage: ad.link,
            })),
        );
      setImagesSlider(allImages);
      setInputFields(allImages.length > 0 ? allImages : [{ urlImage: "", linkImage: "" }]);
      
      // Set the first image as preview if available
      if (allImages.length > 0) {
        setLargeImageTest(allImages[0].urlImage);
      }
    }
  }, [centerCarouselAds]);

  const handleSuccessUpload = (result: any, index: number) => {
    const optimizedUrl = result.info.secure_url.replace(
      "/upload/",
      "/upload/f_auto,q_auto/"
    );

    setShowBackUp(true);

    if (optimizedUrl) {
      setInputFields((prevFields) => {
        const newFields = [...prevFields];
        newFields[index].urlImage = optimizedUrl;
        return newFields;
      });

      setLoadingImages((prev) => ({
        ...prev,
        [optimizedUrl]: true,
      }));
      
      // Set as preview image if none is selected
      if (!largeImageTest) {
        setLargeImageTest(optimizedUrl);
      }
    }
  };

  const handleAddInputField = () => {
    setInputFields([...inputFields, { urlImage: "", linkImage: "" }]);
  };

  const handleInputChange = (
    index: number,
    field: keyof ImageData,
    value: string,
  ) => {
    setShowBackUp(true);
    setInputFields((prevFields) => {
      const newFields = [...prevFields];
      newFields[index][field] = value;
      return newFields;
    });
  };

  const handleImageClick = (url: string, link: string) => {
    if (!imagesSlider.some((img) => img.urlImage === url)) {
      setImagesSlider([...imagesSlider, { urlImage: url, linkImage: link }]);
    }
    setLargeImageTest(url);
  };

  const handleDeleteImage = (indexToDelete: number) => {
    setInputFields((prevFields) => {
      const newFields = prevFields.filter((_, index) => index !== indexToDelete);
      // Ensure there's always at least one input field
      return newFields.length > 0 ? newFields : [{ urlImage: "", linkImage: "" }];
    });
    setShowBackUp(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Carousel Advertisements</h1>
        <p className="text-gray-500 mt-1">Manage the carousel advertisements displayed on your website</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Advertisement Preview</h2>
              <span className="text-sm font-normal text-gray-500">(Recommended size: 500px × 1140px)</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {loadingCenterCarouselAds ? (
            <div className="h-[500px] w-full max-w-[1140px] mx-auto rounded-md bg-gray-200 animate-pulse"></div>
          ) : largeImageTest ? (
            <div className="relative h-[500px] w-full max-w-[1140px] mx-auto border rounded-md overflow-hidden">
              <Image
                src={largeImageTest}
                alt="Carousel advertisement preview"
                layout="fill"
                objectFit="contain"
                className="transition-opacity duration-300"
                onLoadingComplete={() =>
                  setLoadingImages((prev) => ({
                    ...prev,
                    [largeImageTest]: false,
                  }))
                }
              />
              {loadingImages[largeImageTest] && <Loader />}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] w-full max-w-[1140px] mx-auto border border-dashed rounded-md bg-gray-100">
              <IoImageOutline className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No image selected</p>
              <p className="text-gray-400 text-xs mt-1">Recommended: 500px × 1140px (PNG, JPG, GIF)</p>
            </div>
          )}
        </div>
      </div>

      {imagesSlider.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Current Carousel Images</h2>
          </div>
          <div className="p-6">
            <Carousel className="w-full max-w-4xl mx-auto">
              <CarouselContent>
                {imagesSlider.map((img, index) => (
                  <CarouselItem
                    key={index}
                    className="basis-1/3 md:basis-1/4"
                  >
                    <div 
                      className="relative h-32 border rounded-md overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => handleImageClick(img.urlImage, img.linkImage)}
                    >
                      <Image
                        src={img.urlImage}
                        alt={`Carousel image ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className={`transition-opacity duration-300 ${loadingImages[img.urlImage] ? 'opacity-50' : 'opacity-100'}`}
                        onLoadingComplete={() =>
                          setLoadingImages((prev) => ({
                            ...prev,
                            [img.urlImage]: false,
                          }))
                        }
                      />
                      {loadingImages[img.urlImage] && <Loader />}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Manage Carousel Images</h2>
            <button 
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
              onClick={handleAddInputField}
            >
              <FiPlus size={16} /> Add Image
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {inputFields.map((field, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-md relative"
            >
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="w-full sm:w-auto">
                    <label htmlFor={`image-upload-${index}`} className="mb-2 block text-sm font-medium">Image</label>
                    <CldUploadWidget
                      uploadPreset="ita-luxury"
                      onSuccess={(result, { widget }) => {
                        handleSuccessUpload(result, index);
                        widget.close();
                      }}
                    >
                      {({ open }) => (
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                          onClick={() => open()}
                        >
                          <IoImageOutline /> Upload
                        </button>
                      )}
                    </CldUploadWidget>
                  </div>
                  
                  <div className="flex-1">
                    <label htmlFor={`link-${index}`} className="mb-2 block text-sm font-medium">Destination URL</label>
                    <div className="relative">
                      <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id={`link-${index}`}
                        type="url"
                        placeholder="https://example.com/product"
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={field.linkImage}
                        onChange={(e) =>
                          handleInputChange(index, "linkImage", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                
                {field.urlImage && (
                  <div 
                    className="relative h-20 w-32 border rounded-md overflow-hidden cursor-pointer mx-auto sm:mx-0"
                    onClick={() => handleImageClick(field.urlImage, field.linkImage)}
                  >
                    <Image
                      src={field.urlImage}
                      alt={`Uploaded image ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      className={`transition-opacity duration-300 ${loadingImages[field.urlImage] ? 'opacity-50' : 'opacity-100'}`}
                      onLoadingComplete={() =>
                        setLoadingImages((prev) => ({
                          ...prev,
                          [field.urlImage]: false,
                        }))
                      }
                    />
                    {loadingImages[field.urlImage] && <Loader />}
                  </div>
                )}
              </div>
              
              <button
                className="absolute top-2 right-2 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                onClick={() => handleDeleteImage(index)}
              >
                <MdOutlineDelete size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showBackUp && <BackUp onSave={handleSave} showBackUp={showBackUp} isSaving={isSaving} />}
    </div>
  );
};

export default CarouselAdvertisingPage;
