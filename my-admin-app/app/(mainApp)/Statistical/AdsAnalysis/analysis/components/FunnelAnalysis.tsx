import React from 'react';
import { Bar } from 'react-chartjs-2';

interface FunnelAnalysisProps {
  funnelAnalysis: any;
  funnelVisualizationData: any;
  conversionRateComparisonData: any;
}

const FunnelAnalysis: React.FC<FunnelAnalysisProps> = ({
  funnelAnalysis,
  funnelVisualizationData,
  conversionRateComparisonData
}) => {
  if (!funnelAnalysis) return null;

  return (
    <div className="bg-dashboard-neutral-50 p-4 rounded-lg mt-6">
      <h5 className="text-md font-medium text-dashboard-neutral-700 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dashboard-primary" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
        </svg>
        Analyse du Funnel de Conversion
      </h5>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-3">Visualisation du Funnel</h6>
          {funnelVisualizationData && (
            <div className="h-[300px]">
              <Bar
                data={funnelVisualizationData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    y: {
                      grid: { display: false }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h6 className="text-sm font-medium text-dashboard-neutral-700 mb-3">Taux de Conversion par Étape</h6>
          {conversionRateComparisonData && (
            <div className="h-[300px]">
              <Bar
                data={conversionRateComparisonData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: 'rgba(0, 0, 0, 0.05)' },
                      ticks: {
                        callback: function(value) {
                          return value + '%';
                        }
                      }
                    },
                    x: {
                      grid: { display: false }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return context.dataset.label + ': ' + context.parsed.y + '%';
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-xs text-dashboard-neutral-600">Impressions → Clics</div>
          <div className="text-xl font-bold text-dashboard-neutral-800 mt-1">
            {((funnelAnalysis.clicks / funnelAnalysis.impressions) * 100)?.toFixed(2)}%
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-dashboard-neutral-600 mr-1">CTR</span>
            <div className={`px-1.5 py-0.5 rounded text-xs ${((funnelAnalysis.clicks / funnelAnalysis.impressions) * 100) > 1.2
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}>
              {((funnelAnalysis.clicks / funnelAnalysis.impressions) * 100) > 1.2 ? "Bon" : "Faible"}
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-xs text-dashboard-neutral-600">Clics → Vues de Page</div>
          <div className="text-xl font-bold text-dashboard-neutral-800 mt-1">
            {((funnelAnalysis.landingPageViews / funnelAnalysis.clicks) * 100)?.toFixed(2)}%
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-dashboard-neutral-600 mr-1">Taux de rebond</span>
            <div className={`px-1.5 py-0.5 rounded text-xs ${((funnelAnalysis.landingPageViews / funnelAnalysis.clicks) * 100) > 60
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}>
              {((funnelAnalysis.landingPageViews / funnelAnalysis.clicks) * 100) > 60 ? "Bon" : "Élevé"}
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-xs text-dashboard-neutral-600">Vues Page → Vues Produit</div>
          <div className="text-xl font-bold text-dashboard-neutral-800 mt-1">
            {((funnelAnalysis.viewContent / funnelAnalysis.landingPageViews) * 100)?.toFixed(2)}%
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-dashboard-neutral-600 mr-1">Engagement</span>
            <div className={`px-1.5 py-0.5 rounded text-xs ${((funnelAnalysis.viewContent / funnelAnalysis.landingPageViews) * 100) > 30
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}>
              {((funnelAnalysis.viewContent / funnelAnalysis.landingPageViews) * 100) > 30 ? "Bon" : "Faible"}
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-xs text-dashboard-neutral-600">Vues Produit → Achats</div>
          <div className="text-xl font-bold text-dashboard-neutral-800 mt-1">
            {((funnelAnalysis.purchases / funnelAnalysis.viewContent) * 100)?.toFixed(2)}%
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-dashboard-neutral-600 mr-1">Conversion</span>
            <div className={`px-1.5 py-0.5 rounded text-xs ${((funnelAnalysis.purchases / funnelAnalysis.viewContent) * 100) > 5
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}>
              {((funnelAnalysis.purchases / funnelAnalysis.viewContent) * 100) > 5 ? "Bon" : "Faible"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunnelAnalysis;