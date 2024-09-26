"use client";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import UploadSideAds from "../components/uploadNextToCarouselAds";

const NextToCarouselAds1 = ({ setInputField, inputField }: any) => {
  const [localLargeImage, setLocalLargeImage] = useState<string>("");

  const { data: NextToCarouselAds, loading: loadingNextToCarouselAds } =
    useQuery(ADVERTISSMENT_QUERY, {
      variables: { position: "NextToCarouselAds" },
    });

  useEffect(() => {
    if (NextToCarouselAds?.advertismentByPosition) {
      const ad = NextToCarouselAds.advertismentByPosition[0];
      if (ad) {
        setInputField({
          images: ad.images[0] ? [ad.images[0]] : [],

          link: ad.link || "",
          position: "NextToCarouselAds",
        });
        setLocalLargeImage(ad.images[0] || "");
      }
    }
  }, [NextToCarouselAds]);

  return (
    <div className="NextToCarouselAds">
      <UploadSideAds
        localInputField={inputField}
        setLocalInputField={setInputField}
        setLocalLargeImage={setLocalLargeImage}
        localLargeImage={localLargeImage}
        title={"En haut à côté du carrousel"}
      />
    </div>
  );
};

export default NextToCarouselAds1;
