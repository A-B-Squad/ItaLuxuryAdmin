import React from "react";
import "./globals.css";
import { Open_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import { Metadata } from "next";
import Script from "next/script";

if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}

const openSans = Open_Sans({
  subsets: ["cyrillic"],
});

export const metadata: Metadata = {
  title: "Admin Dashboard | ita-luxury",
  description: "Tableau de bord administratif pour la gestion de ita-luxury",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/favicon.ico" sizes="any" />


        {/* <Script
          src="https://js.pusher.com/beams/1.0.0/push-notifications-cdn.js"
          strategy="beforeInteractive"
        /> */}

        {/* <Script id="pusher-beams-init" strategy="afterInteractive">
          {`
    const beamsClient = new PusherPushNotifications.Client({
      instanceId: "e7307155-0ed4-4c85-8198-822101af6f25",
    });
    beamsClient.start()
      .then(() => {
        return beamsClient.addDeviceInterest('admin-notifications');
      })
      .then(() => {
        return beamsClient.getDeviceInterests();
      })
      .then((interests) => {
        console.log("Current interests:", interests);
      })
      .catch(console.error);
  `}
        </Script> */}

      </head>
      <body className={openSans.className}>
        <ApolloWrapper>{children}</ApolloWrapper>
        <Toaster />
      </body>
    </html>
  );
}
