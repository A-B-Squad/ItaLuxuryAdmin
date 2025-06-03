import React from 'react';

interface AdvancedFunnelAnalysisProps {
  funnelAnalysis: any;
  activeCampaign: any;
  getConversionMetrics: any;
  campaignDateRange: any;
}

const AdvancedFunnelAnalysis: React.FC<AdvancedFunnelAnalysisProps> = ({
  funnelAnalysis,
  activeCampaign,
  getConversionMetrics,
  campaignDateRange
}) => {
  if (!getConversionMetrics) return null;

  return (
    <div className="bg-dashboard-neutral-50 p-4 rounded-lg mt-6">
      <h5 className="text-md font-medium text-dashboard-neutral-700 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-primary" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
        </svg>
        Analyse Avancée du Funnel de Conversion
      </h5>

      <div className="mt-4">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                Funnel de Conversion
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {campaignDateRange.start && campaignDateRange.end ?
                  `${new Date(campaignDateRange.start).toLocaleDateString()} - ${new Date(campaignDateRange.end).toLocaleDateString()} (${campaignDateRange.duration} jours)` :
                  'Période non disponible'}
              </span>
            </div>
          </div>
        </div>

        {funnelAnalysis && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <div className="w-32 text-xs font-medium text-dashboard-neutral-600">Impressions</div>
                <div className="flex-1 ml-2">
                  <div className="h-6 bg-blue-500 rounded-l-lg flex items-center justify-start px-3 text-white text-xs font-medium" style={{ width: '100%' }}>
                    {(funnelAnalysis.impressions || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-32 text-xs font-medium text-dashboard-neutral-600">Clics</div>
                <div className="flex-1 ml-2">
                  <div className="h-6 bg-blue-400 rounded-l-lg flex items-center justify-start px-3 text-white text-xs font-medium"
                    style={{ width: `${(funnelAnalysis.clicks / funnelAnalysis.impressions) * 100}%` }}>
                    {(funnelAnalysis.clicks || 0).toLocaleString()} ({((funnelAnalysis.clicks / funnelAnalysis.impressions) * 100)?.toFixed(2)}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-32 text-xs font-medium text-dashboard-neutral-600">Vues de Page</div>
                <div className="flex-1 ml-2">
                  <div className="h-6 bg-blue-300 rounded-l-lg flex items-center justify-start px-3 text-white text-xs font-medium"
                    style={{ width: `${(funnelAnalysis.landingPageViews / funnelAnalysis.impressions) * 100}%` }}>
                    {(funnelAnalysis.landingPageViews || 0).toLocaleString()} ({((funnelAnalysis.landingPageViews / funnelAnalysis.clicks) * 100)?.toFixed(2)}% des clics)
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-32 text-xs font-medium text-dashboard-neutral-600">Vues Produit</div>
                <div className="flex-1 ml-2">
                  <div className="h-6 bg-green-400 rounded-l-lg flex items-center justify-start px-3 text-white text-xs font-medium"
                    style={{ width: `${(funnelAnalysis.viewContent / funnelAnalysis.impressions) * 100}%` }}>
                    {(funnelAnalysis.viewContent || 0).toLocaleString()} ({((funnelAnalysis.viewContent / funnelAnalysis.landingPageViews) * 100)?.toFixed(2)}% des vues de page)
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-32 text-xs font-medium text-dashboard-neutral-600">Achats</div>
                <div className="flex-1 ml-2">
                  <div className="h-6 bg-green-600 rounded-l-lg flex items-center justify-start px-3 text-white text-xs font-medium"
                    style={{ width: `${(funnelAnalysis.purchases / funnelAnalysis.impressions) * 100 * 10}%` }}>
                    {(funnelAnalysis.purchases || 0).toLocaleString()} ({((funnelAnalysis.purchases / funnelAnalysis.viewContent) * 100)?.toFixed(2)}% des vues produit)
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-dashboard-neutral-50 p-3 rounded-lg">
                <h6 className="text-xs font-medium text-dashboard-neutral-700 mb-2">Coûts par Action</h6>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-dashboard-neutral-600">Coût par Clic</span>
                    <span className="text-xs font-medium">{activeCampaign.cpc?.toFixed(2)}$</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-dashboard-neutral-600">Coût par Vue de Page</span>
                    <span className="text-xs font-medium">{getConversionMetrics.costPerLandingPageView?.toFixed(2)}$</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-dashboard-neutral-600">Coût par Vue Produit</span>
                    <span className="text-xs font-medium">{getConversionMetrics.costPerViewContent?.toFixed(2)}$</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-dashboard-neutral-600">Coût par Achat</span>
                    <span className="text-xs font-medium">
                      {funnelAnalysis.purchases > 0
                        ? (activeCampaign.spent / funnelAnalysis.purchases)?.toFixed(2)
                        : 'N/A'}$
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-dashboard-neutral-50 p-3 rounded-lg">
                <h6 className="text-xs font-medium text-dashboard-neutral-700 mb-2">Points de Friction</h6>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-dashboard-neutral-600">Impressions → Clics</span>
                    <div className="flex items-center">
                      <span className="text-xs font-medium mr-2">{funnelAnalysis.dropOffRates.impressionsToClicks?.toFixed(1)}%</span>
                      <div className={`w-2 h-2 rounded-full ${funnelAnalysis.dropOffRates.impressionsToClicks > 98 ? "bg-red-500" :
                        funnelAnalysis.dropOffRates.impressionsToClicks > 95 ? "bg-yellow-500" : "bg-green-500"
                        }`}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-dashboard-neutral-600">Clics → Vues de Page</span>
                    <div className="flex items-center">
                      <span className="text-xs font-medium mr-2">{funnelAnalysis.dropOffRates.clicksToOutbound?.toFixed(1)}%</span>
                      <div className={`w-2 h-2 rounded-full ${funnelAnalysis.dropOffRates.clicksToOutbound > 60 ? "bg-red-500" :
                        funnelAnalysis.dropOffRates.clicksToOutbound > 40 ? "bg-yellow-500" : "bg-green-500"
                        }`}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-dashboard-neutral-600">Vues Page → Vues Produit</span>
                    <div className="flex items-center">
                      <span className="text-xs font-medium mr-2">{funnelAnalysis.dropOffRates.landingToViewContent?.toFixed(1)}%</span>
                      <div className={`w-2 h-2 rounded-full ${funnelAnalysis.dropOffRates.landingToViewContent > 70 ? "bg-red-500" :
                        funnelAnalysis.dropOffRates.landingToViewContent > 50 ? "bg-yellow-500" : "bg-green-500"
                        }`}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-dashboard-neutral-600">Vues Produit → Achats</span>
                    <div className="flex items-center">
                      <span className="text-xs font-medium mr-2">{funnelAnalysis.dropOffRates.viewContentToPurchase?.toFixed(1)}%</span>
                      <div className={`w-2 h-2 rounded-full ${funnelAnalysis.dropOffRates.viewContentToPurchase > 95 ? "bg-red-500" :
                        funnelAnalysis.dropOffRates.viewContentToPurchase > 90 ? "bg-yellow-500" : "bg-green-500"
                        }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFunnelAnalysis;