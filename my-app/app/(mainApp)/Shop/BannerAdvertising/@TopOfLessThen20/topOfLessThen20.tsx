"use client";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import UploadBannerAds from "../components/uploadBannerAds";

const TopOfLessThen20 = ({ setInputField, inputField }: any) => {
  const [localLargeImage, setLocalLargeImage] = useState<string>("");

  const { data: topOfLessThen20Ads, loading: loadingTopOfLessThen20Ads } =
    useQuery(ADVERTISSMENT_QUERY, {
      variables: { position: "BannerLessThen20" },
    });

  useEffect(() => {
    if (topOfLessThen20Ads?.advertismentByPosition) {
      const ad = topOfLessThen20Ads.advertismentByPosition[0];
      if (ad) {
        setInputField({
          images: ad.images[0] ? [ad.images[0]] : [],

          link: ad.link || "",
          position: "BannerLessThen20",
        });
        setLocalLargeImage(ad.images[0] || "");
      }
    }
  }, [topOfLessThen20Ads]);

  return (
    <div className="TopOfLessThen20Banner">
      <UploadBannerAds
        localInputField={inputField}
        setLocalInputField={setInputField}
        setLocalLargeImage={setLocalLargeImage}
        localLargeImage={localLargeImage}
        title={"Au Dessus Les Article à Moins de 20 DT  "}
        position={"BannerLessThen20"}
      />
    </div>
  );
};

export default TopOfLessThen20;
