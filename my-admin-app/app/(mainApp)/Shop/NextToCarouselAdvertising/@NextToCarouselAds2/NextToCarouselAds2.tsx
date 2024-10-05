"use client";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import UploadSideAds from "../components/uploadNextToCarouselAds";

const NextToCarouselAds2 = ({ setInputField, inputField }: any) => {
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
          images: [ad.images[1]] || "",
          link: ad.link || "",
          position: "NextToCarouselAds",
        });
        setLocalLargeImage(ad.images[1] || "");
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
        title={"En bas à côté du carrousel"}
      />
    </div>
  );
};

export default NextToCarouselAds2;
