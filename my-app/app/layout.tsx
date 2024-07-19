import React from "react";
import "./globals.css";
import { Open_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import DashboardLayout from "./DashboardLayout";

if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}

const openSans = Open_Sans({
  subsets: ["cyrillic"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
      </head>
      <body className={openSans.className}>
        <ApolloWrapper>
          <DashboardLayout>{children}</DashboardLayout>
        </ApolloWrapper>
        <Toaster />
      </body>
    </html>
  );
}
