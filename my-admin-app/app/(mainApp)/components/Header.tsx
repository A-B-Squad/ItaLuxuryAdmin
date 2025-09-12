"use client";
import { usePathname, useRouter } from "next/navigation";
import { CiUser } from "react-icons/ci";
import { FiMenu, FiPieChart } from "react-icons/fi";

import { AnimatePresence, motion } from "framer-motion";
import Cookies from "js-cookie";
import { useState } from "react";

interface HeaderProps {
  onMenuClick: () => void;
  showMenuButton: boolean;
}

const Header = ({ onMenuClick, showMenuButton }: HeaderProps) => {
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

  return (
    <header className="sticky top-0 z-50 shadow-md py-4 bg-white font-[sans-serif] min-h-[70px] tracking-wide w-full">
      <div className="container flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <FiMenu size={24} className="text-gray-600" />
            </button>
          )}
          {pathnameHandle(pathname)}
        </div>

        <div className="flex gap-3 items-center">

          <div className="relative">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
            >
              <CiUser size={26} className="text-gray-600" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden z-50"
                >
                  <div className="py-2">
                    <button
                      onClick={() => router.push("/signup")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span>Create Moderator Account</span>
                    </button>
                    <button
                      onClick={() => {
                        Cookies.remove("AdminToken", {
                          path: '/',
                          domain: window.location.hostname
                        });

                        setTimeout(() => {
                          router.push('/signin');
                        }, 100);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;