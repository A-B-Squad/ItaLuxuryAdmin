"use client";
import "./globals.css";
import Image from "next/image";
import React from "react";
import { Metadata } from "next";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";

export const metadata: Metadata = {
  title: "Page non trouvée",
  description:
    "Cette page est introuvable. Veuillez vérifier l'URL que vous avez saisie ou retourner à la page d'accueil.",
};
if (process.env.NODE_ENV !== "production") {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

function NotFound() {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full bg-white  ">
        <Image
          alt="The guitarist in the concert."
          src={
            "https://res.cloudinary.com/dc1cdbirz/image/upload/v1715507897/muvdju2ecqaf7zsdfhog.jpg"
          }
          priority={true}
          style={{ objectFit: "contain" }}
          width={400}
          height={400}
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
