import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { Open_Sans } from "next/font/google";

if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}

const openSans = Open_Sans({
  subsets: ["cyrillic"],
});

export default function StaticalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className={openSans.className}>{children}</section>;
}
