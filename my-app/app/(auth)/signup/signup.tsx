"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SIGNUP_MUTATION } from "@/graphql/mutations";
import { FaUser, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";

const Signup = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [signUp, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: () => {
      router.replace("/");
    },
    onError: (error) => {
      if (error.message === "Email address is already in use") {
        setErrorMessage("L'adresse e-mail est déjà utilisée");
      } else {
        console.log(error);

        setErrorMessage("Une erreur s'est produite. Veuillez réessayer.");
      }
    },
  });

  const onSubmit = (data: any) => {
    signUp({
      variables: {
        input: {
          fullName: data.fullName,
          email: data.email,
          number: data.number,
          password: data.password,
        },
      },
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          className="mx-auto h-12 w-auto"
          src="https://res.cloudinary.com/dc1cdbirz/image/upload/v1715518497/hoyr6n9tf2n68kiklveg.jpg"
          alt="MaisonNg"
          width={48}
          height={48}
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créez votre compte
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
                  className={`block w-full pl-10 sm:text-sm py-2 border-gray-300 outline-none rounded-md ${errors.fullName ? "border-red-300" : ""}`}
                  placeholder="nom"
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
                  className={`block w-full pl-10 sm:text-sm border-gray-300 py-2 outline-none rounded-md ${errors.email ? "border-red-300" : ""}`}
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
                htmlFor="number"
                className="block text-sm font-medium text-gray-700"
              >
                Numéro de téléphone
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="number"
                  type="tel"
                  className={`block w-full pl-10 sm:text-sm border-gray-300 outline-none py-2 rounded-md ${errors.number ? "border-red-300" : ""}`}
                  placeholder="+216 12 345 678"
                  {...register("number", {
                    required: "Le numéro de téléphone est requis",
                  })}
                />
              </div>
              {errors.number && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.number.message as string}
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
                  className={`block w-full pl-10 sm:text-sm border-gray-300 outline-none py-2 rounded-md ${errors.password ? "border-red-300" : ""}`}
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
                  placeholder="********"
                  className={`block w-full pl-10 sm:text-sm border-gray-300 py-2 outline-none rounded-md ${errors.confirmPassword ? "border-red-300" : ""}`}
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? "Création en cours..." : "Créer un compte"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <p className="mt-2 text-center text-sm text-gray-600">
              En vous inscrivant, vous acceptez nos{" "}
              <Link
                href="/Terms-of-use"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Conditions d'Utilisation
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/signin"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
