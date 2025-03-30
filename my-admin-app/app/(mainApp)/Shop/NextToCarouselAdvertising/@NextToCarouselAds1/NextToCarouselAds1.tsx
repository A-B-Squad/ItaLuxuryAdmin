"use client";
import { ADVERTISSMENT_QUERY } from "@/app/graph/queries";
import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import UploadSideAds from "../components/uploadNextToCarouselAds";

// Remove the import for the missing Skeleton component
// import { Skeleton } from "@/components/ui/skeleton";

interface NextToCarouselAdsProps {
  setInputField: (data: any) => void;
  inputField: {
    images: string;
    link: string;
    position: string;
  };
}

const NextToCarouselAds1: React.FC<NextToCarouselAdsProps> = ({ setInputField, inputField }) => {
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
  }, [NextToCarouselAds, setInputField]);

  return (
    <div className="w-full">
      {loadingNextToCarouselAds ? (
        // Replace Skeleton with custom loading UI using div elements
        <div className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="h-[300px] w-full bg-gray-200 animate-pulse rounded-md"></div>
          <div className="h-10 w-full bg-gray-200 animate-pulse rounded-md"></div>
        </div>
      ) : (
        <UploadSideAds
          localInputField={inputField}
          setLocalInputField={setInputField}
          setLocalLargeImage={setLocalLargeImage}
          localLargeImage={localLargeImage}
          title={"Top Advertisement (Next to Carousel)"}
        />
      )}
    </div>
  );
};

export default NextToCarouselAds1;
