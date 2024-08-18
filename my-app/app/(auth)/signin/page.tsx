import React from "react";
import Signin from "./signin";
import keywords from "@/public/keywords";
import { Metadata } from "next";
if (
  !process.env.NEXT_PUBLIC_API_URL ||
  !process.env.NEXT_PUBLIC_BASE_URL_DOMAIN
) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL_DOMAIN),
  title: "Connexion - MaisonNg",
  description:
    "Connectez-vous à votre compte MaisonNg pour accéder à votre profil et effectuer des achats en ligne.",
  keywords: keywords, // Use the imported keywords

  openGraph: {
    url: `${process.env.NEXT_PUBLIC_BASE_URL_DOMAIN}/signin`,
    type: "website",
    title: "Connexion - MaisonNg",
    description:
      "Connectez-vous à votre compte MaisonNg pour accéder à votre profil et effectuer des achats en ligne.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL_DOMAIN}/images/logo.jpeg`,
        width: 800,
        height: 600,
        alt: "Maison Ng",
      },
    ],
  },
};
const page = () => {
  return <Signin />;
};

export default page;
