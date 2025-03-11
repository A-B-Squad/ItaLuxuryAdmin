"use client";
import { useQuery } from "@apollo/client";
import Image from "next/legacy/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CiSettings } from "react-icons/ci";
import { FaHeadSideCough, FaRegChartBar } from "react-icons/fa";
import { FcAdvertising } from "react-icons/fc";
import { LuPackage2, LuUsers2 } from "react-icons/lu";
import { RiCoupon3Line } from "react-icons/ri";
import { TbBrandGoogleHome, TbPackages } from "react-icons/tb";
import { TiMessages } from "react-icons/ti";
import { Menu, MenuItem, Sidebar, SubMenu } from "react-pro-sidebar";
import { PACKAGES_QUERY } from "../../graph/queries";

import React, { useMemo } from 'react';

const DecorativeShapes = React.memo(() => (
  <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none overflow-hidden">
    <div className="w-16 h-16 bg-dashboard-primary opacity-10 rounded-full absolute bottom-4 left-4 floating"></div>
    <div
      className="w-24 h-24 bg-dashboard-secondary opacity-10 rounded-full absolute bottom-6 right-6 floating"
      style={{ animationDelay: "2s" }}
    ></div>
    <div
      className="w-12 h-12 bg-dashboard-accent opacity-10 transform rotate-45 absolute bottom-20 left-1/2 floating"
      style={{ animationDelay: "4s" }}
    ></div>
  </div>
));

// Add display name for better debugging
DecorativeShapes.displayName = 'DecorativeShapes';

const SideBar = () => {
  const pathname = usePathname();
  const { data, loading } = useQuery(PACKAGES_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  // Memoize the processing orders check to avoid recalculation on every render
  const hasProcessingOrders = useMemo(() => {
    return data?.getAllPackages.some(
      (order: { status: string }) =>
        order.status === "PROCESSING" || order.status === "PAYED_NOT_DELIVERED",
    );
  }, [data]);

  // Memoize sidebar items to prevent unnecessary re-renders
  const sidebarItems = useMemo(() => [
    {
      icon: <TbBrandGoogleHome size={22} />,
      text: "Tableau de bord",
      href: "/Dashboard",
      subItems: [],
    },
    {
      icon: (
        <div className="relative">
          <LuPackage2 size={22} />
          {hasProcessingOrders && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-dashboard-danger rounded-full">
              <div className="absolute inset-0 bg-dashboard-danger rounded-full animate-ping opacity-75"></div>
            </div>
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
      icon: <TbPackages size={22} />,
      text: "Produits",
      href: "/Products",
      subItems: [
        { text: "Tous les produits", href: "/Products" },
        { text: "Nouveau produit", href: "/Products/CreateProduct" },
        { text: "Categoriés", href: "/Products/Categories/" },
        { text: "Inventaire", href: "/Products/Inventory" },
        { text: "Commentaires", href: "/Products/Reviews" },
        { text: "Creation de Marques", href: "/Products/Brands" },
        { text: "Creation de Color", href: "/Products/Colors" },
      ],
    },
    {
      icon: <FaHeadSideCough size={24} />,
      text: "Marketing",
      href: "/Marketing",
      subItems: [
        { text: "Meilleures ventes", href: "/Marketing/TopSells" },
        { text: "Meilleures offres", href: "/Marketing/TopDeals" },
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
      icon: <FaRegChartBar size={24} />,
      text: "Statistiques",
      href: "/Statistics",
      subItems: [
        { text: "Chiffre D'affaire", href: "/Statistical/YearlyTurnover" },
        { text: "Livraison", href: "/Statistical/Delivery" },
        { text: "Clients", href: "/Statistical/Customer" },
        { text: "Marketing", href: "/Statistical/Marketing" },
        { text: "Produits", href: "/Statistical/Products" },
      ],
    },
    {
      icon: <FcAdvertising size={24} />,
      text: "Boutique",
      href: "/Shop",
      subItems: [
        { text: "Publicités en Carrousel", href: "/Shop/CarouselAdvertising" },
        { text: "Client Service", href: "/Shop/CilentServices" },
        {
          text: "À côté du Carrousel",
          href: "/Shop/NextToCarouselAdvertising",
        },
        { text: "Bannière Accueil", href: "/Shop/BannerAdvertising" },
        { text: "Grande Publicité", href: "/Shop/BigAdvertising" },
        { text: "Publicités Latérales", href: "/Shop/SideAdvertising" },
      ],
    },
    {
      icon: <TiMessages size={24} />,
      text: "Boite Messagerie",
      href: "/Inbox",
      subItems: [],
    },
    {
      icon: <CiSettings size={22} />,
      text: "Réglages",
      href: "/Settings",
      subItems: [
        {
          text: "Informations sur l'Entreprise",
          href: "/Settings/CompanyInfo",
        },
        { text: "Section visibility", href: "/Settings/SectionVisibility" },
        { text: "Integration", href: "/Settings/Integration" },
      ],
    },
  ], [hasProcessingOrders]); // Only re-create when processing orders change

  return (
    <Sidebar
      className="overflow-hidden"
      backgroundColor="#1e293b"
      style={{
        zIndex: "100",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
      width="250px"
    >
      <div className="relative h-full flex flex-col">
        <div className="flex justify-center items-center py-4 mb-2 border-b border-opacity-20 border-white">
          <Image
            src="/LOGO.png"
            alt="Logo"
            className="rounded-md"
            height={60}
            width={120}
            objectFit="contain"
            priority
          />
        </div>

        <div className="flex-grow overflow-y-auto scrollbar-hide">
          <Menu
            menuItemStyles={{
              button: ({ level, active }) => {
                return {
                  color: active ? "#1e293b" : "#f8fafc", // text color
                  backgroundColor: active ? "#f8fafc" : "transparent",
                  marginTop: "2px",
                  marginBottom: "2px",
                  borderRadius: "6px",
                  marginLeft: "8px",
                  marginRight: "8px",
                  fontWeight: active ? "600" : "400",
                  "&:hover": {
                    backgroundColor: active ? "#f8fafc" : "rgba(248, 250, 252, 0.1)",
                  },
                };
              },
              subMenuContent: () => ({
                backgroundColor: "#1e293b", // dashboard-neutral-800
              }),
              icon: () => ({
                color: "#94a3b8", // dashboard-neutral-400
              }),
            }}
          >
            {sidebarItems.map((item, index) =>
              item.subItems.length > 0 ? (
                <SubMenu
                  key={index}
                  icon={item.icon}
                  label={
                    <span className="text-sm font-medium">{item.text}</span>
                  }
                >
                  {item.subItems.map((subItem, subIndex) => (
                    <MenuItem
                      key={subIndex}
                      component={<Link href={subItem.href} />}
                      active={pathname === subItem.href}
                    >
                      <span className="text-xs">{subItem.text}</span>
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
                  <span className="text-sm font-medium">{item.text}</span>
                </MenuItem>
              ),
            )}
          </Menu>
        </div>

        <div className="p-4 mt-auto border-t border-opacity-20 border-white">
          <div className="flex items-center space-x-3 px-2 py-3 rounded-md bg-dashboard-neutral-700 bg-opacity-50">
            <div className="w-8 h-8 rounded-full bg-dashboard-primary flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-white">Admin</p>
              <p className="text-xs text-dashboard-neutral-400">Connecté</p>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-10 pointer-events-none"></div>
        <DecorativeShapes />
      </div>
    </Sidebar>
  );
};

export default SideBar;
