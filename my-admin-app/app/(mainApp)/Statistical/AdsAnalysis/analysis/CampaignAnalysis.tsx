import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    LogarithmicScale,
    PointElement,
    RadialLinearScale,
    Title,
    Tooltip
} from 'chart.js';
import React, { useMemo } from 'react';
import SectorComparison from './components/SectorComparison';
import CreativeAnalysis from './components/CreativeAnalysis';
import ScalingStrategy from './components/ScalingStrategy';
import AdvancedFunnelAnalysis from './components/AdvancedFunnelAnalysis';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    LogarithmicScale
);

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

interface AdSet {
    id: string;
    name: string;
    status: string;
    budget?: number;
    optimizationGoal?: string;
    impressions?: number;
    clicks?: number;
    ctr?: number;
    cpc?: number;
    spent?: number;
}

interface AdSetExtended extends AdSet {
    dateStart?: string | null;
    dateStop?: string | null;
    actions?: ActionData[];
    costPerActionType?: CostPerActionData[];
    purchases?: number;
    costPerPurchase?: number;
    addToCart?: number;
    costPerAddToCart?: number;
    landingPageViews?: number;
    reach?: number;
    frequency?: number;
    targetingInfo?: {
        age_min?: number;
        age_max?: number;
        genders?: number[];
        geo_locations?: any;
        interests?: any[];
    };
}

interface ActionData {
    action_type: string;
    value: string;
}

interface CostPerActionData {
    action_type: string;
    value: string;
}



interface CampaignAnalysisProps {
    campaigns: Campaign[];
    adSets: AdSetExtended[];
    selectedCampaign: string | null;
}

const industryBenchmarks = {
    ecommerce: {
        ctr: 1.32,
        cpc: 1.08,
        conversionRate: 3.26,
        frequency: 2.5
    },
    default: {
        ctr: 1.32,
        cpc: 1.08,
        conversionRate: 3.26,
        frequency: 2.5
    }
};

const businessVertical = 'ecommerce';

