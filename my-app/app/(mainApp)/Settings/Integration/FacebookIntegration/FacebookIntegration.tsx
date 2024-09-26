"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BiPlus, BiSave } from "react-icons/bi";
import { FiTrash2 } from "react-icons/fi";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ADD_API_CREDENTIALS,
  DELETE_API_CREDENTIALS,
} from "@/app/graph/mutations";
import { GET_ALL_API_CREDENTIALS } from "@/app/graph/queries";

interface Credential {
  id?: string;
  api_id: string;
  access_token: string;
}

interface ApiCredential {
  api_id: string;
  access_token: string;
  domainVerification: string;
}

const FacebookIntegration: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([
    { api_id: "", access_token: "" },
  ]);
  const [domainVerification, setDomainVerification] = useState<string>("");

  const [getAllApiCredentials, { data: apiCredentialsData }] = useLazyQuery<{
    getAllApiCredentials: ApiCredential[];
  }>(GET_ALL_API_CREDENTIALS);
  const [addApiCredentials] = useMutation(ADD_API_CREDENTIALS);
  const [deleteApiCredentials] = useMutation(DELETE_API_CREDENTIALS);

  useEffect(() => {
    getAllApiCredentials({ variables: { integrationFor: "FACEBOOK" } });
  }, [getAllApiCredentials]);

  useEffect(() => {
    if (apiCredentialsData && apiCredentialsData.getAllApiCredentials) {
      const fetchedCredentials: Credential[] =
        apiCredentialsData.getAllApiCredentials.map((cred: ApiCredential) => ({
          id: cred.api_id,
          api_id: cred.api_id,
          access_token: cred.access_token,
        }));
      setCredentials(fetchedCredentials);
      setDomainVerification(
        apiCredentialsData.getAllApiCredentials[0]?.domainVerification || "",
      );
    }
  }, [apiCredentialsData]);

  const handleAddCredential = () => {
    setCredentials([...credentials, { api_id: "", access_token: "" }]);
  };

  const handleRemoveCredential = async (index: number) => {
    const credToRemove = credentials[index];
    if (credToRemove.id) {
      try {
        await deleteApiCredentials({
          variables: { deleteApiCredentialsId: credToRemove.id },
        });
      } catch (error) {
        console.error("Error deleting credential:", error);
      }
    }
    setCredentials(credentials.filter((_, i) => i !== index));
  };

  const handleInputChange = (
    index: number,
    field: keyof Credential,
    value: string,
  ) => {
    const newCredentials = [...credentials];
    newCredentials[index][field] = value;
    setCredentials(newCredentials);
  };

  const handleSave = async () => {
    try {
      for (const cred of credentials) {
        if (cred.api_id && cred.access_token) {
          await addApiCredentials({
            variables: {
              input: {
                api_id: cred.api_id,
                access_token: cred.access_token,
                domainVerification: domainVerification,
                integrationFor: "FACEBOOK",
              },
            },
          });
        }
      }
      console.log("Facebook Integration settings saved successfully");
    } catch (error) {
      console.error("Error saving credentials:", error);
    }
  };

  return (
    <div className="container">
      <div className="bg-gray-900 text-white w-full p-4 rounded-lg max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Facebook</h2>
          <Button
            variant="outline"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleAddCredential}
          >
            <BiPlus size={20} />
          </Button>
        </div>

        <div className="space-y-4 flex flex-col w-full">
          {credentials.map((cred, index) => (
            <div
              key={index}
              className="addPixel flex w-full justify-between items-center"
            >
              <div className="flex gap-3 text-center w-full items-center justify-between md:flex-row flex-col">
                <div className="w-full">
                  <label className="block text-sm mb-1">
                    API ID (Pixel ID)
                  </label>
                  <input
                    placeholder="Add your API ID"
                    value={cred.api_id}
                    onChange={(e) =>
                      handleInputChange(index, "api_id", e.target.value)
                    }
                    className="bg-gray-800 px-2 py-2 rounded-md w-full text-sm outline-none border-gray-700"
                  />
                </div>

                <div className="w-full">
                  <label className="block text-sm mb-1">
                    Access Token (Conversion API Key)
                  </label>
                  <input
                    placeholder="Add your Access Token"
                    value={cred.access_token}
                    onChange={(e) =>
                      handleInputChange(index, "access_token", e.target.value)
                    }
                    className="bg-gray-800 px-2 py-2 rounded-md w-full text-sm outline-none border-gray-700"
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                className="text-red-500 self-end hover:text-red-600"
                onClick={() => handleRemoveCredential(index)}
              >
                <FiTrash2 size={20} />
              </Button>
            </div>
          ))}

          <div className="domainVerificationInput w-full text-center">
            <label className="block text-sm mb-1">Domain verification</label>
            <input
              placeholder="Add your code here"
              value={domainVerification}
              onChange={(e) => setDomainVerification(e.target.value)}
              className="bg-gray-800 w-4/5 px-2 py-2 rounded-md text-sm outline-none border-gray-700"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="mt-6 bg-purple-600 hover:bg-purple-700"
        >
          <BiSave size={20} className="mr-2" /> Save
        </Button>
      </div>
    </div>
  );
};

export default FacebookIntegration;
