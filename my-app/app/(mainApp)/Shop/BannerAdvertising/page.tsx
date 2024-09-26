"use client";
import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_BANNER_ADVERTISEMENT_MUTATIONS } from "@/app/graph/mutations";
import BackUp from "@/app/(mainApp)/components/BackUp";
import TopOfBestDeals from "./@TopOfBestDeals/topOfBestDeals";
import TopOfLessThen20 from "./@TopOfLessThen20/topOfLessThen20";
import TopOfPromotion from "./@TopOfPromotion/topOfPromotion";
import { useToast } from "@/components/ui/use-toast";

// Define types for the state
interface ImageData {
  images: string;
  link: string;
  position: string;
}

const BannerAdvertisingPage = () => {
  const { toast } = useToast();

  const [showBackUp, setShowBackUp] = useState(false);

  // State for input fields
  const [InputFieldOfTopDealsBanner, setInputFieldOfTopDealsBanner] =
    useState<ImageData>({
      images: "",
      link: "",
      position: "BannerBestDeals",
    });
  const [InputFieldLessThen20Banner, setInputFieldLessThen20Banner] =
    useState<ImageData>({
      images: "",
      link: "",
      position: "BannerLessThen20",
    });
  const [InputFieldPromotionBanner, setInputFieldPromotionBanner] =
    useState<ImageData>({
      images: "",
      link: "",
      position: "BannerPromotion",
    });

  // Mutation hook
  const [createAdvertisement] = useMutation(
    CREATE_BANNER_ADVERTISEMENT_MUTATIONS,
  );

  // Function to handle saving
  const handleSave = async () => {
    const input = [
      InputFieldLessThen20Banner,
      InputFieldOfTopDealsBanner,
      InputFieldPromotionBanner,
    ];

    // Check if any input field is empty
    const isEmpty = input.some(
      (field) => !field.images || !field.link || !field.position,
    );

    if (isEmpty) {
      toast({
        title: "Erreur de saisie",
        description: "Veuillez remplir tous les champs.",
        className: "bg-red-800 text-white",
      });
    } else {
      try {
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
    }
  };

  // Function to check if any input field has content
  const hasContent = () => {
    return (
      (InputFieldLessThen20Banner.images && InputFieldLessThen20Banner.link) ||
      (InputFieldOfTopDealsBanner.images && InputFieldOfTopDealsBanner.link) ||
      (InputFieldPromotionBanner.images && InputFieldPromotionBanner.link)
    );
  };

  // useEffect to manage showBackUp state
  useEffect(() => {
    if (hasContent()) {
      setShowBackUp(true);
    } else {
      setShowBackUp(false);
    }
  }, [
    InputFieldOfTopDealsBanner,
    InputFieldLessThen20Banner,
    InputFieldPromotionBanner,
  ]);

  return (
    <div className="advertising">
      <div className="container flex flex-col gap-8  pb-32 h-full relative divide-y">
        <TopOfBestDeals
          setInputField={setInputFieldOfTopDealsBanner}
          inputField={InputFieldOfTopDealsBanner}
        />
        <TopOfLessThen20
          setInputField={setInputFieldLessThen20Banner}
          inputField={InputFieldLessThen20Banner}
        />
        <TopOfPromotion
          setInputField={setInputFieldPromotionBanner}
          inputField={InputFieldPromotionBanner}
        />
      </div>
      {showBackUp && <BackUp onSave={handleSave} showBackUp={showBackUp} />}
    </div>
  );
};

export default BannerAdvertisingPage;
