"use client";
import React, { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { IoMenu } from "react-icons/io5";
import { CiHome, CiSettings } from "react-icons/ci";
import { LuPackage2, LuUsers2, LuNewspaper } from "react-icons/lu";
import {
  TbBrandDatabricks,
  TbBrandGoogleHome,
  TbPackages,
} from "react-icons/tb";
import { TiMessages } from "react-icons/ti";
import { RiCoupon3Line } from "react-icons/ri";

import { MdDiscount } from "react-icons/md";
import { FaRegChartBar } from "react-icons/fa";
import { FcAdvertising } from "react-icons/fc";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ORDERS_QUERY } from "../graph/queries";
import { useQuery } from "@apollo/client";
import { SiMoneygram } from "react-icons/si";

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const { data } = useQuery(ORDERS_QUERY);

  const hasProcessingOrders = data?.getAllPackages.some(
    (order: { status: string }) => order.status === "PROCESSING",
  );

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Sidebar items with submenus
  const sidebarItems = [
    {
      icon: <TbBrandGoogleHome size={24} />,
      text: "Tableau de bord",
      href: "/Dashboard",
      subItems: [],
    },
    {
      icon: (
        <div className="relative">
          <LuPackage2 size={24} />
          {hasProcessingOrders && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          )}
        </div>
      ),
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
      icon: <RiCoupon3Line size={24} />,
      text: "Coupons",
      href: "/Coupons",
      subItems: [
        { text: "Tous les coupons", href: "/Coupons" },
        { text: "Nouveau coupons", href: "/Coupons/CreateCoupons" },
      ],
    },

    {
      icon: <LuUsers2 size={24} />,
      text: "Clients",
      href: "/Clients",
      subItems: [{ text: "Clients", href: "/Clients" }],
    },
    {
      icon: <TbBrandDatabricks size={24} />,

      text: "Creation de Marques",
      href: "/Shop/Brands",
      subItems: [],
    },
    {
      icon: <SiMoneygram size={24} />,
      text: "Meilleures ventes",
      href: "/TopSells",
      subItems: [],
    },
    {
      icon: <MdDiscount size={24} />,

      text: "Meilleures offres",
      href: "/TopDeals",

      subItems: [],
    },
    {
      icon: <FaRegChartBar size={24} />,
      text: "Statistiques",
      href: "/statistics",
      subItems: [
        {
          text: "Livraison",
          href: "/Statistical/Delivery",
        },
        {
          text: "Clients",
          href: "/Statistical/Customer",
        },
        {
          text: "Marketing",
          href: "/Statistical/Marketing",
        },
        {
          text: "Produits",
          href: "/Statistical/Products",
        },
      ],
    },
    {
      icon: <FcAdvertising size={24} />,
      text: "Boutique",
      href: "/Shop",
      subItems: [
        {
          text: "Section visibility",
          href: "/Shop/SectionVisibility",
        },
        {
          text: "Publicités en Carrousel",
          href: "/Shop/CarouselAdvertising",
        },

        {
          text: "Client Service",
          href: "/Shop/CilentServices",
        },
        {
          text: "Creation de Color",
          href: "/Shop/Colors",
        },
        {
          text: "Publicités en Carrousel",
          href: "/Shop/CarouselAdvertising",
        },
        {
          text: "À côté du Carrousel",
          href: "/Shop/NextToCarouselAdvertising",
        },
        {
          text: "Bannière Accueil",
          href: "/Shop/BannerAdvertising",
        },
        {
          text: "Grande Publicité",
          href: "/Shop/BigAdvertising",
        },
        {
          text: "Publicités Latérales",
          href: "/Shop/SideAdvertising",
        },
        {
          text: "Informations sur l'Entreprise",
          href: "/Shop/CompanyInfo",
        },
      ],
    },
    {
      icon: <LuNewspaper size={24} />,
      text: "Factures",
      href: "/invoices",
      subItems: [],
    },
    {
      icon: <TiMessages size={24} />,
      text: "Boite Messagerie",
      href: "/Inbox",
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
    <Sidebar
      collapsed={!isExpanded}
      backgroundColor="#202939"
      style={{
        zIndex: "100",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
      }}
    >
      <Menu
        menuItemStyles={{
          button: ({ level, active }) => {
            return {
              color: active ? "#202939" : "#fff",
              zIndex: "500",
              backgroundColor: active ? "#fff" : "transparent",
              "&:hover": {
                backgroundColor: "#2c3a50",
              },
            };
          },
        }}
      >
        <MenuItem
          icon={<IoMenu size={30} />}
          onClick={toggleSidebar}
          style={{ color: "#fff" }}
        >
          {isExpanded && <span style={{ fontSize: "18px" }}>MaisonNg</span>}
        </MenuItem>

        {sidebarItems.map((item, index) =>
          item.subItems.length > 0 ? (
            <SubMenu
              key={index}
              icon={item.icon}
              label={
                isExpanded ? <span className="text-sm">{item.text}</span> : ""
              }
            >
              {item.subItems.map((subItem, subIndex) => (
                <MenuItem
                  key={subIndex}
                  className="bg-[#202939e3]"
                  component={<Link href={subItem.href} />}
                  active={pathname === subItem.href}
                >
                  <span className="text-xs  ">{subItem.text}</span>
                </MenuItem>
              ))}
            </SubMenu>
          ) : (
            <MenuItem
              key={index}
              icon={item.icon}
              component={<Link href={item.href} />}
              active={pathname === item.href}
            >
              {isExpanded && <span className="text-base">{item.text}</span>}
            </MenuItem>
          ),
        )}
      </Menu>
    </Sidebar>
  );
};

export default SideBar;
