"use client";
import { CREATE_COUPONS_MUTATIONS } from "@/app/graph/mutations";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@apollo/client";
import React, { useState, useEffect } from "react";

const CreateCoupons = () => {
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState("");
  const [percentage, setPercentage] = useState<number | "">("");
  const [createCoupons] = useMutation(CREATE_COUPONS_MUTATIONS);

  const generateCouponCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < 30; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    setCouponCode(result);
  };

  useEffect(() => {
    generateCouponCode();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponCode || percentage === "") {
      toast({
        title: "Erreur de création",
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires.",
        duration: 5000,
      });
      return;
    }

    createCoupons({
      variables: {
        input: {
          code: couponCode,
          discount: Number(percentage),
        },
      },
      onCompleted() {
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
      },
      onError(error) {
        toast({
          title: "Erreur de création",
          variant: "destructive",
          description:
            error.message ||
            "Une erreur est survenue lors de la création du coupon.",
          duration: 5000,
        });
      },
    });
  };

  return (
    <div className="mx-auto mt-10 p-6 bg-white w-11/12 border rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Créer un Coupon
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="couponCode"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Code du Coupon
          </label>
          <div className="flex">
            <input
              type="text"
              id="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              maxLength={30}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              readOnly
            />
            <button
              type="button"
              onClick={generateCouponCode}
              className="ml-2 bg-mainColorAdminDash hover:opacity-85 transition-opacity text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Générer
            </button>
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="percentage"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Pourcentage
          </label>
          <input
            type="number"
            id="percentage"
            value={percentage}
            onChange={(e) =>
              setPercentage(e.target.value ? Number(e.target.value) : "")
            }
            min="0"
            max="100"
            step="1"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="bg-mainColorAdminDash hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Créer le Coupon
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCoupons;
