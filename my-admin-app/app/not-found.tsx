"use client";
import Image from "next/image";

import React from "react";
import { Metadata } from "next";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
if (!process.env.NEXT_PUBLIC_BASE_URL_DOMAIN) {
  throw new Error("BASE_URL_DOMAIN is not defined");
}
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL_DOMAIN),

  openGraph: {
    type: "website",
    title: "Page non trouvée",
    description:
      "Cette page est introuvable. Veuillez vérifier l'URL que vous avez saisie ou retourner à la page d'accueil.",

    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL_DOMAIN}/images/logos/LOGO-WHITE-BG.webp`,
        width: 1200,
        height: 630,
        alt: "ita-luxury",
      },
    ],
  },
};
if (process.env.NODE_ENV !== "production") {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

function NotFound() {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-screen bg-white  ">
        <Image
          alt="404"
          src="/images/ui/404.webp"
          priority={true}
          style={{ objectFit: "contain" }}
          width={400}
          height={300}
          quality={100}
        />
        <p className="pt-2 bg-white pb-5 text-lg font-light">
          Je suis désolé, mais la page que vous demandez est introuvable.
        </p>
      </div>
    </>
  );
}
export default NotFound;
