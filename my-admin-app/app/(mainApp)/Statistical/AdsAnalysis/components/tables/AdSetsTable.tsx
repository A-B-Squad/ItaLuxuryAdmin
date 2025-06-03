import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState } from 'react';
import { FaChartLine, FaChartPie, FaCreditCard, FaUsers } from "react-icons/fa";
import AdSetInsights from "../../analysis/components/AdSetInsights";
import EngagementAnalysis from "../../analysis/components/EngagementAnalysis";
import FunnelAnalysis from "../../analysis/components/FunnelAnalysis";

interface AdSetsTableProps {
  isLoadingAdSets: boolean;
  adSetsError: string | null;
  adSets: {
    data: any[];
    totalPages: number;
    totalItems: number;
  };

}

const AdSetsTable: React.FC<AdSetsTableProps> = ({
  isLoadingAdSets,
  adSetsError,
  adSets,

}) => {
  const [selectedAdSet, setSelectedAdSet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate performance metrics for ad sets
  const adSetAnalysis = React.useMemo(() => {
    if (!adSets.data || adSets.data.length === 0) return null;

    // Calculate average metrics
    const avgCTR = adSets.data.reduce((sum, adSet) => sum + (adSet.ctr || 0), 0) / adSets.data.length;
    const avgCPC = adSets.data.reduce((sum, adSet) => sum + (adSet.cpc || 0), 0) / adSets.data.length;
    const avgSpent = adSets.data.reduce((sum, adSet) => sum + (adSet.spent || 0), 0) / adSets.data.length;

    // Find best and worst performing ad sets
    const bestCTRAdSet = [...adSets.data].sort((a, b) => (b.ctr || 0) - (a.ctr || 0))[0];
    const worstCTRAdSet = [...adSets.data].sort((a, b) => (a.ctr || 0) - (b.ctr || 0))[0];
    const bestCPCAdSet = [...adSets.data].sort((a, b) => (a.cpc || 0) - (b.cpc || 0))[0];
    const worstCPCAdSet = [...adSets.data].sort((a, b) => (b.cpc || 0) - (a.cpc || 0))[0];

    // Categorize ad sets by performance
    const performanceDistribution = {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0
    };

    adSets.data.forEach(adSet => {
      const ctrPerformance = (adSet.ctr || 0) / avgCTR;
      const cpcPerformance = avgCPC / (adSet.cpc || 1);
      const overallScore = (ctrPerformance + cpcPerformance) / 2;

      if (overallScore > 1.5) performanceDistribution.excellent++;
      else if (overallScore > 1) performanceDistribution.good++;
      else if (overallScore > 0.5) performanceDistribution.average++;
      else performanceDistribution.poor++;
    });

    // Analyze optimization goals
    const optimizationGoals = adSets.data.reduce((acc, adSet) => {
      const goal = adSet.optimizationGoal || 'unknown';
      acc[goal] = (acc[goal] || 0) + 1;
      return acc;
    }, {});


    return {
      avgCTR,
      avgCPC,
      avgSpent,
      bestCTRAdSet,
      worstCTRAdSet,
      bestCPCAdSet,
      worstCPCAdSet,
      performanceDistribution,
      optimizationGoals,
      platformBreakdown: {},
      ageBreakdown: {},
    };
  }, [adSets.data]);

  // Prepare data for ad sets performance chart
  const adSetsPerformanceData = React.useMemo(() => {
    if (!adSets.data || adSets.data.length === 0) return null;

    return {
      labels: adSets.data.map(adSet => adSet.name),
      datasets: [
        {
          label: 'CTR (%)',
          data: adSets.data.map(adSet => adSet.ctr || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
        {
          label: 'CPC ($)',
          data: adSets.data.map(adSet => adSet.cpc || 0),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
        }
      ]
    };
  }, [adSets.data]);

  // Prepare data for performance distribution chart
  const performanceDistributionData = React.useMemo(() => {
    if (!adSetAnalysis) return null;

    return {
      labels: ['Excellent', 'Bon', 'Moyen', 'Faible'],
      datasets: [
        {
          data: [
            adSetAnalysis.performanceDistribution.excellent,
            adSetAnalysis.performanceDistribution.good,
            adSetAnalysis.performanceDistribution.average,
            adSetAnalysis.performanceDistribution.poor
          ],
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)'
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 1,
        }
      ]
    };
  }, [adSetAnalysis]);

  // Prepare funnel analysis data
  const funnelAnalysis = React.useMemo(() => {
    if (!adSets.data || adSets.data.length === 0) return null;

    const totalImpressions = adSets.data.reduce((sum, adSet) => sum + (adSet.impressions || 0), 0);
    const totalClicks = adSets.data.reduce((sum, adSet) => sum + (adSet.clicks || 0), 0);
    const totalLandingPageViews = adSets.data.reduce((sum, adSet) => sum + (adSet.landingPageViews || 0), 0);
    const totalAddToCart = adSets.data.reduce((sum, adSet) => sum + (adSet.addToCart || 0), 0);
    const totalPurchases = adSets.data.reduce((sum, adSet) => sum + (adSet.purchases || 0), 0);

    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      landingPageViews: totalLandingPageViews,
      addToCart: totalAddToCart,
      purchases: totalPurchases
    };
  }, [adSets.data]);

  // Prepare funnel visualization data
  const funnelVisualizationData = React.useMemo(() => {
    if (!funnelAnalysis) return null;

    return {
      labels: ['Impressions', 'Clics', 'Vues Landing Page', 'Ajouts au Panier', 'Achats'],
      datasets: [
        {
          label: 'Funnel de Conversion',
          data: [
            funnelAnalysis.impressions,
            funnelAnalysis.clicks,
            funnelAnalysis.landingPageViews,
            funnelAnalysis.addToCart,
            funnelAnalysis.purchases
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(139, 92, 246, 0.7)'
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(139, 92, 246, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  }, [funnelAnalysis]);

  // Prepare conversion rate comparison data
  const conversionRateComparisonData = React.useMemo(() => {
    if (!funnelAnalysis) return null;

    const clickRate = funnelAnalysis.impressions > 0 ? (funnelAnalysis.clicks / funnelAnalysis.impressions) * 100 : 0;
    const landingPageRate = funnelAnalysis.clicks > 0 ? (funnelAnalysis.landingPageViews / funnelAnalysis.clicks) * 100 : 0;
    const addToCartRate = funnelAnalysis.landingPageViews > 0 ? (funnelAnalysis.addToCart / funnelAnalysis.landingPageViews) * 100 : 0;
    const purchaseRate = funnelAnalysis.addToCart > 0 ? (funnelAnalysis.purchases / funnelAnalysis.addToCart) * 100 : 0;

    return {
      labels: ['Impression → Clic', 'Clic → Landing Page', 'Landing Page → Panier', 'Panier → Achat'],
      datasets: [
        {
          label: 'Taux de Conversion (%)',
          data: [clickRate, landingPageRate, addToCartRate, purchaseRate],
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }
      ]
    };
  }, [funnelAnalysis]);

  // Calculate conversion metrics
  const getConversionMetrics = React.useMemo(() => {
    if (!funnelAnalysis || !adSets.data || adSets.data.length === 0) return null;

    const totalImpressions = funnelAnalysis.impressions;
    const totalClicks = funnelAnalysis.clicks;
    const totalLandingPageViews = funnelAnalysis.landingPageViews;
    const totalAddToCart = funnelAnalysis.addToCart;
    const totalPurchases = funnelAnalysis.purchases;

    // Calculate engagement metrics with safer access to nested properties
    const videoViews = adSets.data.reduce((sum, adSet) => {
      if (adSet.breakdowns &&
        adSet.breakdowns.action_type &&
        adSet.breakdowns.action_type.video_view &&
        adSet.breakdowns.action_type.video_view.value) {
        return sum + parseInt(adSet.breakdowns.action_type.video_view.value);
      }
      return sum;
    }, 0);

    const postEngagements = adSets.data.reduce((sum, adSet) => {
      if (adSet.breakdowns &&
        adSet.breakdowns.action_type &&
        adSet.breakdowns.action_type.post_engagement &&
        adSet.breakdowns.action_type.post_engagement.value) {
        return sum + parseInt(adSet.breakdowns.action_type.post_engagement.value);
      }
      return sum;
    }, 0);

    // Calculate rates
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : 0;
    const landingPageViewRate = totalClicks > 0 ? (totalLandingPageViews / totalClicks) * 100 : 0;
    const addToCartRate = totalLandingPageViews > 0 ? (totalAddToCart / totalLandingPageViews) * 100 : 0;
    const purchaseRate = totalAddToCart > 0 ? (totalPurchases / totalAddToCart) * 100 : 0;
    const engagementRate = totalImpressions > 0 ? (postEngagements / totalImpressions) * 100 : 0;

    return {
      totalImpressions,
      totalClicks,
      totalLandingPageViews,
      totalAddToCart,
      totalPurchases,
      videoViews,
      postEngagements,
      ctr,
      conversionRate,
      landingPageViewRate,
      addToCartRate,
      purchaseRate,
      engagementRate
    };
  }, [funnelAnalysis, adSets.data]);

  // Generate recommendations based on analysis
  const recommendations = React.useMemo(() => {
    if (!adSetAnalysis || !funnelAnalysis || !conversionRateComparisonData) return [];

    const recs = [];

    // Check for underperforming ad sets
    if (adSetAnalysis.performanceDistribution.poor > 0) {
      recs.push({
        priority: 'high',
        action: `Mettre en pause ${adSetAnalysis.performanceDistribution.poor} ensembles peu performants`,
        description: 'Ces ensembles ont un CTR inférieur à 50% de la moyenne et drainent votre budget sans résultats proportionnels.'
      });
    }

    // Recommend budget reallocation
    if (adSetAnalysis.bestCTRAdSet && adSetAnalysis.worstCPCAdSet) {
      recs.push({
        priority: 'medium',
        action: `Réallouer le budget de "${adSetAnalysis.worstCPCAdSet.name}" vers "${adSetAnalysis.bestCTRAdSet.name}"`,
        description: `Déplacez le budget des ensembles moins performants vers ceux qui génèrent le meilleur CTR pour optimiser le ROI.`
      });
    }

    // Check funnel drop-offs
    const conversionRates = conversionRateComparisonData.datasets[0].data;
    if (conversionRates && conversionRates.length > 0) {
      const lowestRateIndex = conversionRates.indexOf(Math.min(...conversionRates));
      const funnelSteps = ['Impression → Clic', 'Clic → Landing Page', 'Landing Page → Panier', 'Panier → Achat'];

      if (lowestRateIndex !== -1 && lowestRateIndex < funnelSteps.length) {
        recs.push({
          priority: 'high',
          action: `Optimiser l'étape "${funnelSteps[lowestRateIndex]}"`,
          description: `Cette étape a le taux de conversion le plus bas (${conversionRates[lowestRateIndex]?.toFixed(2)}%). Concentrez vos efforts d'optimisation ici.`
        });
      }
    }

    // Age-specific recommendations
    if (adSetAnalysis?.ageBreakdown && Object.keys(adSetAnalysis.ageBreakdown).length > 1) {
      const ages = Object.entries(adSetAnalysis.ageBreakdown).sort((a, b) => {
        const metricsA = a[1] as { ctr: number };
        const metricsB = b[1] as { ctr: number };
        return metricsB.ctr - metricsA.ctr;
      });

      if (ages.length > 1) {
        const [bestAge, bestMetrics] = ages[0];
        const typedMetrics = bestMetrics as { ctr: number };

        recs.push({
          priority: 'medium',
          action: `Cibler davantage la tranche d'âge ${bestAge}`,
          description: `Cette tranche d'âge montre le meilleur engagement avec un CTR de ${typedMetrics.ctr?.toFixed(2)}%.`
        });
      }
    }

    return recs;
  }, [adSetAnalysis, funnelAnalysis, conversionRateComparisonData]);

  // Show loading state
  if (isLoadingAdSets) {
    return (
      <div className="bg-white p-6 shadow-md rounded-lg border border-dashboard-neutral-200 mb-6 animate-pulse">
        <div className="h-6 bg-dashboard-neutral-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-8 bg-dashboard-neutral-200 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (adSetsError) {
    return (
      <div className="bg-white p-6 shadow-md rounded-lg border border-dashboard-neutral-200 mb-6">
        <h3 className="text-xl font-semibold text-dashboard-neutral-800 mb-4 flex items-center">
          <div className="w-1 h-6 bg-dashboard-danger rounded-full mr-2"></div>
          Ensembles de Publicités
        </h3>
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <p className="font-medium">Erreur lors du chargement des ensembles de publicités</p>
          <p className="text-sm mt-1">{adSetsError}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (adSets.data.length === 0) {
    return (
      <div className="bg-white p-6 shadow-md rounded-lg border border-dashboard-neutral-200 mb-6">
        <h3 className="text-xl font-semibold text-dashboard-neutral-800 mb-4 flex items-center">
          <div className="w-1 h-6 bg-dashboard-primary rounded-full mr-2"></div>
          Ensembles de Publicités
        </h3>
        <div className="p-8 text-center text-dashboard-neutral-600">
          <div className="text-5xl mb-4">📊</div>
          <p className="font-medium">Aucun ensemble de publicités trouvé</p>
          <p className="text-sm mt-1">Cette campagne ne contient pas d'ensembles de publicités actifs.</p>
        </div>
      </div>
    );
  }

  // Render breakdown section only if data exists
  const renderBreakdownSection = (breakdown: any, title: string, keyMapper: (key: string) => string, colorMapper: (key: string) => string) => {
    if (!breakdown || Object.keys(breakdown).length === 0) return null;

    return (
      <div className="bg-white p-6 shadow-md rounded-lg border border-dashboard-neutral-200">
        <div className="pt-6">
          <h6 className="text-md font-medium text-dashboard-neutral-700 mb-3">{title}</h6>
          <div className="space-y-4">
            {Object.entries(breakdown).map(([key, metrics]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-8 rounded-sm ${colorMapper(key)} mr-3`}></div>
                  <div>
                    <p className="font-medium text-dashboard-neutral-700">
                      {keyMapper(key)}
                    </p>
                    <p className="text-xs text-dashboard-neutral-500">
                      {(metrics as { impressions: number }).impressions.toLocaleString()} impressions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-dashboard-neutral-700">
                    {(metrics as { ctr: number }).ctr?.toFixed(2)}% CTR
                  </p>
                  <p className="text-xs text-dashboard-neutral-500">
                    {(metrics as { clicks: number }).clicks.toLocaleString()} clics
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg border border-dashboard-neutral-200 mb-6">
      <h3 className="text-xl font-semibold text-dashboard-neutral-800 mb-4 flex items-center">
        <div className="w-1 h-6 bg-dashboard-primary rounded-full mr-2"></div>
        Ensembles de Publicités ({adSets.totalItems})
      </h3>

      {/* Simple tab navigation */}
      <div className="mb-6">

        <div className="flex space-x-2 border-b border-dashboard-neutral-200 mb-4">
          <button
            className={`flex items-center px-4 py-2 text-sm font-medium ${activeTab === "overview"
              ? "border-b-2 border-dashboard-primary text-dashboard-primary"
              : "text-dashboard-neutral-600 hover:text-dashboard-neutral-900"
              }`}
            onClick={() => setActiveTab("overview")}
          >
            <FaChartPie className="w-4 h-4 mr-2" />
            Vue d'ensemble
          </button>
          <button
            className={`flex items-center px-4 py-2 text-sm font-medium ${activeTab === "insights"
              ? "border-b-2 border-dashboard-primary text-dashboard-primary"
              : "text-dashboard-neutral-600 hover:text-dashboard-neutral-900"
              }`}
            onClick={() => setActiveTab("insights")}
          >
            <FaChartLine className="w-4 h-4 mr-2" />
            Insights
          </button>
          <button
            className={`flex items-center px-4 py-2 text-sm font-medium ${activeTab === "funnel"
              ? "border-b-2 border-dashboard-primary text-dashboard-primary"
              : "text-dashboard-neutral-600 hover:text-dashboard-neutral-900"
              }`}
            onClick={() => setActiveTab("funnel")}
          >
            <FaCreditCard className="w-4 h-4 mr-2" />
            Funnel
          </button>
          <button
            className={`flex items-center px-4 py-2 text-sm font-medium ${activeTab === "targeting"
              ? "border-b-2 border-dashboard-primary text-dashboard-primary"
              : "text-dashboard-neutral-600 hover:text-dashboard-neutral-900"
              }`}
            onClick={() => setActiveTab("targeting")}
          >
            <FaUsers className="w-4 h-4 mr-2" />
            Ciblage
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Nom de l'Ensemble</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clics</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>CPC</TableHead>
                    <TableHead>Dépensé</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adSets.data.map((adSet) => (
                    <TableRow
                      key={adSet.id}
                      className={selectedAdSet === adSet.id ? "bg-dashboard-neutral-100" : ""}
                      onClick={() => setSelectedAdSet(adSet.id === selectedAdSet ? null : adSet.id)}
                    >
                      <TableCell className="font-medium">{adSet.name}</TableCell>
                      <TableCell>
                        <Badge variant={adSet.status === 'ACTIVE' ? "default" : "secondary"}>
                          {adSet.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{adSet.budget ? `${adSet.budget}$` : "N/A"}</TableCell>
                      <TableCell>{adSet.impressions?.toLocaleString() || 0}</TableCell>
                      <TableCell>{adSet.clicks?.toLocaleString() || 0}</TableCell>
                      <TableCell>{adSet.ctr ? `${adSet.ctr?.toFixed(2)}%` : "0.00%"}</TableCell>
                      <TableCell>{adSet.cpc ? `${adSet.cpc?.toFixed(2)}$` : "0.00$"}</TableCell>
                      <TableCell>{adSet.spent ? `${adSet.spent?.toFixed(2)}$` : "0.00$"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {adSetAnalysis && (
                <>
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Platform Breakdown */}
                    {renderBreakdownSection(
                      adSetAnalysis.platformBreakdown,
                      "Performances par Plateforme",
                      (platform: string) => platform === 'facebook' ? 'Facebook' :
                        platform === 'instagram' ? 'Instagram' :
                          platform === 'audience_network' ? 'Audience Network' :
                            platform === 'messenger' ? 'Messenger' : platform,
                      (platform: string) => platform === 'facebook' ? 'bg-blue-600' :
                        platform === 'instagram' ? 'bg-pink-500' :
                          platform === 'audience_network' ? 'bg-orange-500' :
                            platform === 'messenger' ? 'bg-indigo-500' : 'bg-gray-500'
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-1 gap-6">
                    {/* Age Breakdown */}
                    {renderBreakdownSection(
                      adSetAnalysis.ageBreakdown,
                      "Performances par Âge",
                      (age: string) => age,
                      () => "bg-gradient-to-b from-blue-400 to-blue-600"
                    )}
                  </div>

                  {/* Recommendations Section */}
                  <div className="mt-8">
                    <h5 className="text-lg font-semibold text-dashboard-neutral-800 mb-4">Recommandations d'Optimisation</h5>
                    <div className="space-y-4">
                      {recommendations.map((rec, index) => (
                        <div key={index} className={`p-4 rounded-lg border-l-4 ${rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                          rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                            'border-green-500 bg-green-50'
                          }`}>
                          <h6 className="font-medium text-dashboard-neutral-800 mb-1">{rec.action}</h6>
                          <p className="text-sm text-dashboard-neutral-600">{rec.description}</p>
                        </div>
                      ))}

                      {recommendations.length === 0 && (
                        <div className="p-4 rounded-lg border border-dashboard-neutral-200 bg-dashboard-neutral-50 text-center">
                          <p className="text-dashboard-neutral-600">Aucune recommandation disponible pour le moment.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === "insights" && (
            <AdSetInsights
              adSetAnalysis={adSetAnalysis}
              adSetsPerformanceData={adSetsPerformanceData}
              performanceDistributionData={performanceDistributionData}
              recommendations={recommendations}
            />
          )}

          {activeTab === "funnel" && (
            <FunnelAnalysis
              funnelAnalysis={funnelAnalysis}
              funnelVisualizationData={funnelVisualizationData}
              conversionRateComparisonData={conversionRateComparisonData}
            />
          )}

          {activeTab === "targeting" && (
            <EngagementAnalysis
              getConversionMetrics={getConversionMetrics}
              funnelAnalysis={funnelAnalysis}
            />
          )}
        </div>




      </div>
    </div>


  )
};

export default AdSetsTable;