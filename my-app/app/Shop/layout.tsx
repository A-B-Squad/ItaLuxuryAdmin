import React from "react";
import SideBarShopMenu from "./components/sideBarMenu";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
  AdvertisingPage: React.ReactNode;
}>) => {
  return (
    <div className=" container w-full  flex items-center justify-center ">
      {/* <SideBarShopMenu /> */}
      {/* <div className=" w-full  flex items-center justify-center"> */}
      <div>{children}</div>
      {/* </div> */}
    </div>
  );
};

export default Layout;
