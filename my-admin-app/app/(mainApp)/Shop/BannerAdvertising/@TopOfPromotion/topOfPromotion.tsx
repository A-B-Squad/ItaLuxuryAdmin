"use client";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import UploadBannerAds from "../components/uploadBannerAds";
import { useEffect, useState } from "react";

const TopOfPromotion = ({ setInputField, inputField }: any) => {
  const [localLargeImage, setLocalLargeImage] = useState<string>("");

  const { data: topOfPromotionAds } =
    useQuery(ADVERTISSMENT_QUERY, {
      variables: { position: "BannerPromotion" },
    });
  useEffect(() => {
    if (topOfPromotionAds?.advertismentByPosition) {
      const ad = topOfPromotionAds.advertismentByPosition[0];
      if (ad) {
        setInputField({
          images: ad.images[0] ? [ad.images[0]] : [],

          link: ad.link || "",
          position: "BannerPromotion",
        });
        setLocalLargeImage(ad.images[0] || "");
      }
    }
  }, [topOfPromotionAds]);
  return (
    <div className="TopOfPromotionBanner">
      <UploadBannerAds
        localInputField={inputField}
        setLocalInputField={setInputField}
        setLocalLargeImage={setLocalLargeImage}
        localLargeImage={localLargeImage}
        title={"Au Dessus Les Promotions Disponibles"}
        position={"BannerPromotion"}
      />
    </div>
  );
};

export default TopOfPromotion;
