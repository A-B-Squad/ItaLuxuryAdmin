"use client";
import { useMutation, useQuery } from "@apollo/client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { IoImageOutline } from "react-icons/io5";
import { CiCirclePlus } from "react-icons/ci";
import BackUp from "@/app/(mainApp)/components/BackUp";
import { CREATE_CAROUSEL_ADVERTISEMENT_MUTATIONS } from "@/app/graph/mutations";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MdOutlineDelete } from "react-icons/md";
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
  const [createAdvertisement] = useMutation(
    CREATE_CAROUSEL_ADVERTISEMENT_MUTATIONS,
  );

  const handleSave = async () => {
    try {
      const input = inputFields.map((field) => ({
        images: [field.urlImage],
        link: field.linkImage,
        position: "slider",
      }));

      // Check if any input field is empty
      const hasEmptyFields = input.some(
        (field) => !field.link || field.images.length === 0,
      );

      if (hasEmptyFields) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs pour chaque image.",
          className: "bg-red-800 text-white",
        });
        return;
      }

      await createAdvertisement({ variables: { input } });
      toast({
        title: "Succès",
        description: "Publicité créée avec succès.",
        className: "bg-green-600 text-white",
      });
    } catch (error) {
      console.error("Error while saving:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la publicité.",
        className: "bg-red-800 text-white",
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
      setInputFields(allImages);
    }
  }, [centerCarouselAds]);

  const handleSuccessUpload = (result: any, index: number) => {
    setShowBackUp(true);
    const file = result.info;
    if (file) {
      setInputFields((prevFields) => {
        const newFields = [...prevFields];
        newFields[index].urlImage = file.url;
        return newFields;
      });

      setLoadingImages((prev) => ({
        ...prev,
        [file.url]: true, // Set true to show the loader until the image is fully loaded
      }));
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
      return prevFields.filter((_, index) => index !== indexToDelete);
    });
  };

  return (
    <div className="advertising">
      <div className="container  pb-32 h-full relative">
        <div className="flex items-center mb-4 gap-2">
          <h1 className="text-3xl font-semibold ">Publicités en Carrousel</h1>
          <p className="text-gray-400">400PX / 1140PX </p>
        </div>
        <div className="w-full mb-4">
          {largeImageTest ? (
            <div className="h-[500px] w-[1140px] relative border-2">
              <Image
                src={largeImageTest}
                alt="image de carrousel"
                layout="fill"
                objectFit="contain"
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
            <div className="uppercase shadow-xl flex-col border-dashed text-sm h-[500px] w-[1140px] tracking-wider text-gray-500 border rounded-md border-lightBlack flex items-center justify-center text-center bg-gray-200 transition-colors">
              <span>500px / 1140px</span>
              <span>png / jpg / gif</span>
            </div>
          )}
        </div>
        <div className="AllImages flex justify-center space-x-4 mt-10 w-full">
          <Carousel className="w-full max-w-4xl">
            <CarouselContent className="">
              {imagesSlider.map((img, index) => (
                <CarouselItem
                  key={index}
                  className="basis-1/3 border-2 w-full h-32"
                  onClick={() => handleImageClick(img.urlImage, img.linkImage)}
                >
                  <div className="flex items-center gap-3 cursor-grab	 caret-fuchsia-800 justify-center h-full  p-6 relative">
                    <Image
                      src={img.urlImage}
                      alt={`image de carrousel ${index}`}
                      layout="fill"
                      objectFit="contain"
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
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
        <div className="AddNewCarouselImage flex flex-col justify-between mt-4">
          <div className="addField flex items-center justify-between mb-2">
            <p className="tracking-wider">Ajouter une Nouvelle Image</p>
            <CiCirclePlus
              size={35}
              onClick={handleAddInputField}
              className="cursor-pointer"
            />
          </div>
          {inputFields.map((field, index) => (
            <div
              key={index}
              className="flex items-center w-full border-b py-2 justify-between mb-2"
            >
              <div className="flex items-center justify-between gap-2">
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
                  value={field.linkImage}
                  onChange={(e) =>
                    handleInputChange(index, "linkImage", e.target.value)
                  }
                />
                {field.urlImage && (
                  <div
                    className="relative h-[50px] w-[100px] border overflow-hidden rounded-md cursor-pointer"
                    onClick={() =>
                      handleImageClick(field.urlImage, field.linkImage)
                    }
                  >
                    {loadingImages[field.urlImage] && <Loader />}
                    <Image
                      src={field.urlImage}
                      alt={`image téléchargée ${index}`}
                      layout="fill"
                      className={`${
                        !loadingImages[field.urlImage] ? "visible" : "invisible"
                      }`}
                      objectFit="contain"
                      onLoadingComplete={() =>
                        setLoadingImages((prev) => ({
                          ...prev,
                          [field.urlImage]: false,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
              <MdOutlineDelete
                color="white"
                size={35}
                onClick={() => handleDeleteImage(index)}
                className="border cursor-pointer hover:bg-red-400 bg-red-500 rounded-full p-2"
              />
            </div>
          ))}
        </div>
      </div>
      {showBackUp && <BackUp onSave={handleSave} showBackUp={showBackUp} />}
    </div>
  );
};

export default CarouselAdvertisingPage;
