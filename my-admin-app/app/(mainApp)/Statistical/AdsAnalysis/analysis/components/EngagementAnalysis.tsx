import React from 'react';

interface EngagementAnalysisProps {
  getConversionMetrics: any;
  funnelAnalysis: any;
}

const EngagementAnalysis: React.FC<EngagementAnalysisProps> = ({
  getConversionMetrics,
  funnelAnalysis
}) => {
  if (!getConversionMetrics) return null;

  return (
    <div className="bg-dashboard-neutral-50 p-4 rounded-lg mt-6">
      <h5 className="text-md font-medium text-dashboard-neutral-700 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-primary" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
        Analyse de l'Engagement
      </h5>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-2">Engagement Vidéo</h6>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-dashboard-neutral-800">{(getConversionMetrics.videoViews || 0).toLocaleString()}</div>
              <div className="text-xs text-dashboard-neutral-600">Vues Vidéo</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-dashboard-neutral-700">
                {getConversionMetrics.videoViews > 0 && funnelAnalysis ?
                  ((getConversionMetrics.videoViews / funnelAnalysis.impressions) * 100)?.toFixed(1) + '%' : '0%'}
              </div>
              <div className="text-xs text-dashboard-neutral-600">des impressions</div>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-dashboard-neutral-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{
                width: `${getConversionMetrics.videoViews > 0 && funnelAnalysis ?
                  Math.min(100, (getConversionMetrics.videoViews / funnelAnalysis.impressions) * 100 * 3) : 0}%`
              }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm">
          <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-2">Engagement Social</h6>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-dashboard-neutral-800">{(getConversionMetrics.postEngagements || 0).toLocaleString()}</div>
              <div className="text-xs text-dashboard-neutral-600">Interactions</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-dashboard-neutral-700">
                {getConversionMetrics.engagementRate?.toFixed(1)}%
              </div>
              <div className="text-xs text-dashboard-neutral-600">Taux d'engagement</div>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-dashboard-neutral-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{
                width: `${Math.min(100, getConversionMetrics.engagementRate * 5)}%`
              }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm">
          <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-2">Qualité du Trafic</h6>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-dashboard-neutral-800">
                {getConversionMetrics.conversionRate?.toFixed(1)}%
              </div>
              <div className="text-xs text-dashboard-neutral-600">Taux de conversion</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-dashboard-neutral-700">
                {getConversionMetrics.landingPageViews > 0 && funnelAnalysis && funnelAnalysis.clicks > 0 ?
                  ((getConversionMetrics.landingPageViews / funnelAnalysis.clicks) * 100)?.toFixed(1) + '%' : '0%'}
              </div>
              <div className="text-xs text-dashboard-neutral-600">Taux de rebond</div>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-dashboard-neutral-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${getConversionMetrics.conversionRate > 5 ? "bg-green-500" :
                getConversionMetrics.conversionRate > 2 ? "bg-yellow-500" : "bg-red-500"
                }`} style={{
                  width: `${Math.min(100, getConversionMetrics.conversionRate * 10)}%`
                }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementAnalysis;