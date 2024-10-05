"use client";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import UploadSideAds from "../components/uploadSideAds";

const SideOfNewProduct = ({ setInputField, inputField }: any) => {
  const [localLargeImage, setLocalLargeImage] = useState<string>("");

  const { data: topOfBestDealsAds } = useQuery(ADVERTISSMENT_QUERY, {
    variables: { position: "SideNewProduct" },
  });

  useEffect(() => {
    if (topOfBestDealsAds?.advertismentByPosition) {
      const ad = topOfBestDealsAds.advertismentByPosition[0];
      if (ad) {
        setInputField({
          images: ad.images[0] ? [ad.images[0]] : [],
          link: ad.link || "",
          position: "SideNewProduct",
        });
        setLocalLargeImage(ad.images[0] || "");
      }
    }
  }, [topOfBestDealsAds, setInputField]);

  return (
    <div className="TopOfbestDealsBanner">
      <UploadSideAds
        localInputField={inputField}
        setLocalInputField={setInputField}
        setLocalLargeImage={setLocalLargeImage}
        localLargeImage={localLargeImage}
        title={" Des Nouveaux Produits"}
      />
    </div>
  );
};

export default SideOfNewProduct;
