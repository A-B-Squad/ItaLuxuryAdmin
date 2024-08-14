"use client";
import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_CLIENT_SERVICE_MUTATIONS } from "@/app/graph/mutations";
import BackUp from "@/app/components/BackUp";

import { useToast } from "@/components/ui/use-toast";
import ClientService1 from "./@ClientService1/clientService1";
import ClientService3 from "./@ClientService3/clientService3";
import ClientService2 from "./@ClientService2/clientService2";

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
  const [InputFieldOfclient_service_1, setInputFieldOfclient_service_1] =
    useState<ImageData>({
      images: "",
      link: "",
      position: "client_service_1",
    });
  const [InputFieldClient_service_2, setInputFieldclient_service_2] =
    useState<ImageData>({
      images: "",
      link: "",
      position: "client_service_2",
    });
  const [InputFieldclient_service_3, setInputFieldclient_service_3] =
    useState<ImageData>({
      images: "",
      link: "",
      position: "client_service_3",
    });

  // Mutation hook
  const [createAdvertisement] = useMutation(CREATE_CLIENT_SERVICE_MUTATIONS);

  // Function to handle saving
  const handleSave = async () => {
    const input = [
      InputFieldClient_service_2,
      InputFieldOfclient_service_1,
      InputFieldclient_service_3,
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
      (InputFieldClient_service_2.images && InputFieldClient_service_2.link) ||
      (InputFieldOfclient_service_1.images &&
        InputFieldOfclient_service_1.link) ||
      (InputFieldclient_service_3.images && InputFieldclient_service_3.link)
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
    InputFieldOfclient_service_1,
    InputFieldClient_service_2,
    InputFieldclient_service_3,
  ]);

  return (
    <div className="advertising">
      <div className="container flex flex-col gap-8  pb-32 h-full relative divide-y">
        <ClientService1
          setInputField={setInputFieldOfclient_service_1}
          inputField={InputFieldOfclient_service_1}
        />
        <ClientService2
          setInputField={setInputFieldclient_service_2}
          inputField={InputFieldClient_service_2}
        />
        <ClientService3
          setInputField={setInputFieldclient_service_3}
          inputField={InputFieldclient_service_3}
        />
      </div>
      {showBackUp && <BackUp onSave={handleSave} showBackUp={showBackUp} />}
    </div>
  );
};

export default BannerAdvertisingPage;
