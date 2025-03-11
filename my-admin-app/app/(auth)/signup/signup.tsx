"use client";

import { CREATE_MODERATOR } from "@/app/graph/mutations";
import { useMutation } from "@apollo/client";
import Cookies from "js-cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaLock, FaUser } from "react-icons/fa";

interface DecodedToken extends JwtPayload {
  userId: string;
}

const Signup = () => {
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("AdminToken");
    if (token) {
      const decoded = jwt.decode(token) as DecodedToken;
      setDecodedToken(decoded);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [signUp, { loading }] = useMutation(CREATE_MODERATOR, {
    onCompleted: () => {
      router.replace("/Dashboard");
    },
    onError: (error) => {
      // Extract and set the error message
      if (error.message.includes("User is not authorized")) {
        setErrorMessage("Vous n'êtes pas autorisé à créer un modérateur.");
      } else if (error.message.includes("Email address is already in use")) {
        setErrorMessage("L'adresse e-mail est déjà utilisée");
      } else {
        setErrorMessage("Une erreur s'est produite. Veuillez réessayer.");
      }
    },
  });

  const onSubmit = (data: any) => {
    signUp({
      variables: {
        adminId: decodedToken?.userId,
        input: {
          fullName: data.fullName,
          password: data.password,
          role: "MODERATOR",
        },
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
          Créer un compte modérateur
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ajoutez un nouveau modérateur à votre équipe
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
                Nom complet
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser
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
                  placeholder="Entrez le nom complet"
                  {...register("fullName", {
                    required: "Le nom complet est requis",
                  })}
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
                  placeholder="Entrez le mot de passe"
                  className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border ${
                    errors.password ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2`}
                  {...register("password", {
                    required: "Le mot de passe est requis",
                    minLength: {
                      value: 8,
                      message:
                        "Le mot de passe doit comporter au moins 8 caractères",
                    },
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
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmer le mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirmez le mot de passe"
                  className={`block w-full pl-10 pr-3 py-2.5 sm:text-sm border ${
                    errors.confirmPassword ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2`}
                  {...register("confirmPassword", {
                    required: "Veuillez confirmer votre mot de passe",
                    validate: (val: string) => {
                      if (watch("password") != val) {
                        return "Les mots de passe ne correspondent pas";
                      }
                    },
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword.message as string}
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
                    Création en cours...
                  </span>
                ) : (
                  "Créer un compte modérateur"
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

export default Signup;
