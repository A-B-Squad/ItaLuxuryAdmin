"use client";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import UploadِClientService from "../components/UploadِClientService";

const ClientService3 = ({ setInputField, inputField }: any) => {
  const [localLargeImage, setLocalLargeImage] = useState<string>("");

  const { data: ClientService3 } = useQuery(ADVERTISSMENT_QUERY, {
    variables: { position: "client_service_3" },
  });
  useEffect(() => {
    if (ClientService3?.advertismentByPosition) {
      const ad = ClientService3.advertismentByPosition[0];
      if (ad) {
        setInputField({
          images: [ad.images[0]],
          link: ad.link || "",
          position: "client_service_3",
        });
        setLocalLargeImage(ad.images[0] || "");
      }
    }
  }, [ClientService3]);
  return (
    <div className="client_service_3">
      <UploadِClientService
        localInputField={inputField}
        setLocalInputField={setInputField}
        setLocalLargeImage={setLocalLargeImage}
        localLargeImage={localLargeImage}
        title={"client service 3"}
        position={"client_service_3"}
      />
    </div>
  );
};

export default ClientService3;
