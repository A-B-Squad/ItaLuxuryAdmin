"use client";

import { useMutation } from "@apollo/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "../../globals.css";

import { ADMIN_SIGNIN } from "@/app/graph/mutations";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock, FaUserShield } from "react-icons/fa";
import { setToken } from "@/app/utils/tokens/token";
import { useAuth } from "@/app/hooks/useAuth";

const Signin = () => {
  const { toast } = useToast();
  const { updateToken } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [SignIn, { loading }] = useMutation(ADMIN_SIGNIN);

  const onSubmit = (data: any) => {
    setErrorMessage("");
    SignIn({
      variables: { input: data },
      onCompleted: (data) => {

        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur ita-luxury",
          className: "bg-green-500 text-white",
        });
        setToken(data.adminSignIn);
        updateToken(data.adminSignIn);
        router.replace("/Dashboard");
      },
      onError: (error) => {
        setErrorMessage(
          error.message === "Invalid Admin"
            ? "Identifiants invalides. Veuillez vérifier votre nom d'utilisateur et mot de passe."
            : "Une erreur s'est produite. Veuillez réessayer plus tard."
        );
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image
            className="h-20 w-auto"
            src="/LOGO.png"
            alt="ita-luxury"
            width={200}
            height={200}
            priority
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Administration Ita Luxury
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connectez-vous pour accéder au tableau de bord
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-gray-100">
          {errorMessage && (
            <div
              className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
              role="alert"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Nom d'utilisateur
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
                  className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border ${
                    errors.fullName ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2`}
                  placeholder="Entrez votre nom d'utilisateur"
                  {...register("fullName", { required: "Le nom d'utilisateur est requis" })}
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
                  className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border ${
                    errors.role ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2`}
                  {...register("role", { required: "Le rôle est requis" })}
                >
                  <option value="">Sélectionnez un rôle</option>
                  <option value="ADMIN">Administrateur</option>
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
                  placeholder="Entrez votre mot de passe"
                  autoComplete="current-password"
                  className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border ${
                    errors.password ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2`}
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
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Ita Luxury Admin Panel
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
