import dynamic from 'next/dynamic';

const ClientAbandonedBasketPage = dynamic(
  () => import('./AbandonedBasketPage'),
  { ssr: false }
);

const AbandonedBasketPage: React.FC = () => {
  return <ClientAbandonedBasketPage />;
};

export default AbandonedBasketPage;