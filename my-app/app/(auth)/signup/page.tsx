import React from "react";
import Signup from "./signup";
import { Metadata } from "next";
import keywords from "@/public/keywords";

if (
  !process.env.NEXT_PUBLIC_API_URL ||
  !process.env.NEXT_PUBLIC_BASE_URL_DOMAIN
) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL_DOMAIN),
  title: "Inscription - ita-luxury",
  description:
    "Inscrivez-vous à ita-luxury pour créer un compte et commencer à faire des achats en ligne.",
  keywords: keywords,

  openGraph: {
    url: `${process.env.NEXT_PUBLIC_BASE_URL_DOMAIN}/signup`,
    type: "website",
    title: "Inscription - ita-luxury",
    description:
      "Inscrivez-vous à ita-luxury pour créer un compte et commencer à faire des achats en ligne.",
    images: [
      {
        url: "/my-app/app/public/images/LOGO.png",
        width: 800,
        height: 600,
        alt: "Ita-Luxury",
      },
    ],
  },
};

const Page = () => {
  return <Signup />;
};

export default Page;
