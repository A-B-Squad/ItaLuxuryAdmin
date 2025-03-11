"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  IoSaveOutline,
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
  placeholder?: string;
  type?: string;
}

const CompanyInfopage = () => {
  const { toast } = useToast();
  const [showBackUp, setShowBackUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyData>({
    phone: ["", ""],
    deliveringPrice: 0,
    logo: "",
    instagram: "",
    facebook: "",
    location: "",
    email: "",
  });

  const { data: companyInfoData, loading: queryLoading } = useQuery(COMPANY_INFO_QUERY);
  const [createCompanyInfo] = useMutation(CREATE_COMPANY_INFO_MUTATIONS);

  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true);
      const input = {
        logo: companyInfo.logo,
        phone: companyInfo.phone,
        instagram: companyInfo.instagram,
        facebook: companyInfo.facebook,
        location: companyInfo.location,
        email: companyInfo.email,
        deliveringPrice: companyInfo.deliveringPrice,
      };

      // Validate required fields
      const missingFields = [];
      if (!input.logo) missingFields.push("Logo");
      if (!input.phone[0]) missingFields.push("Numéro de téléphone principal");
      if (!input.instagram) missingFields.push("Instagram");
      if (!input.facebook) missingFields.push("Facebook");
      if (!input.location) missingFields.push("Adresse");
      if (!input.email) missingFields.push("Email");
      if (!input.deliveringPrice) missingFields.push("Prix de livraison");

      if (missingFields.length > 0) {
        toast({
          title: "Champs manquants",
          description: `Veuillez remplir les champs suivants: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      await createCompanyInfo({ variables: { input } });



      toast({
        title: "Succès",
        description: "Informations de l'entreprise mises à jour avec succès.",
        className: "bg-green-600 text-white",
      });

      setShowBackUp(false);
    } catch (error) {
      console.error("Error while saving:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les informations de l'entreprise.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [companyInfo, createCompanyInfo, toast]);

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
        phone: phone.length ? phone : ["", ""],
        deliveringPrice,
        logo,
        instagram,
        facebook,
        location,
        email,
      });
    }
  }, [companyInfoData]);

  const handleSuccessUpload = useCallback((result: any) => {
    setShowBackUp(true);
    setLogoLoading(false);

    const file = result.info;
    if (file) {
      setCompanyInfo((prev) => ({
        ...prev,
        logo: file.url,
      }));
    }
  }, []);

  const handleInputChange = useCallback((
    field: keyof CompanyData,
    value: string | number,
  ) => {
    setShowBackUp(true);
    setCompanyInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handlePhoneInputChange = useCallback((
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
  }, [companyInfo.phone]);

  const formFields: FormField[] = [
    {
      icon: IoLogoInstagram,
      label: "Instagram",
      field: "instagram",
      placeholder: "Lien Instagram"
    },
    {
      icon: IoLogoFacebook,
      label: "Facebook",
      field: "facebook",
      placeholder: "Lien Facebook"
    },
    {
      icon: IoCall,
      label: "Numéro de téléphone principal",
      field: "phone",
      index: 0,
      placeholder: "+216 6 XX XX XX XX"
    },
    {
      icon: IoCall,
      label: "Numéro de téléphone secondaire",
      field: "phone",
      index: 1,
      placeholder: "+216 6 XX XX XX XX"
    },
    {
      icon: IoLocationSharp,
      label: "Adresse",
      field: "location",
      placeholder: "Adresse complète"
    },
    {
      icon: IoMail,
      label: "Email",
      field: "email",
      placeholder: "contact@italuxury.com",
      type: "email"
    },
    {
      icon: IoImageOutline,
      label: "Prix de livraison",
      field: "deliveringPrice",
      placeholder: "0.00",
      type: "number"
    },
  ];

  return (
    <div className="company-info py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Informations de l'entreprise
          </h2>
        </div>

        <div className="p-6">
          <div className="space-y-8">
            {/* Logo Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Logo de l'entreprise</h3>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {queryLoading ? (
                  <div className="h-[150px] w-[250px] rounded-lg bg-gray-200 animate-pulse" />
                ) : companyInfo.logo ? (
                  <div className="h-[150px] w-[250px] relative border rounded-lg overflow-hidden bg-white flex items-center justify-center">
                    <Image
                      src={companyInfo.logo}
                      alt="Logo de l'entreprise"
                      layout="fill"
                      objectFit="contain"
                      className="bg-white"
                      onLoadingComplete={() => setLogoLoading(false)}
                    />
                    {logoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[150px] w-[250px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 bg-white">
                    <IoImageOutline className="h-8 w-8 mb-2" />
                    <span className="text-sm">250px / 150px</span>
                    <span className="text-sm">png / jpg / gif</span>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Téléchargez le logo de votre entreprise. Formats recommandés: PNG, JPG ou GIF.
                  </p>

                  <CldUploadWidget
                    uploadPreset="ita-luxury"
                    onSuccess={(result: any, { widget }) => {
                      handleSuccessUpload(result);
                      widget.close();
                    }}
                    onUpload={() => setLogoLoading(true)}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                        onClick={() => open && open()}
                        disabled={logoLoading}
                      >
                        {logoLoading ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full" />
                            Chargement...
                          </>
                        ) : (
                          <>
                            <IoImageOutline className="mr-2 h-4 w-4" />
                            Choisir une image
                          </>
                        )}
                      </button>
                    )}
                  </CldUploadWidget>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-6">
              {formFields.map((item, idx) => (
                <div key={idx} className="grid sm:grid-cols-3 gap-4 items-center">
                  <label
                    htmlFor={`${item.field}${item.index !== undefined ? item.index : ''}`}
                    className="flex items-center text-gray-700 text-sm font-medium"
                  >
                    <item.icon className="mr-2 h-5 w-5 text-gray-500" />
                    {item.label}
                  </label>

                  <div className="sm:col-span-2">
                    <input
                      type={item.type || "text"}
                      id={`${item.field}${item.index !== undefined ? item.index : ''}`}
                      placeholder={item.placeholder}
                      value={
                        item.index !== undefined
                          ? companyInfo.phone[item.index]
                          : item.field === "deliveringPrice"
                            ? companyInfo[item.field].toString()
                            : companyInfo[item.field]
                      }
                      onChange={(e) =>
                        item.index !== undefined
                          ? handlePhoneInputChange(item.index, e)
                          : item.field === "deliveringPrice"
                            ? handleInputChange(item.field, parseFloat(e.target.value) || 0)
                            : handleInputChange(item.field, e.target.value)
                      }
                      className="max-w-md w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BackUp
        onSave={handleSave}
        showBackUp={showBackUp}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CompanyInfopage;
