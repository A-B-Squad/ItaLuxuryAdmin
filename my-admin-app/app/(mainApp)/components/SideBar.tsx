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

const DecorativeShapes = () => (
  <div className="relative bottom-0 left-0 right-0 pointer-events-none ">
    <div className="w-16 h-16 bg-blue-500 opacity-10 rounded-full absolute -bottom-8 -left-8 floating"></div>
    <div
      className="w-24 h-24 bg-green-500 opacity-10 rounded-full absolute -bottom-12 -right-12 floating"
      style={{ animationDelay: "2s" }}
    ></div>
    <div
      className="w-12 h-12 bg-yellow-500 opacity-10 transform rotate-45 absolute bottom-16 left-1/2 floating"
      style={{ animationDelay: "4s" }}
    ></div>
  </div>
);

const SideBar = () => {
  const pathname = usePathname();
  const { data } = useQuery(PACKAGES_QUERY);

  const hasProcessingOrders = data?.getAllPackages.some(
    (order: { status: string }) =>
      order.status === "PROCESSING" || order.status === "PAYED_NOT_DELIVERED",
  );


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
      icon: <CiSettings size={24} />,
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
  ];

  return (
    <Sidebar
      backgroundColor="#202939"
      style={{
        zIndex: "100",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
      }}
    >
      <div className="relative h-full">
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

          <div className="flex justify-center items-center py-4">
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

          {sidebarItems.map((item, index) =>
            item.subItems.length > 0 ? (
              <SubMenu
                key={index}
                icon={item.icon}
                label={
                  <span className="text-sm">{item.text}</span>
                }
              >
                {item.subItems.map((subItem, subIndex) => (
                  <MenuItem
                    key={subIndex}
                    className="bg-[#202939e3]"
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
                <span className="text-base">{item.text}</span>
              </MenuItem>
            ),
          )}
        </Menu>
        <div className="absolute top-0 inset-0 bg-gradient-to-b from-transparent to-black opacity-20 pointer-events-none"></div>
        <DecorativeShapes />
      </div>
    </Sidebar>
  );
};

export default SideBar;
