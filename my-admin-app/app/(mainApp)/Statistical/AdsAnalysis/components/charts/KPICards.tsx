import AnimatedCounter from '@/app/(mainApp)/Hook/AnimatedCounter';
import React from 'react';
import { FaAd, FaMoneyBillWave, FaShoppingCart, FaUsers } from "react-icons/fa";

interface KPICardsProps {
  kpis: {
    totalSpent: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    ctr: number;
    conversionRate: number;
    cpc: number;
    cpa: number;
  };
  totalBudget: number;
}

const KPICards: React.FC<KPICardsProps> = ({ kpis, totalBudget }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white shadow-md rounded-lg border-l-4 border-dashboard-primary p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-dashboard-neutral-800 font-semibold text-sm">Dépenses Publicitaires</h3>
          <div className="bg-dashboard-primary p-2 rounded-full text-white">
            <FaMoneyBillWave />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-dashboard-neutral-900">
            <AnimatedCounter from={0} to={kpis.totalSpent} /> $
          </p>
          <p className="text-xs text-dashboard-neutral-500 mt-1">
            Budget total: {totalBudget} $
          </p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg border-l-4 border-dashboard-info p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-dashboard-neutral-800 font-semibold text-sm">Impressions</h3>
          <div className="bg-dashboard-info p-2 rounded-full text-white">
            <FaUsers />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-dashboard-neutral-900">
            <AnimatedCounter from={0} to={kpis.totalImpressions} />
          </p>
          <p className="text-xs text-dashboard-neutral-500 mt-1">
            CTR: {kpis.ctr?.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg border-l-4 border-dashboard-warning p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-dashboard-neutral-800 font-semibold text-sm">Clics</h3>
          <div className="bg-dashboard-warning p-2 rounded-full text-white">
            <FaAd />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-dashboard-neutral-900">
            <AnimatedCounter from={0} to={kpis.totalClicks} />
          </p>
          <p className="text-xs text-dashboard-neutral-500 mt-1">
            CPC: {kpis.cpc?.toFixed(2)} $
          </p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg border-l-4 border-dashboard-success p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-dashboard-neutral-800 font-semibold text-sm">Conversions</h3>
          <div className="bg-dashboard-success p-2 rounded-full text-white">
            <FaShoppingCart />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-dashboard-neutral-900">
            <AnimatedCounter from={0} to={kpis.totalConversions} />
          </p>
          <p className="text-xs text-dashboard-neutral-500 mt-1">
            Taux: {kpis.conversionRate?.toFixed(2)}% | CPA: {kpis.cpa?.toFixed(2) || 0} $
          </p>
        </div>
      </div>
    </div>
  );
};

export default KPICards;