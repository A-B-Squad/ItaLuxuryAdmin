"use client";
import React, { useState, useEffect } from "react";
import { IoMenu } from "react-icons/io5";
import { CiHome, CiSettings } from "react-icons/ci";
import { LuPackage2, LuUsers2, LuNewspaper } from "react-icons/lu";
import { TbPackages } from "react-icons/tb";
import { MdKeyboardDoubleArrowUp } from "react-icons/md";
import { FaRegChartBar } from "react-icons/fa";
import { FcAdvertising } from "react-icons/fc";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<number | null>(null);
  const [activeLink, setActiveLink] = useState<string>("");
  const pathname = usePathname();

  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSubMenuToggle = (index: number) => {
    setExpandedMenu((prev) => (prev === index ? null : index));
  };

  // Sidebar items with submenus
  const sidebarItems = [
    {
      icon: <CiHome size={24} />,
      text: "Tableau de bord",
      href: "/Dashboard",
      subItems: [],
    },
    {
      icon: <LuPackage2 size={24} />,
      text: "Commandes",
      href: "/packages",
      subItems: [
        { text: "Tous les commandes", href: "/Orders" },
        { text: "Nouvelle commande", href: "/Orders/CreateOrder" },
        { text: "Paniers abandonnés", href: "/Orders/AbandonedBasket" },
      ],
    },
    {
      icon: <TbPackages size={24} />,
      text: "Produits",
      href: "/Products",
      subItems: [
        { text: "Tous les produits", href: "/Products" },
        { text: "Nouveau produit", href: "/Products/CreateProduct" },
        { text: "Categoriés", href: "/Products/Categories" },
        { text: "Inventaire", href: "/Products/Inventory" },
        { text: "Commentaires", href: "/Products/Reviews" },
      ],
    },
    {
      icon: <TbPackages size={24} />,
      text: "Coupons",
      href: "/Coupons",
      subItems: [
        { text: "Tous les coupons", href: "/Coupons" },
        { text: "Nouveau coupons", href: "/Coupons/CreateCoupons" },
      ],
    },
    {
      icon: <MdKeyboardDoubleArrowUp size={24} />,
      text: "Up Sells",
      href: "/best-sales",
      subItems: [],
    },
    {
      icon: <LuUsers2 size={24} />,
      text: "Gestion",
      href: "#",
      subItems: [
        { text: "Clients", href: "/clients" },
        // { text: "Categories", href: "/categories" },
      ],
    },
    {
      icon: <FaRegChartBar size={24} />,
      text: "Statistiques",
      href: "/statistics",
      subItems: [],
    },
    {
      icon: <LuNewspaper size={24} />,
      text: "Factures",
      href: "/invoices",
      subItems: [],
    },
    {
      icon: <FcAdvertising size={24} />,
      text: "Boutique",
      href: "/Shop",
      subItems: [],
    },
    {
      icon: <CiSettings size={24} />,
      text: "Réglages",
      href: "/settings",
      subItems: [],
    },
  ];

  return (
    <div
      className={`sideBar flex h-screen overflow-y-auto sticky top-0 left-0 z-50 bg-mainColorAdminDash transition-all duration-300 ${
        isExpanded ? "w-64" : "w-[5%]"
      }`}
    >
      <div className="shadow md:h-full flex-col justify-between w-full transition-width duration-300">
        <div>
          <ul className="mt-4">
            <li className="flex w-full py-4 px-4 justify-between text-white cursor-pointer outline-none items-center transition">
              <button
                className="flex items-center focus:outline-none focus:ring-"
                onClick={toggleSidebar}
              >
                <IoMenu size={30} />
                {isExpanded && <span className="text-lg ml-2">MaisonNg</span>}
              </button>
            </li>
            {sidebarItems.map((item, index) => (
              <React.Fragment key={index}>
                <li
                  className={`
                    ${expandedMenu === index ? "bg-[#ffffff3d]" : ""}
                    ${
                      activeLink === item.href || expandedMenu === index
                        ? "bg-white text-black"
                        : "text-white"
                    }
                    flex w-full py-3 px-4 justify-between outline-none hover:text-blue-900 hover:bg-gray-100 cursor-pointer items-center transition
                  `}
                  onClick={() =>
                    item.subItems.length > 0 && handleSubMenuToggle(index)
                  }
                >
                  {item.subItems.length > 0 ? (
                    <div className="flex items-center w-full">
                      {item.icon}
                      {isExpanded && (
                        <span className="text-md ml-2">{item.text}</span>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center  outline-none  w-full"
                    >
                      {item.icon}
                      {isExpanded && (
                        <span className="text-md tracking-wider ml-2">
                          {item.text}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
                {expandedMenu === index && item.subItems.length > 0 && (
                  <ul
                    className="bg-[#ffffff3d] text-white overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight:
                        expandedMenu === index
                          ? `${item.subItems.length * 40}px`
                          : "0",
                    }}
                  >
                    {item.subItems.map((subItem: any, subIndex) => (
                      <li
                        key={subIndex}
                        className={`
                          ${
                            activeLink === subItem.href
                              ? "text-white"
                              : "text-gray-300"
                          }
                          flex w-full py-2 px-4  justify-between rounded-l-full hover:text-white outline-none  cursor-pointer items-center transition
                        `}
                      >
                        <Link
                          href={subItem.href}
                          className="flex items-center focus:outline-none  w-full"
                        >
                          {subItem.icon}
                          {isExpanded && (
                            <span className="text-xs  font-medium tracking-wider ml-2">
                              {subItem.text}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
