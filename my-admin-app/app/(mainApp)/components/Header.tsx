"use client";
import { usePathname, useRouter } from "next/navigation";
import { CiUser } from "react-icons/ci";
import { FiPieChart } from "react-icons/fi";
import { IoIosNotificationsOutline } from "react-icons/io";
import React, { useState } from "react";
import Cookies from "js-cookie";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pathnameHandle = (pathname: string) => {
    switch (pathname) {
      case "/Statistical/Delivery":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
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
          <div className="flex w-full items-center gap-2 text-sm">
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
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Marketing Page
            </h1>
          </div>
        );
      case "/Statistical/Customer":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Customer Page
            </h1>
          </div>
        );
      case "/Products":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-11/12 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Tous Les Produits Page
            </h1>
          </div>
        );
      case "/Products/CreateProduct":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-11/12 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Nouveau Produits Page
            </h1>
          </div>
        );
      case "/Products/Categories":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Categories Page
            </h1>
          </div>
        );
      case "/Products/Inventory":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Inventair Page
            </h1>
          </div>
        );
      case "/Products/Reviews":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Avis Page
            </h1>
          </div>
        );
      case "/Coupons":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Coupons Page
            </h1>
          </div>
        );
      case "/Coupons/CreateCoupons":
        return (
          <div className="flex w-full items-center gap-2 text-sm">
            <FiPieChart
              className="text-mainColorAdminDash"
              size={25}
              fontSize={600}
            />
            <h1 className="text-mainColorAdminDash tracking-wider font-semibold relative before:w-4/5 before:h-[2px]  before:absolute before:left-0 before:bg-mainColorAdminDash before:-bottom-1">
              Creation Coupons Page
            </h1>
          </div>
        );
      default:
        return null;
    }
  };
  const handleLogout = () => {
    Cookies.remove("AdminToken");
    window.location.reload();
  };
  const handleCreateAccount = () => {
    router.push("/signup");
  };

  return (
    <header className="sticky top-0 z-50 shadow-md py-4 bg-white font-[sans-serif] min-h-[70px] tracking-wide w-full">
      <div className="container flex items-center justify-between ">
        {pathnameHandle(pathname)}
        <div className="flex gap-2 items-center self-end justify-end w-full">
          <button className="p-2 relative text-sm rounded-md font-bold text-white border border-gray-300 transition-all ease-in-out duration-300 hover:bg-transparent hover:text-strongBeige">
            <span className="w-4 h-4 font-extralight p-2 flex items-center justify-center bg-red-700 text-white rounded-full absolute right-1 bottom-1 text-[10px]">
              0
            </span>
            <IoIosNotificationsOutline size={24} className="text-gray-600" />
          </button>
          <div className="relative">
            <button
              className="p-2 text-sm rounded-md font-bold text-white border border-gray-300 transition-all ease-in-out duration-300 hover:bg-transparent hover:text-strongBeige"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <CiUser size={24} className="text-gray-600" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                <button
                  onClick={handleCreateAccount}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Create Moderator Account
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
