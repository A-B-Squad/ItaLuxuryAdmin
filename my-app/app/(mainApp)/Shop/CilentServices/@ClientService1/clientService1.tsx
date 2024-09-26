"use client";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import UploadِClientService from "../components/UploadِClientService";

const ClientService1 = ({ setInputField, inputField }: any) => {
  const [localLargeImage, setLocalLargeImage] = useState<string>("");

  const { data: clientService1 } = useQuery(ADVERTISSMENT_QUERY, {
    variables: { position: "client_service_1" },
  });

  useEffect(() => {
    if (clientService1?.advertismentByPosition) {
      const ad = clientService1.advertismentByPosition[0];
      if (ad) {
        setInputField({
          images: [ad.images[0]],
          link: ad.link || "",
          position: "client_service_1",
        });
        setLocalLargeImage(ad.images[0] || "");
      }
    }
  }, [clientService1, setInputField]);

  return (
    <div className="client_service_1">
      <UploadِClientService
        localInputField={inputField}
        setLocalInputField={setInputField}
        setLocalLargeImage={setLocalLargeImage}
        localLargeImage={localLargeImage}
        title={"client service 1"}
        position={"client_service_1"}
      />
    </div>
  );
};

export default ClientService1;
