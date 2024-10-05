"use client";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import UploadSideAds from "../components/uploadSideAds";

const SideOfPromotion = ({ setInputField, inputField }: any) => {
  const [localLargeImage, setLocalLargeImage] = useState<string>("");

  const { data: topOfLessThen20Ads, loading: loadingTopOfLessThen20Ads } =
    useQuery(ADVERTISSMENT_QUERY, {
      variables: { position: "SidePromotion" },
    });

  useEffect(() => {
    if (topOfLessThen20Ads?.advertismentByPosition) {
      const ad = topOfLessThen20Ads.advertismentByPosition[0];
      if (ad) {
        setInputField({
          images: ad.images[0] ? [ad.images[0]] : [],

          link: ad.link || "",
          position: "SidePromotion",
        });
        setLocalLargeImage(ad.images[0] || "");
      }
    }
  }, [topOfLessThen20Ads]);

  return (
    <div className="TopOfLessThen20Banner">
      <UploadSideAds
        localInputField={inputField}
        setLocalInputField={setInputField}
        setLocalLargeImage={setLocalLargeImage}
        localLargeImage={localLargeImage}
        title={"De Offres Promotionnelles"}
      />
    </div>
  );
};

export default SideOfPromotion;
