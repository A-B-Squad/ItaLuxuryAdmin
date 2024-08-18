"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { CiUser } from "react-icons/ci";
import { FiPieChart } from "react-icons/fi";
import { IoIosNotificationsOutline } from "react-icons/io";

const Header = () => {
  const pathname = usePathname();
  const pathnameHandle = (pathname: string) => {
    switch (pathname) {
      case "/Statistical/Delivery":
        return (
          <div className="flex items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />

            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Delivery Page
            </h1>
          </div>
        );
      case "/Statistical/Products":
        return (
          <div className="flex items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />

            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Products Page
            </h1>
          </div>
        );
      case "/Statistical/Marketing":
        return (
          <div className="flex items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />

            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Markiting Page
            </h1>
          </div>
        );
    }
  };
  return (
    <header className=" sticky top-0 z-50   shadow-md py-4   bg-white font-[sans-serif] min-h-[70px]  tracking-wide w-full">
      <div className=" container flex items-center justify-between ">
        {pathnameHandle(pathname)}
        <div className="flex gap-2 items-center">
          <button className="p-2 relative text-sm rounded-md font-bold text-white border border-gray-300 transition-all ease-in-out duration-300 hover:bg-transparent hover:text-strongBeige">
            <span className="w-4  h-4 font-extralight p-2 flex items-center justify-center bg-red-700 text-white rounded-full absolute right-1 bottom-1 text-[10px]">
              0
            </span>
            <IoIosNotificationsOutline size={24} className="text-gray-600" />
          </button>
          <button className="p-2 text-sm rounded-md font-bold text-white border  border-gray-300 transition-all ease-in-out duration-300 hover:bg-transparent hover:text-strongBeige">
            <CiUser size={24} className="text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
