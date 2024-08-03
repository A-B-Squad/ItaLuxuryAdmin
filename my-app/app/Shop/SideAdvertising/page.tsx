"use client";
import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_SIDE_ADVERTISEMENT_MUTATIONS } from "@/app/graph/mutations";
import BackUp from "@/app/components/BackUp";

import { useToast } from "@/components/ui/use-toast";
import SideOfNewProduct from "./@SideOfNewProduct/sideOfNewProduct";
import SideOfPromotion from "./@SideOfPromotion/sideOfPromotion";
import SideOfConatct from "./@SideOfContact/sideOfContact";

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
  const [InputFieldOfSidePromotion, setInputFieldOfSidePromotion] =
    useState<ImageData>({
      images: "",
      link: "",
      position: "SidePromotion",
    });
  const [InputFieldSideNewProduct, setInputFieldSideNewProduct] =
    useState<ImageData>({
      images: "",
      link: "",
      position: "SideNewProduct",
    });
  const [InputFieldSideContact, setInputFieldSideContact] = useState<ImageData>(
    {
      images: "",
      link: "",
      position: "clinetContactSideAds",
    },
  );

  // Mutation hook
  const [createAdvertisement] = useMutation(
    CREATE_SIDE_ADVERTISEMENT_MUTATIONS,
  );

  // Function to handle saving
  const handleSave = async () => {
    const input = [
      InputFieldSideNewProduct,
      InputFieldOfSidePromotion,
      InputFieldSideContact,
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
    (InputFieldSideNewProduct.images && InputFieldSideNewProduct.link) ||
    (InputFieldOfSidePromotion.images && InputFieldOfSidePromotion.link) ||
    (InputFieldSideContact.images && InputFieldSideContact.link);
  // useEffect to manage showBackUp state
  useEffect(() => {
    if (hasContent()) {
      setShowBackUp(true);
    } else {
      setShowBackUp(false);
    }
  }, [
    InputFieldSideNewProduct,
    InputFieldOfSidePromotion,
    InputFieldSideContact,
  ]);
  return (
    <div className="advertising">
      <div className="container flex flex-col gap-8  pb-32 h-full relative divide-y">
        <SideOfPromotion
          setInputField={setInputFieldOfSidePromotion}
          inputField={InputFieldOfSidePromotion}
        />
        <SideOfNewProduct
          setInputField={setInputFieldSideNewProduct}
          inputField={InputFieldSideNewProduct}
        />
        <SideOfConatct
          setInputField={setInputFieldSideContact}
          inputField={InputFieldSideContact}
        />
      </div>
      {showBackUp && <BackUp onSave={handleSave} showBackUp={showBackUp} />}
    </div>
  );
};

export default SideAdvertisingPage;
