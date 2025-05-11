"use client";
import { CREATE_COUPONS_MUTATIONS } from "@/app/graph/mutations";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@apollo/client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SmallSpinner from "../../components/SmallSpinner";

interface FormErrors {
  couponCode: string;
  percentage: string;
}

const CreateCoupons = () => {
  const { toast } = useToast();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState("");
  const [percentage, setPercentage] = useState<number | "">(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    couponCode: "",
    percentage: "",
  });

  const [createCoupons] = useMutation(CREATE_COUPONS_MUTATIONS);

  const generateCouponCode = useCallback(() => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    setCouponCode(result);
    
    // Clear any error when generating a new code
    setFormErrors(prev => ({
      ...prev,
      couponCode: "",
    }));
  }, []);

  useEffect(() => {
    generateCouponCode();
  }, [generateCouponCode]);

  const validateForm = useCallback(() => {
    const errors = {
      couponCode: "",
      percentage: "",
    };
    let isValid = true;

    if (!couponCode.trim()) {
      errors.couponCode = "Le code du coupon est requis";
      isValid = false;
    }

    if (percentage === "") {
      errors.percentage = "Le pourcentage de réduction est requis";
      isValid = false;
    } else if (Number(percentage) < 0 || Number(percentage) > 100) {
      errors.percentage = "Le pourcentage doit être entre 0 et 100";
      isValid = false;
    } else if (isNaN(Number(percentage))) {
      errors.percentage = "Le pourcentage doit être un nombre valide";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [couponCode, percentage]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Formulaire incomplet",
        variant: "destructive",
        description: "Veuillez corriger les erreurs dans le formulaire.",
        duration: 5000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createCoupons({
        variables: {
          input: {
            code: couponCode,
            discount: parseFloat(Number(percentage).toFixed(4)), 
          },
        },
      });

      // Reset inputs
      setCouponCode("");
      setPercentage("");
      generateCouponCode();

      toast({
        title: "Coupon créé",
        className: "text-white bg-mainColorAdminDash border-0",
        description: "Le coupon a été créé avec succès.",
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: "Erreur de création",
        variant: "destructive",
        description: error.message || "Une erreur est survenue lors de la création du coupon.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [couponCode, percentage, createCoupons, generateCouponCode, toast, validateForm]);

  const handlePercentageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow decimal values
    if (value === "") {
      setPercentage("");
    } else {
      // Convert to number but allow decimal places
      const numValue = Number(value);
      setPercentage(isNaN(numValue) ? "" : numValue);
    }
    
    // Clear error when user types
    setFormErrors(prev => ({
      ...prev,
      percentage: "",
    }));
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Créer un Coupon</h1>
        <button
          onClick={() => router.push("/Coupons")}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Retour aux coupons
        </button>
      </div>
      
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="couponCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Code du Coupon <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="couponCode"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setFormErrors(prev => ({ ...prev, couponCode: "" }));
                  }}
                  maxLength={10}
                  className={`block w-full py-2 px-3 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.couponCode ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={generateCouponCode}
                  className="ml-2 bg-mainColorAdminDash hover:bg-opacity-90 transition-all text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Générer
                </button>
              </div>
              {formErrors.couponCode && (
                <p className="mt-1 text-sm text-red-500">{formErrors.couponCode}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Le code du coupon doit être unique et sera utilisé par les clients lors du paiement.
              </p>
            </div>

            <div>
              <label
                htmlFor="percentage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pourcentage de réduction <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="percentage"
                  value={percentage}
                  onChange={handlePercentageChange}
                  min="0"
                  max="100"
                  step="any" 
                  className={`block w-full py-2 px-3 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.percentage ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">%</span>
                </div>
              </div>
              {formErrors.percentage && (
                <p className="mt-1 text-sm text-red-500">{formErrors.percentage}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Entrez un pourcentage entre 0 et 100 qui sera appliqué comme réduction sur le total de la commande. Les valeurs décimales sont acceptées.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-mainColorAdminDash hover:bg-opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <SmallSpinner />
                  <span className="ml-2">Création en cours...</span>
                </div>
              ) : (
                "Créer le Coupon"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoupons;