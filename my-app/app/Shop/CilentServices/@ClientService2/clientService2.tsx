"use client";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import UploadِClientService from "../components/UploadِClientService";

const ClientService2 = ({ setInputField, inputField }: any) => {
  const [localLargeImage, setLocalLargeImage] = useState<string>("");

  const { data: ClientService2 } = useQuery(ADVERTISSMENT_QUERY, {
    variables: { position: "client_service_2" },
  });

  useEffect(() => {
    if (ClientService2?.advertismentByPosition) {
      const ad = ClientService2.advertismentByPosition[0];
      if (ad) {
        setInputField({
          images: [ad.images[0]],
          link: ad.link || "",
          position: "client_service_2",
        });
        setLocalLargeImage(ad.images[0] || "");
      }
    }
  }, [ClientService2]);

  return (
    <div className="client_service_2">
      <UploadِClientService
        localInputField={inputField}
        setLocalInputField={setInputField}
        setLocalLargeImage={setLocalLargeImage}
        localLargeImage={localLargeImage}
        title={"client service 2 "}
        position={"client_service_2"}
      />
    </div>
  );
};

export default ClientService2;
