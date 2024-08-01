"use client";
import React, { useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
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
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
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
      text: "Clients",
      href: "/Clients",
      subItems: [
        // { text: "Clients", href: "/c" },
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
      subItems: [

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
          {isExpanded && <span className="ml-2">MaisonNg</span>}
        </MenuItem>
        {sidebarItems.map((item, index) =>
          item.subItems.length > 0 ? (
            <SubMenu
              key={index}
              icon={item.icon}
              label={isExpanded ? item.text : ""}
            >
              {item.subItems.map((subItem, subIndex) => (
                <MenuItem
                  key={subIndex}
                  className="bg-[#202939e3]"
                  component={<Link href={subItem.href} />}
                  active={pathname === subItem.href}
                >
                  {subItem.text}
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
              {isExpanded && item.text}
            </MenuItem>
          )
        )}
      </Menu>
    </Sidebar>
  );
};

export default SideBar;
