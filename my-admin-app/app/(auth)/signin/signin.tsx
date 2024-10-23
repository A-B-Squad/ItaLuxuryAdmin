"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import Image from "next/image";
import "../../globals.css";

import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock, FaUserShield } from "react-icons/fa";
import { ADMIN_SIGNIN } from "@/app/graph/mutations";

const Signin = () => {
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [SignIn, { loading }] = useMutation(ADMIN_SIGNIN);

  const onSubmit = (data: any) => {
    console.log(data)
    SignIn({
      
      variables: { input: data },

      onCompleted: () => {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur ita-luxury",
          className: "bg-green-500 text-white",
        });
        router.replace("/Dashboard");
      },
      onError: (error) => {
        setErrorMessage(
          error.message === "Invalid Admin"
            ? "Admin invalide"
            : "Une erreur s'est produite. Veuillez réessayer.",
        );
      },
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          className="mx-auto"
          src="https://www.ita-luxury.com/_next/image?url=https%3A%2F%2Fwww.ita-luxury.com%2F_next%2Fimage%3Furl%3Dhttp%253A%252F%252Fres.cloudinary.com%252Fdc1cdbirz%252Fimage%252Fupload%252Fv1727269305%252Fita-luxury%252FLOGO_hhpyix.png%26w%3D1920%26q%3D75&w=1080&q=75"
          alt="ita-luxury"
          width={200}
          height={200}
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connectez-vous à votre compte
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errorMessage && (
            <div
              className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="fullName"
                  type="text"
                  className={`block w-full pl-10 sm:text-sm outline-none py-2 border-gray-300 rounded-md ${
                    errors.fullName ? "border-red-300" : ""
                  }`}
                  placeholder="Username"
                  {...register("fullName", { required: "name est requis" })}
                />
              </div>
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.fullName.message as string}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Rôle
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserShield
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <select
                  id="role"
                  className={`block w-full pl-10 sm:text-sm outline-none py-2 border-gray-300 rounded-md ${
                    errors.role ? "border-red-300" : ""
                  }`}
                  {...register("role", { required: "Le rôle est requis" })}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MODERATEUR">Modérateur</option>
                </select>
              </div>
              {errors.role && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.role.message as string}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="********"
                  autoComplete="current-password"
                  className={`block w-full pl-10 sm:text-sm outline-none py-2 border-gray-300 rounded-md ${
                    errors.password ? "border-red-300" : ""
                  }`}
                  {...register("password", {
                    required: "Le mot de passe est requis",
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? "Chargement..." : "Se connecter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;
