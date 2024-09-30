"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BiSave } from "react-icons/bi";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ADD_API_CREDENTIALS,
} from "@/app/graph/mutations";
import { GET_API_CREDENTIALS } from "@/app/graph/queries";
import { useRouter } from "next/navigation";

interface ApiCredential {
  id: string;
  access_token: string;
  api_id: string;
  domainVerification: string | null;
}

const FacebookIntegration: React.FC = () => {
  const [pixelId, setPixelId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [domainVerification, setDomainVerification] = useState("");
  const route = useRouter();
  const [getApiCredentials, { data: apiCredentialsData }] = useLazyQuery<{
    getApiCredentials: ApiCredential;
  }>(GET_API_CREDENTIALS);
  const [addApiCredentials] = useMutation(ADD_API_CREDENTIALS);

  useEffect(() => {
    getApiCredentials({ variables: { integrationFor: "FACEBOOK" } });
  }, [getApiCredentials]);

  useEffect(() => {
    if (apiCredentialsData && apiCredentialsData.getApiCredentials) {
      const cred = apiCredentialsData.getApiCredentials;
      setPixelId(cred.api_id);
      setAccessToken(cred.access_token);
      setDomainVerification(cred.domainVerification || "");
    }
  }, [apiCredentialsData]);

  const handleSave = async () => {
    try {
      // Add new credentials
      await addApiCredentials({
        variables: {
          input: {
            api_id: pixelId,
            access_token: accessToken,
            domainVerification: domainVerification,
            integrationFor: "FACEBOOK",
          },
        },
      });
      route.push("/Settings/Integration");
      console.log("Facebook Integration settings saved successfully");
    } catch (error) {
      console.error("Error saving credentials:", error);
    }
  };

  return (
    <div className="container">
      <div className="bg-gray-900 text-white w-full p-4 rounded-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Facebook</h2>

        <div className="space-y-4 flex flex-col w-full">
          <div className="w-full">
            <label className="block text-sm mb-1">Pixel ID</label>
            <input
              placeholder="Add your Pixel ID"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              className="bg-gray-800 px-2 py-2 rounded-md w-full text-sm outline-none border-gray-700"
            />
          </div>

          <div className="w-full">
            <label className="block text-sm mb-1">
              Access Token (Conversion API Key)
            </label>
            <input
              placeholder="Add your Access Token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="bg-gray-800 px-2 py-2 rounded-md w-full text-sm outline-none border-gray-700"
            />
          </div>

          <div className="w-full">
            <label className="block text-sm mb-1">Domain verification</label>
            <input
              placeholder="Add your code here"
              value={domainVerification}
              onChange={(e) => setDomainVerification(e.target.value)}
              className="bg-gray-800 w-full px-2 py-2 rounded-md text-sm outline-none border-gray-700"
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
