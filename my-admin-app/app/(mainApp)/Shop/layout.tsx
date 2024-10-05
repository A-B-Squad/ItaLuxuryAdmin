import React from "react";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className=" container w-full  flex items-center justify-center ">
      <div>{children}</div>
    </div>
  );
};

export default Layout;
