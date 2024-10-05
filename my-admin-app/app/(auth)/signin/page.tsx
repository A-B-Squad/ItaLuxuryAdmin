import React from "react";
import Signin from "./signin";
import keywords from "@/public/keywords";
import { Metadata } from "next";
if (!process.env.NEXT_PUBLIC_API_URL || !process.env.NEXT_PUBLIC_ADMIN_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_ADMIN_URL),
  title: "Connexion - ita-luxury",
  description:
    "Connectez-vous à votre compte ita-luxury pour accéder à votre profil et effectuer des achats en ligne.",
  keywords: keywords, // Use the imported keywords

  openGraph: {
    url: `${process.env.NEXT_PUBLIC_ADMIN_URL}/signin`,
    type: "website",
    title: "Connexion - ita-luxury",
    description:
      "Connectez-vous à votre compte ita-luxury pour accéder à votre profil et effectuer des achats en ligne.",
    images: [
      {
        url: "/my-app/public/images/LOGO.png",
        width: 800,
        height: 600,
        alt: "Ita-Luxury",
      },
    ],
  },
};
const page = () => {
  return <Signin />;
};

export default page;
