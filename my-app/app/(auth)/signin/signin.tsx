"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import Link from "next/link";
import Image from "next/image";
import "../../globals.css";

import { useToast } from "@/components/ui/use-toast";
import { SIGNIN_MUTATION } from "@/graphql/mutations";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock, FaGoogle, FaFacebook } from "react-icons/fa";
const Signin = () => {
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [SignIn, { loading }] = useMutation(SIGNIN_MUTATION, {
    onCompleted: () => {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur MaisonNg",
        className: "bg-green-500 text-white",
      });
      router.replace("/");
    },
    onError: (error) => {
      setErrorMessage(
        error.message === "Invalid email or password"
          ? "Email ou mot de passe invalide"
          : "Une erreur s'est produite. Veuillez réessayer.",
      );
    },
  });

  const onSubmit = (data: any) => {
    SignIn({ variables: { input: data } });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          className="mx-auto  "
          src="https://res.cloudinary.com/dc1cdbirz/image/upload/v1715518497/hoyr6n9tf2n68kiklveg.jpg"
          alt="MaisonNg"
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
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse e-mail
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 sm:text-sm outline-none py-2 border-gray-300 rounded-md ${
                    errors.email ? "border-red-300" : ""
                  }`}
                  placeholder="vous@exemple.com"
                  {...register("email", { required: "L'email est requis" })}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message as string}
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
          {/* //Google
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Ou continuer avec
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <Link
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <FaGoogle className="h-5 w-5" />
                  <span className="sr-only">Sign in with Google</span>
                </Link>
              </div>

              <div>
                <Link
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <FaFacebook className="h-5 w-5" />
                  <span className="sr-only">Sign in with Facebook</span>
                </Link>
              </div>
            </div>
          </div> */}

          <div className="mt-6 flex flex-col space-y-2 text-center text-sm">
            <p className="text-gray-600">
              Vous n'avez pas de compte ?{" "}
              <Link
                href="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                S'inscrire
              </Link>
            </p>
            <p className="text-gray-600">
              <Link
                href="/forgotPassword"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Mot de passe oublié ?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
