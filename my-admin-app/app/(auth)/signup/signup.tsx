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
        setErrorMessage("You are not authorized to create a moderator.");
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
    <div className="bg-gray-100 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          className="mx-auto"
          src="/LOGO.png"
          alt="ita-luxury"
          width={200}
          height={200}
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
                  className={`block w-full pl-10 sm:text-sm py-2 border-gray-300 outline-none rounded-md ${errors.fullName ? "border-red-300" : ""
                    }`}
                  placeholder="Nom complet"
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
                  placeholder="********"
                  className={`block w-full pl-10 sm:text-sm border-gray-300 outline-none py-2 rounded-md ${errors.password ? "border-red-300" : ""
                    }`}
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
                  className={`block w-full pl-10 sm:text-sm border-gray-300 py-2 outline-none rounded-md ${errors.confirmPassword ? "border-red-300" : ""
                    }`}
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
        </div>
      </div>
    </div>
  );
};

export default Signup;
