"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { COMPANY_INFO_QUERY } from "@/app/graph/queries";
import { CREATE_COMPANY_INFO_MUTATIONS } from "@/app/graph/mutations";
import { useToast } from "@/components/ui/use-toast";
import {
  IoImageOutline,
  IoLogoInstagram,
  IoLogoFacebook,
  IoCall,
  IoMail,
  IoLocationSharp,
} from "react-icons/io5";
import { IconType } from "react-icons";
import BackUp from "@/app/(mainApp)/components/BackUp";

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

interface FormField {
  icon: IconType;
  label: string;
  field: keyof CompanyData;
  index?: number;
}

const Loader = () => (
  <div className="flex justify-center items-center h-full w-full">
    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

const CompanyInfopage = () => {
  const { toast } = useToast();
  const [showBackUp, setShowBackUp] = useState(false);
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
        phone: companyInfo.phone,
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
        phone: phone,
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
    setShowBackUp(true);

    const file = result.info;
    if (file) {
      setCompanyInfo((prev) => ({
        ...prev,
        logo: file.url,
      }));

      setLoadingImages((prev) => ({
        ...prev,
        [file.url]: true,
      }));
    }
  };

  const handleInputChange = (
    field: keyof CompanyData,
    value: string | number,
  ) => {
    setShowBackUp(true);
    setCompanyInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhoneInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setShowBackUp(true);

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
    setShowBackUp(true);

    const value = parseFloat(e.target.value);
    setCompanyInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formFields: FormField[] = [
    { icon: IoLogoInstagram, label: "Instagram", field: "instagram" },
    { icon: IoLogoFacebook, label: "Facebook", field: "facebook" },
    { icon: IoCall, label: "Numéro de téléphone 1", field: "phone", index: 0 },
    { icon: IoCall, label: "Numéro de téléphone 2", field: "phone", index: 1 },
    { icon: IoLocationSharp, label: "Location", field: "location" },
    { icon: IoMail, label: "Email", field: "email" },
    {
      icon: IoImageOutline,
      label: "Prix de livraison",
      field: "deliveringPrice",
    },
  ];

  return (
    <div className="company-info bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-2 border-b border-gray-200">
          Informations de l'entreprise
        </h1>

        <div className="mb-8">
          {companyInfo.logo ? (
            <div className="h-[150px] w-[250px] relative border-2 border-gray-300 rounded-lg overflow-hidden">
              <Image
                src={companyInfo.logo}
                alt="Logo de l'entreprise"
                layout="fill"
                objectFit="contain"
                className="bg-white"
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
            <div className="h-[150px] w-[250px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 bg-white">
              <span className="text-sm">250px / 150px</span>
              <span className="text-sm">png / jpg / gif</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Ajouter une Nouvelle Logo
          </p>
          <CldUploadWidget
            uploadPreset="ita-luxury"
            onSuccess={(result: any, { widget }) => {
              handleSuccessUpload(result);
              widget.close();
            }}
          >
            {({ open }) => (
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => open && open()}
              >
                <IoImageOutline className="mr-2 -ml-1 h-5 w-5" />
                Choisir une image
              </button>
            )}
          </CldUploadWidget>
        </div>

        <div className="space-y-6">
          {formFields.map((item, idx) => (
            <div
              key={idx}
              className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start"
            >
              <label
                htmlFor={item.field}
                className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
              >
                <item.icon className="inline-block mr-2 h-5 w-5 text-gray-400" />
                {item.label}
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type={item.field === "deliveringPrice" ? "number" : "text"}
                  name={item.field}
                  id={item.field}
                  value={
                    item.index !== undefined
                      ? companyInfo.phone[item.index]
                      : companyInfo[item.field].toString()
                  }
                  onChange={(e) =>
                    item.index !== undefined
                      ? handlePhoneInputChange(item.index, e)
                      : item.field === "deliveringPrice"
                        ? handleNumberInputChange(item.field, e)
                        : handleInputChange(item.field, e.target.value)
                  }
                  className="max-w-lg block w-full px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <BackUp onSave={handleSave} showBackUp={showBackUp} />
    </div>
  );
};

export default CompanyInfopage;
