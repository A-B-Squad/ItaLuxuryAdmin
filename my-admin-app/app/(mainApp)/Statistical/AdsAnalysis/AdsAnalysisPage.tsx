"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { useToast } from "@/components/ui/use-toast";
import Loading from "../loading";

// Import components
import DateRangeSelector from "./components/filters/DateRangeSelector";
import KPICards from "./components/charts/KPICards";
import PerformanceCharts from "./components/charts/PerformanceCharts";
import CampaignsTable from "./components/tables/CampaignsTable";
import AdSetsTable from "./components/tables/AdSetsTable";
import CampaignAnalysis from "./analysis/CampaignAnalysis";

const AdsAnalysisPage: React.FC = () => {
    const { toast } = useToast();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
    });

    // Campaigns state
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
    const [campaignsError, setCampaignsError] = useState<string | null>(null);
    const [campaignStatusFilter, setCampaignStatusFilter] = useState("ALL");
    const [campaignsPage, setCampaignsPage] = useState(1);

    // Ad sets state
    const [adSets, setAdSets] = useState<any[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
    const [isLoadingAdSets, setIsLoadingAdSets] = useState(false);
    const [adSetsError, setAdSetsError] = useState<string | null>(null);
    const [adSetsPage, setAdSetsPage] = useState(1);

    // Pagination
    const itemsPerPage = 8;

    // Fetch Meta Ads data
    const fetchMetaAdsData = useCallback(async () => {
        try {
            setIsLoadingCampaigns(true);
            setCampaignsError(null);

            const dateFrom = dateRange?.from ? dateRange.from.toISOString().split('T')[0] : undefined;
            const dateTo = dateRange?.to ? dateRange.to.toISOString().split('T')[0] : undefined;

            const queryParams = new URLSearchParams();
            if (dateFrom) queryParams.append('dateFrom', dateFrom);
            if (dateTo) queryParams.append('dateTo', dateTo);

            const response = await fetch(`/api/meta-ads?${queryParams.toString()}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const detailedError = errorData?.error || `API error: ${response.status} ${response.statusText}`;
                throw new Error(detailedError);
            }

            const data = await response.json();
            console.log(data);

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch Meta Ads data");
            }

            setCampaigns(data.campaigns);
            toast({
                title: "Chargement réussi",
                description: "Données des campagnes chargées avec succès",
                className: "bg-green-500 text-white",
            });
        } catch (error: any) {
            console.error("Error fetching Meta Ads data:", error);
            const errorMessage = error.message || "An error occurred while fetching ad campaigns";
            setCampaignsError(errorMessage);
            toast({
                title: "Erreur",
                description: `Échec du chargement des campagnes: ${errorMessage}`,
                className: "bg-red-500 text-white",
            });
        } finally {
            setIsLoadingCampaigns(false);
        }
    }, [dateRange, toast]);

    // Fetch ad sets for a campaign
    const fetchAdSets = useCallback(async (campaignId: string) => {
        // If clicking the same campaign, toggle it off
        if (selectedCampaign === campaignId) {
            setSelectedCampaign(null);
            setAdSets([]);
            return;
        }

        try {
            setIsLoadingAdSets(true);
            setAdSetsError(null);

            const response = await fetch(`/api/meta-ads/adsets?campaignId=${campaignId}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const detailedError = errorData?.error || `API error: ${response.status} ${response.statusText}`;
                throw new Error(detailedError);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch ad sets");
            }

            setAdSets(data.adSets);
            setSelectedCampaign(campaignId);
            toast({
                title: "Chargement réussi",
                description: "Ensembles de publicités chargés avec succès",
                className: "bg-green-500 text-white",
            });
        } catch (error: any) {
            console.error("Error fetching ad sets:", error);
            const errorMessage = error.message || "An error occurred while fetching ad sets";
            setAdSetsError(errorMessage);
            toast({
                title: "Erreur",
                description: `Échec du chargement des ensembles: ${errorMessage}`,
                variant: "destructive",
                className: "bg-red-100 border-red-200 text-red-800",
            });
        } finally {
            setIsLoadingAdSets(false);
        }
    }, [selectedCampaign, toast]);

    // Add this paginated campaigns calculation
    const paginatedCampaigns = useMemo(() => {
        const filtered = campaignStatusFilter === "ALL"
            ? campaigns
            : campaigns.filter(campaign => campaign.status === campaignStatusFilter);

        const startIndex = (campaignsPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return {
            data: filtered.slice(startIndex, endIndex),
            totalPages: Math.ceil(filtered.length / itemsPerPage),
            totalItems: filtered.length
        };
    }, [campaigns, campaignStatusFilter, campaignsPage]);

    // Add this paginated ad sets calculation
    const paginatedAdSets = useMemo(() => {
        const startIndex = (adSetsPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return {
            data: adSets.slice(startIndex, endIndex),
            totalPages: Math.ceil(adSets.length / itemsPerPage),
            totalItems: adSets.length
        };
    }, [adSets, adSetsPage]);

    // Reset pagination when filters or selections change
    useEffect(() => {
        setCampaignsPage(1);
    }, [campaignStatusFilter]);

    useEffect(() => {
        setAdSetsPage(1);
    }, [selectedCampaign]);

    // Fetch data when component mounts or date range changes
    useEffect(() => {
        fetchMetaAdsData();
    }, [fetchMetaAdsData]);

    // Calculate KPIs with more robust error handling and data validation
    const kpis = useMemo(() => {
        // Ensure we have valid data to work with
        if (!campaigns || campaigns.length === 0) {
            return {
                totalSpent: 0,
                totalImpressions: 0,
                totalClicks: 0,
                totalConversions: 0,
                ctr: 0,
                conversionRate: 0,
                cpc: 0,
                cpa: 0,
                costPerThousandImpressions: 0
            };
        }

        const totalSpent = campaigns.reduce((sum, campaign) => sum + (campaign.spent || 0), 0);
        const totalImpressions = campaigns.reduce((sum, campaign) => sum + (campaign.impressions || 0), 0);
        const totalClicks = campaigns.reduce((sum, campaign) => sum + (campaign.clicks || 0), 0);
        const totalConversions = campaigns.reduce((sum, campaign) => sum + (campaign.purchases || 0), 0);

        // Calculate metrics with safeguards against division by zero
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
        const cpc = totalClicks > 0 ? totalSpent / totalClicks : 0;
        const cpa = totalConversions > 0 ? totalSpent / totalConversions : 0;

        // CPM (Cost Per Mille/Thousand Impressions) - a standard industry metric
        const costPerThousandImpressions = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;

        return {
            totalSpent,
            totalImpressions,
            totalClicks,
            totalConversions,
            ctr,
            conversionRate,
            cpc,
            cpa,
            costPerThousandImpressions
        };
    }, [campaigns]);

    // Prepare data for performance chart with improved visualization
    const performanceData = useMemo(() => {
        if (!campaigns || campaigns.length === 0) {
            return {
                labels: [],
                datasets: []
            };
        }

        // Sort campaigns by performance for better visualization
        const sortedCampaigns = [...campaigns].sort((a, b) => b.impressions - a.impressions);
        // Limit to top 10 campaigns for readability
        const topCampaigns = sortedCampaigns.slice(0, 10);

        return {
            labels: topCampaigns.map(campaign => campaign.name),
            datasets: [
                {
                    label: 'Impressions (÷100)',
                    data: topCampaigns.map(campaign => (campaign.impressions || 0) / 100),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Clicks',
                    data: topCampaigns.map(campaign => campaign.clicks || 0),
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Conversions',
                    data: topCampaigns.map(campaign => campaign.purchases || 0),
                    backgroundColor: 'rgba(245, 158, 11, 0.5)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 1,
                }
            ]
        };
    }, [campaigns]);

    // Prepare efficiency analysis instead of ROI chart (using actual data only)
    const efficiencyChartData = useMemo(() => {
        if (!campaigns || campaigns.length === 0) {
            return {
                labels: [],
                datasets: []
            };
        }

        // Calculate efficiency metrics for each campaign
        const campaignsWithEfficiency = campaigns.map(campaign => {
            // Calculate cost efficiency metrics
            const cpm = campaign.impressions > 0 ? (campaign.spent / campaign.impressions) * 1000 : 0;
            const cpc = campaign.clicks > 0 ? campaign.spent / campaign.clicks : 0;

            // Calculate engagement efficiency
            const ctrValue = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
            const ctr = ctrValue?.toFixed(2) + '%';

            // Calculate overall efficiency score (lower is better)
            // This combines multiple metrics into a single score without using assumed values
            const efficiencyScore = (cpm / 10) + cpc + (10 / (ctrValue || 0.1));

            return {
                ...campaign,
                cpm,
                cpc,
                ctr,
                efficiencyScore
            };
        });

        // Sort campaigns by efficiency score (lower is better)
        const sortedCampaigns = [...campaignsWithEfficiency].sort((a, b) => a.efficiencyScore - b.efficiencyScore);
        // Limit to top 10 campaigns for readability
        const topCampaigns = sortedCampaigns.slice(0, 10);

        return {
            labels: topCampaigns.map(campaign => campaign.name),
            datasets: [
                {
                    label: 'CPC ($)',
                    data: topCampaigns.map(campaign => campaign.cpc),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    yAxisID: 'y',
                },
                {
                    label: 'CPM ($)',
                    data: topCampaigns.map(campaign => campaign.cpm),
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                    yAxisID: 'y',
                },
                {
                    label: 'CTR (%)',
                    data: topCampaigns.map(campaign => campaign.ctr),
                    backgroundColor: 'rgba(245, 158, 11, 0.7)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 1,
                    yAxisID: 'y1',
                }
            ]
        };
    }, [campaigns]);


    // Fetch data for selected campaign
    const selectedCampaignData = useMemo(() => {
        if (!selectedCampaign) return undefined;
        return campaigns.find(campaign => campaign.id === selectedCampaign);
    }, [campaigns, selectedCampaign]);



    // Show loading state
    if (isLoadingCampaigns) return <Loading />;

    // Show error state
    if (campaignsError) return (
        <div className="flex items-center justify-center h-96 bg-dashboard-neutral-50 rounded-lg">
            <div className="text-center p-6 bg-white rounded-lg shadow-md border border-dashboard-neutral-200">
                <div className="text-dashboard-danger text-5xl mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-dashboard-neutral-800 mb-2">Error Loading Data</h3>
                <p className="text-dashboard-neutral-600 mb-4">{campaignsError}</p>
                <button
                    onClick={() => {
                        toast({
                            title: "Nouvelle tentative",
                            description: "Tentative de rechargement des données...",
                            className: "bg-blue-500 text-white",
                        });
                        fetchMetaAdsData();
                    }}
                    className="bg-dashboard-primary text-white px-4 py-2 rounded-md hover:bg-dashboard-primary-dark transition-all"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div className="w-full bg-dashboard-neutral-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-dashboard-neutral-800 mb-6 border-b pb-3">Analyse des Campagnes Facebook</h1>

                {/* Date Range Selector */}
                <DateRangeSelector dateRange={dateRange} setDateRange={setDateRange} />

                {/* KPI Cards */}
                <KPICards
                    kpis={kpis}
                    totalBudget={campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0)}
                />

                {/* Performance Charts */}

                <PerformanceCharts
                    performanceData={performanceData}
                    efficiencyChartData={efficiencyChartData}
                    campaignData={selectedCampaignData}
                />

                {/* Campaigns Table */}
                <CampaignsTable
                    campaigns={paginatedCampaigns}
                    campaignStatusFilter={campaignStatusFilter}
                    setCampaignStatusFilter={setCampaignStatusFilter}
                    campaignsPage={campaignsPage}
                    setCampaignsPage={setCampaignsPage}
                    itemsPerPage={itemsPerPage}
                    selectedCampaign={selectedCampaign}
                    fetchAdSets={fetchAdSets}
                />

                {/* Professional Campaign Analysis */}
                {selectedCampaign && (
                    <CampaignAnalysis
                        campaigns={campaigns}
                        adSets={adSets}
                        selectedCampaign={selectedCampaign}
                    />
                )}

                {/* Ad Sets Table */}
                {selectedCampaign && (
                    <AdSetsTable
                        isLoadingAdSets={isLoadingAdSets}
                        adSetsError={adSetsError}
                        adSets={paginatedAdSets}
                    />
                )}
            </div>
        </div>
    );
};

export default AdsAnalysisPage;

