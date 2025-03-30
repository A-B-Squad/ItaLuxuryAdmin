"use client";
import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_NEXT_TO_CAROUSEL_ADVERTISEMENT_MUTATIONS } from "@/app/graph/mutations";
import BackUp from "@/app/(mainApp)/components/BackUp";
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
  const [createAdvertisement, { loading: isSaving }] = useMutation(
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
        title: "Validation Error",
        description: "Please fill in all fields for both advertisements.",
        variant: "destructive",
      });
    } else {
      try {
        await createAdvertisement({ variables: { input } });
        toast({
          title: "Success",
          description: "Advertisements created successfully.",
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Side Advertisements</h1>
        <p className="text-gray-500 mt-1">Manage the advertisements displayed next to the carousel</p>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6">Advertisement 1</h2>
          <NextToCarouselAds1
            setInputField={setInputFieldOfNextToCarouselAds1}
            inputField={InputFieldOfNextToCarouselAds1}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6">Advertisement 2</h2>
          <NextToCarouselAds2
            setInputField={setInputFieldOfNextToCarouselAds2}
            inputField={InputFieldOfNextToCarouselAds2}
          />
        </div>
      </div>
      
      {showBackUp && <BackUp onSave={handleSave} showBackUp={showBackUp} isSaving={isSaving} />}
    </div>
  );
};

export default SideAdvertisingPage;
