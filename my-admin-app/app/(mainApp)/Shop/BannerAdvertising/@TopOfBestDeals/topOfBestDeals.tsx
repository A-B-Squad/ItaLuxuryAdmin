"use client";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import UploadBannerAds from "../components/uploadBannerAds";

const TopOfBestDeals = ({ setInputField, inputField }: any) => {
  const [localLargeImage, setLocalLargeImage] = useState<string>("");

  const { data: topOfBestDealsAds } = useQuery(ADVERTISSMENT_QUERY, {
    variables: { position: "BannerBestDeals" },
  });

  useEffect(() => {
    if (topOfBestDealsAds?.advertismentByPosition) {
      const ad = topOfBestDealsAds.advertismentByPosition[0];
      if (ad) {
        setInputField({
          images: ad.images[0] ? [ad.images[0]] : [],
          link: ad.link || "",
          position: "BannerBestDeals",
        });
        setLocalLargeImage(ad.images[0] || "");
      }
    }
  }, [topOfBestDealsAds, setInputField]);

  return (
    <div className="TopOfbestDealsBanner">
      <UploadBannerAds
        localInputField={inputField}
        setLocalInputField={setInputField}
        setLocalLargeImage={setLocalLargeImage}
        localLargeImage={localLargeImage}
        title={"Au Dessus Meilleures Offres Du Jour"}
        position={"BannerBestDeals"}
      />
    </div>
  );
};

export default TopOfBestDeals;
