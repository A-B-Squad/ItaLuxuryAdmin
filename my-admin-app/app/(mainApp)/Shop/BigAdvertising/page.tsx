"use client";
import { useMutation, useQuery } from "@apollo/client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { IoImageOutline } from "react-icons/io5";
import BackUp from "@/app/(mainApp)/components/BackUp";
import { CREATE_BIG_ADVERTISEMENT_MUTATIONS } from "@/app/graph/mutations";
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

const BigAdvertisingPage = () => {
  const { toast } = useToast();
  const [showBackUp, setShowBackUp] = useState(false);
  const [image, setImage] = useState<ImageData>({
    urlImage: "",
    linkImage: "",
  });
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {},
  );

  const { data: centerCarouselAds, loading: loadingCenterCarouselAds } =
    useQuery(ADVERTISSMENT_QUERY, {
      variables: { position: "BigAds" },
    });
  const [createAdvertisement] = useMutation(CREATE_BIG_ADVERTISEMENT_MUTATIONS);

  const handleSave = async () => {
    try {
      const input = {
        images: [image.urlImage],
        link: image.linkImage,
        position: "BigAds",
      };

      if (!input.link || input.images.length === 0) {
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
    if (centerCarouselAds?.advertismentByPosition?.[0]) {
      const advertisement = centerCarouselAds.advertismentByPosition[0];
      setImage({
        urlImage: advertisement.images[0],
        linkImage: advertisement.link,
      });
    }
  }, [centerCarouselAds]);

  const handleSuccessUpload = (result: any) => {
    setShowBackUp(true);
    // Transform the URL to WebP format with quality optimization
    const webpUrl = result.info.secure_url.replace(
      "/upload/",
      "/upload/f_webp,q_auto:good,w_700,h_450/"
    );
    
    if (webpUrl) {
      setImage({ urlImage: webpUrl, linkImage: image.linkImage });
      setLoadingImages((prev) => ({ ...prev, [webpUrl]: true }));
    }
  };


  const handleInputChange = (field: keyof ImageData, value: string) => {
    setShowBackUp(true);
    setImage((prevImage) => ({
      ...prevImage,
      [field]: value,
    }));
  };

  return (
    <div className="advertising">
      <div className="container  pb-32 h-full relative">
        <div className="flex items-center mb-4 gap-2">
          <h1 className="text-3xl font-semibold">Publicités en Home</h1>
          <p className="text-gray-400">700px / 450px</p>
        </div>
        <div className="w-full mb-4">
          {image.urlImage ? (
            <div className="h-[450px] w-[700px] relative border-2">
              <Image
                src={image.urlImage}
                alt="image de carrousel"
                layout="fill"
                objectFit="contain"
                onLoadingComplete={() =>
                  setLoadingImages((prev) => ({
                    ...prev,
                    [image.urlImage]: false,
                  }))
                }
              />
              {loadingImages[image.urlImage] && <Loader />}
            </div>
          ) : (
            <div className="uppercase shadow-xl flex-col border-dashed text-sm h-[400px] w-[952px] tracking-wider text-gray-500 border rounded-md border-lightBlack flex items-center justify-center text-center bg-gray-200 transition-colors">
              <span>700px / 450px</span>
              <span>png / jpg / gif</span>
            </div>
          )}
        </div>
        <div className="AddNewCarouselImage flex flex-col justify-between mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="tracking-wider">Ajouter une Nouvelle Image</p>
          </div>
          <div className="flex items-center w-full border-b py-2 justify-between mb-2">
            <div className="flex items-center justify-between gap-2">
              <CldUploadWidget
                uploadPreset="ita-luxury"
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
                    <IoImageOutline />
                  </button>
                )}
              </CldUploadWidget>
              <input
                type="text"
                className="outline-none border px-2 py-3 w-[500px]"
                placeholder="Lien vers votre site"
                value={image.linkImage}
                onChange={(e) => handleInputChange("linkImage", e.target.value)}
              />
              {image.urlImage && (
                <div className="relative h-[50px] w-[100px] border overflow-hidden rounded-md cursor-pointer">
                  {loadingImages[image.urlImage] && <Loader />}
                  <Image
                    src={image.urlImage}
                    alt="image téléchargée"
                    layout="fill"
                    className={`${!loadingImages[image.urlImage] ? "visible" : "invisible"
                      }`}
                    objectFit="contain"
                    onLoadingComplete={() =>
                      setLoadingImages((prev) => ({
                        ...prev,
                        [image.urlImage]: false,
                      }))
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showBackUp && <BackUp onSave={handleSave} showBackUp={showBackUp} />}
    </div>
  );
};

export default BigAdvertisingPage;
