import dynamic from "next/dynamic";

const ClientAbandonedBasketPage = dynamic(
  () => import("./AbandonedBasketPage"),
  { ssr: false },
);

const AbandonedBasketWrapperd: React.FC = () => {
  return <ClientAbandonedBasketPage />;
};

export default AbandonedBasketWrapperd;