const CampaignAnalysis: React.FC<CampaignAnalysisProps> = ({ campaigns, adSets, selectedCampaign }) => {
    const activeCampaign = useMemo(() => {
        return campaigns.find(campaign => campaign.id === selectedCampaign);
    }, [campaigns, selectedCampaign]);

    const normalizeAdSetMetrics = useMemo(() => {
        return adSets.map(adSet => ({
            ...adSet,
            ctr: adSet.ctr && adSet.ctr > 100 ? adSet.ctr / 100 : adSet.ctr,
            cpc: adSet.cpc || 0,
            spent: adSet.spent || 0,
            impressions: adSet.impressions || 0,
            clicks: adSet.clicks || 0
        }));
    }, [adSets]);

    const getConversionMetrics = useMemo(() => {
        const initialMetrics = {
            landingPageViews: 0,
            addToCart: 0,
            purchases: 0,
            linkClicks: 0,
            costPerLandingPageView: 0,
            costPerAddToCart: 0,
            costPerPurchase: 0,
            conversionRate: 0,
            engagementRate: 0
        };

        if (!adSets.length) return initialMetrics;

        const metrics = adSets.reduce((acc, adSet) => {
            acc.landingPageViews += adSet.landingPageViews || 0;
            acc.addToCart += adSet.addToCart || 0;
            acc.purchases += adSet.purchases || 0;
            acc.linkClicks += adSet.clicks || 0;
            return acc;
        }, initialMetrics);

        const totalSpent = adSets.reduce((sum, adSet) => sum + (adSet.spent || 0), 0);

        return {
            ...metrics,
            costPerLandingPageView: metrics.landingPageViews ? totalSpent / metrics.landingPageViews : 0,
            costPerAddToCart: metrics.addToCart ? totalSpent / metrics.addToCart : 0,
            costPerPurchase: metrics.purchases ? totalSpent / metrics.purchases : 0,
            conversionRate: metrics.linkClicks ? (metrics.purchases / metrics.linkClicks) * 100 : 0,
            engagementRate: metrics.linkClicks ? (metrics.linkClicks / adSets.reduce((sum, adSet) => sum + (adSet.impressions || 0), 0)) * 100 : 0
        };
    }, [adSets]);

    const campaignDateRange = useMemo(() => {
        const defaultRange = { start: null, end: null, duration: 0 };
        if (!normalizeAdSetMetrics.length) return defaultRange;

        const dates = normalizeAdSetMetrics.reduce((acc, adSet) => {
            if (adSet.dateStart && (!acc.start || adSet.dateStart < acc.start)) acc.start = adSet.dateStart;
            if (adSet.dateStop && (!acc.end || adSet.dateStop > acc.end)) acc.end = adSet.dateStop;
            return acc;
        }, { start: null as string | null, end: null as string | null });

        if (!dates.start || !dates.end) return defaultRange;

        const startDate = new Date(dates.start);
        const endDate = new Date(dates.end);
        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

        return { ...dates, duration };
    }, [normalizeAdSetMetrics]);

    const benchmarks = useMemo(() => {
        return industryBenchmarks[businessVertical as keyof typeof industryBenchmarks] || industryBenchmarks.default;
    }, []);
    const adFrequency = useMemo(() => {
        if (!normalizeAdSetMetrics.length) return 0;

        const totalImpressions = normalizeAdSetMetrics.reduce(
            (sum, adSet) => sum + (adSet.impressions || 0), 0
        );

        const totalReach = normalizeAdSetMetrics.reduce(
            (sum, adSet) => sum + (adSet.reach || 0), 0
        );

        return totalReach > 0 ? totalImpressions / totalReach : 0;
    }, [normalizeAdSetMetrics]);
    const funnelAnalysis = useMemo(() => {
        if (!activeCampaign || !getConversionMetrics) return null;

        const totalImpressions = normalizeAdSetMetrics.reduce((sum, adSet) => sum + (adSet.impressions || 0), 0);
        const totalClicks = normalizeAdSetMetrics.reduce((sum, adSet) => sum + (adSet.clicks || 0), 0);
        const outboundClicks = activeCampaign.outboundClicks || 0;

        return {
            impressions: totalImpressions,
            clicks: totalClicks,
            outboundClicks,
            landingPageViews: getConversionMetrics.landingPageViews,
            addToCart: getConversionMetrics.addToCart,
            purchases: getConversionMetrics.purchases,
            dropOffRates: {
                impressionsToClicks: totalImpressions ? 100 - ((totalClicks / totalImpressions) * 100) : 0,
                clicksToOutbound: totalClicks ? 100 - ((outboundClicks / totalClicks) * 100) : 0,
                outboundToLanding: outboundClicks ? 100 - ((getConversionMetrics.landingPageViews / outboundClicks) * 100) : 0,
                landingToAddToCart: getConversionMetrics.landingPageViews ? 100 - ((getConversionMetrics.addToCart / getConversionMetrics.landingPageViews) * 100) : 0,
                addToCartToPurchase: getConversionMetrics.addToCart ? 100 - ((getConversionMetrics.purchases / getConversionMetrics.addToCart) * 100) : 0
            },
            conversionRates: {
                clickToLanding: totalClicks ? (getConversionMetrics.landingPageViews / totalClicks) * 100 : 0,
                landingToAddToCart: getConversionMetrics.landingPageViews ? (getConversionMetrics.addToCart / getConversionMetrics.landingPageViews) * 100 : 0,
                addToCartToPurchase: getConversionMetrics.addToCart ? (getConversionMetrics.purchases / getConversionMetrics.addToCart) * 100 : 0,
                overallConversion: totalImpressions ? (getConversionMetrics.purchases / totalImpressions) * 100 : 0
            },
            costMetrics: {
                costPerLandingPageView: getConversionMetrics.landingPageViews ? activeCampaign.spent / getConversionMetrics.landingPageViews : 0,
                costPerAddToCart: getConversionMetrics.addToCart ? activeCampaign.spent / getConversionMetrics.addToCart : 0,
                costPerPurchase: getConversionMetrics.purchases ? activeCampaign.spent / getConversionMetrics.purchases : 0
            }
        };
    }, [activeCampaign, getConversionMetrics, normalizeAdSetMetrics]);

    const campaignHealthScore = useMemo(() => {
        if (!activeCampaign || !benchmarks) return 0;

        const normalizedCTR = activeCampaign.ctr > 100 ? activeCampaign.ctr / 100 : activeCampaign.ctr;
        const actualConversionRate = activeCampaign.clicks ? (getConversionMetrics.purchases / activeCampaign.clicks) * 100 : 0;

        const ctrScore = Math.min(100, (normalizedCTR / benchmarks.ctr) * 100);
        const cpcScore = activeCampaign.cpc ? Math.min(100, (benchmarks.cpc / activeCampaign.cpc) * 100) : 0;
        const conversionScore = Math.min(100, (actualConversionRate / benchmarks.conversionRate) * 100);

        return Math.round((ctrScore * 0.3) + (cpcScore * 0.3) + (conversionScore * 0.4));
    }, [activeCampaign, benchmarks, getConversionMetrics.purchases]);

    const campaignROI = useMemo(() => {
        if (!activeCampaign || !activeCampaign.spent) return 0;
        const conversionValue = 50; // Average value per conversion
        const revenue = getConversionMetrics.purchases * conversionValue;
        return ((revenue - activeCampaign.spent) / activeCampaign.spent) * 100;
    }, [activeCampaign, getConversionMetrics.purchases]);



    const efficiencyScore = useMemo(() => {
        if (!activeCampaign || !benchmarks) return 0;

        const normalizedCTR = activeCampaign.ctr > 100 ?
            activeCampaign.ctr / 100 :
            activeCampaign.ctr;

        const ctrRatio = normalizedCTR / benchmarks.ctr;
        const cpcRatio = benchmarks.cpc / activeCampaign.cpc;

        return Math.min(100, Math.round((ctrRatio * 0.5 + cpcRatio * 0.5) * 100));
    }, [activeCampaign, benchmarks]);

    const scalingStrategy = useMemo(() => {
        if (!activeCampaign || campaignROI === 0) return null;

        const isReadyForScaling = campaignROI > 50 && efficiencyScore > 60;
        let approach = 'none';
        let budgetIncrease = 0;
        let description = '';

        if (isReadyForScaling) {
            if (campaignROI > 200 && efficiencyScore > 80) {
                approach = 'aggressive';
                budgetIncrease = 50;
                description = 'This campaign is extremely profitable and can support significant budget increases.';
            } else if (campaignROI > 100) {
                approach = 'moderate';
                budgetIncrease = 30;
                description = 'This campaign is highly profitable and can support moderate budget scaling.';
            } else {
                approach = 'conservative';
                budgetIncrease = 15;
                description = 'This campaign is profitable but should scale gradually to maintain performance.';
            }
        } else {
            description = 'This campaign is not ready for scaling. Optimize current performance first.';
        }

        return {
            isReadyForScaling,
            approach,
            budgetIncrease,
            description
        };
    }, [activeCampaign, campaignROI, efficiencyScore]);
    if (!activeCampaign) {
        return <div className="p-4 text-center text-neutral-600">Select a campaign to view analysis</div>;
    }

    const displayCTR = activeCampaign.ctr > 100 ? activeCampaign.ctr / 100 : activeCampaign.ctr;

    return (
        <div className="bg-white p-6 shadow-md rounded-lg border border-neutral-200 mb-6">
            <h3 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center">
                <div className="w-1 h-6 bg-primary rounded-full mr-2"></div>
                Campaign Analysis: {activeCampaign.name}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-neutral-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-neutral-800 mb-2">Health Score</h4>
                    <div className="flex items-end">
                        <div className="text-4xl font-bold">
                            {campaignHealthScore}
                            <span className="text-sm font-normal text-neutral-500">/100</span>
                        </div>
                        <div className="ml-2 mb-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${campaignHealthScore >= 70 ? "bg-green-100 text-green-800" :
                                campaignHealthScore >= 40 ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                }`}>
                                {campaignHealthScore >= 70 ? "Excellent" :
                                    campaignHealthScore >= 40 ? "Average" :
                                        "Poor"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-neutral-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-neutral-800 mb-2">ROI</h4>
                    <div className="flex items-end">
                        <div className="text-4xl font-bold">
                            {campaignROI?.toFixed(2)}
                            <span className="text-sm font-normal text-neutral-500">%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-neutral-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-neutral-800 mb-2">Efficiency</h4>
                    <div className="flex items-end">
                        <div className="text-4xl font-bold">
                            {displayCTR?.toFixed(2)}
                            <span className="text-sm font-normal text-neutral-500">% CTR</span>
                        </div>
                    </div>
                    <p className="text-sm text-neutral-600 mt-2">
                        CPC: {activeCampaign.cpc?.toFixed(2)}$ | Conversions: {getConversionMetrics.purchases}
                    </p>
                </div>
            </div>

            <SectorComparison
                activeCampaign={activeCampaign}
                benchmarks={benchmarks}
                adFrequency={adFrequency}
                campaignHealthScore={campaignHealthScore}
            />



            <CreativeAnalysis
                activeCampaign={activeCampaign}
                benchmarks={benchmarks}
                adFrequency={adFrequency}
            />

            <AdvancedFunnelAnalysis
                funnelAnalysis={funnelAnalysis}
                getConversionMetrics={getConversionMetrics}
                campaignDateRange={campaignDateRange}
                activeCampaign={activeCampaign}
            />
            <ScalingStrategy scalingStrategy={scalingStrategy} />
        </div>
    );
};

export default CampaignAnalysis;
