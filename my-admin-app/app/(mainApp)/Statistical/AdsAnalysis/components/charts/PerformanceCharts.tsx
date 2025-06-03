import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceChartsProps {
  performanceData: any;
  efficiencyChartData: any;
  campaignData?: any; // Add the campaign data as an optional prop
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  performanceData,
  efficiencyChartData,
  campaignData
}) => {


  // Create funnel progression data
  const funnelProgressionData = React.useMemo(() => {
    if (!campaignData) return null;

    // Extract funnel metrics
    const impressions = campaignData.impressions || 0;
    const clicks = campaignData.clicks || 0;
    const outboundClicks = campaignData.outboundClicks || 0;
    const landingPageViews = campaignData.landingPageViews || 0;
    const viewContent = campaignData.actions?.find((a: any) => a.action_type === 'view_content')?.value || 0;
    const purchases = campaignData.purchases || 0;

    // Calculate conversion rates between steps
    const clickRate = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const outboundRate = clicks > 0 ? (outboundClicks / clicks) * 100 : 0;
    const landingRate = outboundClicks > 0 ? (landingPageViews / outboundClicks) * 100 : 0;
    const viewContentRate = landingPageViews > 0 ? (parseInt(viewContent) / landingPageViews) * 100 : 0;
    const purchaseRate = parseInt(viewContent) > 0 ? (purchases / parseInt(viewContent)) * 100 : 0;

    return {
      labels: ['Impressions → Clics', 'Clics → Clics Sortants', 'Clics Sortants → Landing', 'Landing → View Content', 'View Content → Achats'],
      datasets: [
        {
          label: 'Taux de Conversion (%)',
          data: [
            clickRate?.toFixed(2),
            outboundRate?.toFixed(2),
            landingRate?.toFixed(2),
            viewContentRate?.toFixed(2),
            purchaseRate?.toFixed(2)
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [campaignData]);

  return (
    <div className="grid grid-cols-1  gap-6 mb-6">
      <div className="bg-white p-4 shadow-md rounded-lg border border-dashboard-neutral-200">
        <h3 className="text-lg font-semibold text-dashboard-neutral-800 mb-4 flex items-center">
          <div className="w-1 h-6 bg-dashboard-primary rounded-full mr-2"></div>
          Performance des Campagnes
        </h3>
        <div className="h-[350px]">
          <Bar
            data={performanceData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0, 0, 0, 0.05)' }
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
                    label: function (context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (label.includes('Impressions')) {
                        return label + (context.parsed.y * 100)?.toFixed(0);
                      }
                      return label + context.parsed.y;
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="bg-white p-4 shadow-md rounded-lg border border-dashboard-neutral-200">
        <h3 className="text-lg font-semibold text-dashboard-neutral-800 mb-4 flex items-center">
          <div className="w-1 h-6 bg-dashboard-success rounded-full mr-2"></div>
          Efficacité des Campagnes
        </h3>
        <p className="text-sm text-dashboard-neutral-600 mb-4">
          Ce graphique compare les coûts (CPC, CPM) et l'engagement (CTR) pour évaluer l'efficacité de chaque campagne.
          Un CPC bas et un CTR élevé indiquent une meilleure performance.
        </p>
        <div className="h-[350px]">
          <Bar
            data={efficiencyChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: 'y' as const,
              scales: {
                x: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0, 0, 0, 0.05)' },
                  title: {
                    display: true,
                    text: 'Coût ($)'
                  }
                },
                y: {
                  grid: { display: false }
                },
                y1: {
                  position: 'right',
                  beginAtZero: true,
                  grid: { display: false },
                  title: {
                    display: true,
                    text: 'CTR (%)'
                  }
                }
              },
              plugins: {
                legend: {
                  position: 'top'
                },
                tooltip: {
                  callbacks: {
                    title: function (tooltipItems) {
                      // Return unique campaign name
                      return tooltipItems[0].label;
                    },
                    label: function (context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }

                      // Add explanatory text based on metric
                      if (label.includes('CTR')) {
                        return label + context.parsed.x?.toFixed(2) + '% (Taux de clics)';
                      } else if (label.includes('CPC')) {
                        return label + '$' + context.parsed.x?.toFixed(2) + ' (Coût par clic)';
                      } else if (label.includes('CPM')) {
                        return label + '$' + context.parsed.x?.toFixed(2) + ' (Coût pour mille impressions)';
                      }

                      return label + '$' + context.parsed.x?.toFixed(2);
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Add new charts if campaign data is available */}
      {campaignData && (
        <>


          <div className="bg-white p-4 shadow-md rounded-lg border border-dashboard-neutral-200">
            <h3 className="text-lg font-semibold text-dashboard-neutral-800 mb-4 flex items-center">
              <div className="w-1 h-6 bg-dashboard-warning rounded-full mr-2"></div>
              Progression du Funnel
            </h3>
            <p className="text-sm text-dashboard-neutral-600 mb-4">
              Ce graphique montre les taux de conversion entre chaque étape du funnel marketing.
            </p>
            <div className="h-[350px]">
              {funnelProgressionData && (
                <Bar
                  data={funnelProgressionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                          callback: function (value) {
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
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `Taux de conversion: ${context.raw}%`;
                          }
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceCharts;