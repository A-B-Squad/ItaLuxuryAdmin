import React from 'react';
import Pagination from '../Pagination';

interface ActionData {
  action_type: string;
  value: string;
}

interface CostPerActionData {
  action_type: string;
  value: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective?: string;
  startTime?: string;
  endTime?: string;

  // Budget related fields
  budget?: number;
  budgetRemaining?: number;
  budgetUtilization?: number;
  bidStrategy?: string;

  // Basic metrics
  spent: number;
  impressions: number;
  reach?: number;
  frequency?: number;
  clicks: number;
  uniqueClicks?: number;
  ctr: number;
  uniqueCtr?: number;
  cpc: number;
  costPerUniqueClick?: number;

  // Conversion metrics
  conversions?: number;
  costPerConversion?: number;
  purchases?: number;
  leads?: number;

  // Engagement metrics
  pageEngagement?: number;
  landingPageViews?: number;
  outboundClicks?: number;
  outboundClicksCtr?: number;

  // Video metrics
  videoViews?: number;
  videoCompletionRate?: number;

  // Date range
  dateStart?: string;
  dateStop?: string;

  // Raw data for advanced analysis
  actions?: ActionData[];
  costPerActionType?: CostPerActionData[];
}

interface CampaignsTableProps {
  campaigns: {
    data: Campaign[];
    totalPages: number;
    totalItems: number;
  };
  campaignStatusFilter: string;
  setCampaignStatusFilter: (status: string) => void;
  campaignsPage: number;
  setCampaignsPage: (page: number) => void;
  itemsPerPage: number;
  selectedCampaign: string | null;
  fetchAdSets: (campaignId: string) => void;
}

const CampaignsTable: React.FC<CampaignsTableProps> = ({
  campaigns,
  campaignStatusFilter,
  setCampaignStatusFilter,
  campaignsPage,
  setCampaignsPage,
  itemsPerPage,
  selectedCampaign,
  fetchAdSets
}) => {
  return (
    <div className="bg-white p-4 shadow-md rounded-lg border border-dashboard-neutral-200 mb-6">
      <h3 className="text-lg font-semibold text-dashboard-neutral-800 mb-4 flex items-center">
        <div className="w-1 h-6 bg-dashboard-info rounded-full mr-2"></div>
        Détails des Campagnes
      </h3>

      <div className="flex items-center mb-4 space-x-2">
        <span className="text-sm text-dashboard-neutral-600">Filtrer par statut:</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setCampaignStatusFilter("ALL")}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${campaignStatusFilter === "ALL"
                ? "bg-dashboard-neutral-800 text-white"
                : "bg-dashboard-neutral-100 text-dashboard-neutral-600 hover:bg-dashboard-neutral-200"
              }`}
          >
            Tous
          </button>
          <button
            onClick={() => setCampaignStatusFilter("ACTIVE")}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${campaignStatusFilter === "ACTIVE"
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
          >
            Actives
          </button>
          <button
            onClick={() => setCampaignStatusFilter("PAUSED")}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${campaignStatusFilter === "PAUSED"
                ? "bg-yellow-600 text-white"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              }`}
          >
            En pause
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dashboard-neutral-200">
          <thead className="bg-dashboard-neutral-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Campagne</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Statut</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Dépensé</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Impressions</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Reach</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Clics</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">Conv.</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">CTR</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-dashboard-neutral-500 uppercase tracking-wider">CPC</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-dashboard-neutral-200">
            {campaigns.data.map((campaign) => (
              <tr
                key={campaign.id}
                className="hover:bg-dashboard-neutral-50 cursor-pointer"
                onClick={() => fetchAdSets(campaign.id)}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dashboard-neutral-900">
                  {campaign.name}
                  {selectedCampaign === campaign.id && (
                    <span className="ml-2 text-dashboard-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-dashboard-neutral-700">
                  <span className={`px-2 py-1 rounded-full text-xs ${campaign.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                      campaign.status === "PAUSED" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                    }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-dashboard-neutral-700">{campaign.spent.toFixed(2)} $</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-dashboard-neutral-700">{campaign.impressions.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-dashboard-neutral-700">{campaign?.reach?.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-dashboard-neutral-700">{campaign.clicks.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-dashboard-neutral-700">{campaign.purchases}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-dashboard-neutral-700">{campaign.ctr.toFixed(2)}%</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-dashboard-neutral-700">{campaign.cpc.toFixed(2)} $</td>
              </tr>
            ))}
          </tbody>
        </table>

        {campaigns.totalPages > 1 && (
          <Pagination
            currentPage={campaignsPage}
            totalPages={campaigns.totalPages}
            totalItems={campaigns.totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCampaignsPage}
            itemName="campagnes"
          />
        )}
      </div>
    </div>
  );
};

export default CampaignsTable;