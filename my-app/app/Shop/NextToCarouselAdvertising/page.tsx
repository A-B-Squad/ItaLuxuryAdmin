"use client";
import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_NEXT_TO_CAROUSEL_ADVERTISEMENT_MUTATIONS } from "@/app/graph/mutations";
import BackUp from "@/app/components/BackUp";

import { useToast } from "@/components/ui/use-toast";
import NextToCarouselAds1 from "./@NextToCarouselAds1/NextToCarouselAds1";
import NextToCarouselAds2 from "./@NextToCarouselAds2/NextToCarouselAds2";

// Define types for the state
interface ImageData {
  images: string;
  link: string;
  position: string;
}

const SideAdvertisingPage = () => {
  const { toast } = useToast();
  const [showBackUp, setShowBackUp] = useState(false);
  // State for input fields
  const [InputFieldOfNextToCarouselAds1, setInputFieldOfNextToCarouselAds1] =
    useState<ImageData>({
      images: "",
      link: "",
      position: "NextToCarouselAds",
    });
  const [InputFieldOfNextToCarouselAds2, setInputFieldOfNextToCarouselAds2] =
    useState<ImageData>({
      images: "",
      link: "",
      position: "NextToCarouselAds",
    });

  // Mutation hook
  const [createAdvertisement] = useMutation(
    CREATE_NEXT_TO_CAROUSEL_ADVERTISEMENT_MUTATIONS,
  );

  // Function to handle saving
  const handleSave = async () => {
    const input = [
      InputFieldOfNextToCarouselAds2,
      InputFieldOfNextToCarouselAds1,
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
  const hasContent = () =>
    (InputFieldOfNextToCarouselAds2.images &&
      InputFieldOfNextToCarouselAds2.link) ||
    (InputFieldOfNextToCarouselAds1.images &&
      InputFieldOfNextToCarouselAds1.link);

  // useEffect to manage showBackUp state
  useEffect(() => {
    if (hasContent()) {
      setShowBackUp(true);
    } else {
      setShowBackUp(false);
    }
  }, [
    InputFieldOfNextToCarouselAds1.images,
    InputFieldOfNextToCarouselAds1.link,
    InputFieldOfNextToCarouselAds2.images,
    InputFieldOfNextToCarouselAds2.link,
  ]);
  return (
    <div className="advertising">
      <div className="container flex flex-col gap-8  pb-32 h-full relative divide-y">
        <NextToCarouselAds1
          setInputField={setInputFieldOfNextToCarouselAds1}
          inputField={InputFieldOfNextToCarouselAds1}
        />
        <NextToCarouselAds2
          setInputField={setInputFieldOfNextToCarouselAds2}
          inputField={InputFieldOfNextToCarouselAds2}
        />
      </div>
      {showBackUp && <BackUp onSave={handleSave} showBackUp={showBackUp} />}
    </div>
  );
};

export default SideAdvertisingPage;
