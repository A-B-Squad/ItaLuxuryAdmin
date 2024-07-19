"use client";
import { useMutation, useQuery } from "@apollo/client";
import { CldUploadWidget } from "next-cloudinary";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { COMPANY_INFO_QUERY } from "@/app/graph/queries";
import { IoImageOutline } from "react-icons/io5";
import {
  IoLogoInstagram,
  IoLogoFacebook,
  IoCall,
  IoMail,
  IoLocationSharp,
} from "react-icons/io5";
import BackUp from "@/app/components/BackUp";
import { CREATE_COMPANY_INFO_MUTATIONS } from "@/app/graph/mutations";
import { useToast } from "@/components/ui/use-toast";

// Define types for the state
interface CompanyData {
  phone: string[];
  deliveringPrice: number;
  logo: string;
  instagram: string;
  facebook: string;
  location: string;
  email: string;
}

const Loader = () => (
  <div className="flex justify-center items-center h-full w-full">
    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

const CompanyInfopage = () => {
  const { toast } = useToast();

  const [companyInfo, setCompanyInfo] = useState<CompanyData>({
    phone: ["", ""],
    deliveringPrice: 0,
    logo: "",
    instagram: "",
    facebook: "",
    location: "",
    email: "",
  });
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {},
  );

  const { data: companyInfoData } = useQuery(COMPANY_INFO_QUERY);
  const [createCompanyInfo] = useMutation(CREATE_COMPANY_INFO_MUTATIONS);

  const handleSave = async () => {
    try {
      const input = {
        logo: companyInfo.logo,
        phone: companyInfo.phone.map(Number),
        instagram: companyInfo.instagram,
        facebook: companyInfo.facebook,
        location: companyInfo.location,
        email: companyInfo.email,
        deliveringPrice: companyInfo.deliveringPrice,
      };

      if (
        !input.logo ||
        input.phone.length === 0 ||
        !input.instagram ||
        !input.facebook ||
        !input.location ||
        !input.email ||
        !input.deliveringPrice
      ) {
        toast({
          title: "Erreur",
          description:
            "Veuillez remplir tous les champs pour chaque information de l'entreprise.",
          className: "bg-red-800 text-white",
        });
        return;
      }

      await createCompanyInfo({ variables: { input } });
      toast({
        title: "Succès",
        description: "Informations de l'entreprise mises à jour avec succès.",
        className: "bg-green-600 text-white",
      });
    } catch (error) {
      console.error("Error while saving:", error);
      toast({
        title: "Erreur",
        description:
          "Impossible de mettre à jour les informations de l'entreprise.",
        className: "bg-red-800 text-white",
      });
    }
  };

  useEffect(() => {
    if (companyInfoData?.companyInfo) {
      const {
        phone,
        deliveringPrice,
        logo,
        instagram,
        facebook,
        location,
        email,
      } = companyInfoData.companyInfo;
      setCompanyInfo({
        phone: phone.map(String),
        deliveringPrice,
        logo,
        instagram,
        facebook,
        location,
        email,
      });
    }
  }, [companyInfoData]);

  const handleSuccessUpload = (result: any) => {
    const file = result.info;
    if (file) {
      setCompanyInfo((prev) => ({
        ...prev,
        logo: file.url,
      }));

      setLoadingImages((prev) => ({
        ...prev,
        [file.url]: true, // Set true to show the loader until the companyInfo is fully loaded
      }));
    }
  };

  const handleInputChange = (
    field: keyof CompanyData,
    value: string | number[],
  ) => {
    setCompanyInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhoneInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newPhone = [...companyInfo.phone];
    newPhone[index] = e.target.value;
    setCompanyInfo((prev) => ({
      ...prev,
      phone: newPhone,
    }));
  };

  const handleNumberInputChange = (
    field: keyof CompanyData,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseFloat(e.target.value);
    setCompanyInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="company-info">
      <div className=" container flex flex-col items-start pb-32 h-full w-full relative">
        <div className="flex mb-4 gap-2">
          <h1 className="text-3xl font-semibold">
            Informations de l'entreprise
          </h1>
        </div>
        <div className="w-full mb-4">
          {companyInfo.logo ? (
            <div className="h-[150px] w-[250px] relative border-2">
              <Image
                src={companyInfo.logo}
                alt="Logo de l'entreprise"
                layout="fill"
                objectFit="contain"
                onLoadingComplete={() =>
                  setLoadingImages((prev) => ({
                    ...prev,
                    [companyInfo.logo]: false,
                  }))
                }
              />
              {loadingImages[companyInfo.logo] && <Loader />}
            </div>
          ) : (
            <div className="uppercase shadow-xl flex-col border-dashed text-sm h-[150px] w-[250px] tracking-wider text-gray-500 border rounded-md border-lightBlack flex items-center justify-center text-center bg-gray-200 transition-colors">
              <span>250px / 150px</span>
              <span>png / jpg / gif</span>
            </div>
          )}
        </div>
        <div className="AddNewCompanyInfo flex flex-col justify-between mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="tracking-wider">Ajouter une Nouvelle Logo</p>
          </div>
          <div className="flex items-center w-full border-b py-2 justify-between mb-2">
            <div className="flex items-center justify-between gap-2">
              <CldUploadWidget
                uploadPreset="MaisonNg"
                onSuccess={(result, { widget }) => {
                  handleSuccessUpload(result);
                  widget.close();
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    className="uppercase shadow-xl flex-col border-dashed text-sm h-[50px] w-[100px] tracking-wider text-gray-500 border rounded-md border-lightBlack flex items-center justify-center text-center bg-gray-200 transition-colors cursor-pointer"
                    onClick={() => open()}
                  >
                    <IoImageOutline />
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <label className="flex items-center gap-2">
            <IoLogoInstagram />
            <span>Instagram</span>
          </label>
          <input
            type="text"
            className="outline-none border w-[500px] px-2 py-3"
            placeholder="Instagram"
            value={companyInfo.instagram}
            onChange={(e) => handleInputChange("instagram", e.target.value)}
          />
          <label className="flex items-center gap-2">
            <IoLogoFacebook />
            <span>Facebook</span>
          </label>
          <input
            type="text"
            className="outline-none border w-[500px] px-2 py-3"
            placeholder="Facebook"
            value={companyInfo.facebook}
            onChange={(e) => handleInputChange("facebook", e.target.value)}
          />
          <label className="flex items-center gap-2">
            <IoCall />
            <span>Numéro de téléphone 1</span>
          </label>
          <input
            type="text"
            className="outline-none border px-2 py-3"
            placeholder="Numéro de téléphone 1"
            value={companyInfo.phone[0]}
            onChange={(e) => handlePhoneInputChange(0, e)}
          />
          <label className="flex items-center gap-2">
            <IoCall />
            <span>Numéro de téléphone 2</span>
          </label>
          <input
            type="text"
            className="outline-none border px-2 py-3"
            placeholder="Numéro de téléphone 2"
            value={companyInfo.phone[1]}
            onChange={(e) => handlePhoneInputChange(1, e)}
          />
          <label className="flex items-center gap-2">
            <IoLocationSharp />
            <span>Location</span>
          </label>
          <input
            type="text"
            className="outline-none border px-2 py-3"
            placeholder="Location"
            value={companyInfo.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
          />
          <label className="flex items-center gap-2">
            <IoMail />
            <span>Email</span>
          </label>
          <input
            type="email"
            className="outline-none border px-2 py-3"
            placeholder="Email"
            value={companyInfo.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
          <label className="flex items-center gap-2">
            <IoLogoInstagram />
            <span>Prix de livraison</span>
          </label>
          <input
            type="number"
            className="outline-none border px-2 py-3"
            placeholder="Prix de livraison"
            value={companyInfo.deliveringPrice}
            onChange={(e) => handleNumberInputChange("deliveringPrice", e)}
          />
        </div>
      </div>
      <div className="mt-4">
        <BackUp onSave={handleSave} />
      </div>
    </div>
  );
};

export default CompanyInfopage;
