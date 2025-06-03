import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const dateFrom = url.searchParams.get('dateFrom');
        const dateTo = url.searchParams.get('dateTo');




        // Extract credentials
        const accessToken = process.env.META_ADS_ACCESS_TOKEN;
        const adAccountId = process.env.META_ADS_ACCOUNT_ID;

        if (!accessToken || !adAccountId) {
            return NextResponse.json({
                success: false,
                error: "Missing Meta API credentials from database"
            }, { status: 500 });
        }

        const apiVersion = 'v22.0';

        // Fetch campaigns data
        const campaignsResponse = await fetch(
            "https://graph.facebook.com/v22.0/act_1225122091846038/campaigns?fields=id,name,status,objective&access_token=EAAM6AyLi6JQBO8FjMe3zrFwZB2ZCqOgVmZA6EeA1MVlLj1hrRIiGIyiAtrYYbfXPkO34EHotOQg5gRRQ8XjphRKFgk3kixespJqNrOHM3j6XsIwXiKLJ9ibdwJHAZAtOF7KL6mP2iY8T2SnADxP9l7AljqD6aheMEAgiiGphWL30mpbBXlqLMkW2KmpQYJDWM5xax4y5Y3AFwo8o"            // 

            , { cache: 'no-store' }

        );


        if (!campaignsResponse.ok) {
            const errorData = await campaignsResponse.json();
            throw new Error(`Failed to fetch campaigns: ${errorData.error?.message || campaignsResponse.statusText}`);
        }

        const campaignsData = await campaignsResponse.json();

        if (campaignsData.error) {
            throw new Error(`Meta API error: ${campaignsData.error.message}`);
        }

        // For each campaign, fetch insights
        const campaignsWithInsights = await Promise.all(
            campaignsData.data.map(async (campaign: any) => {
                try {
                    const timeIncrement = `&time_increment=all_days`;
                    const timeRange = dateFrom && dateTo
                        ? `&time_range=${encodeURIComponent(`{"since":"${dateFrom}","until":"${dateTo}"}`)}`
                        : '';

                    // Enhanced fields to fetch more detailed metrics
                    const insightsFields = 'impressions,clicks,ctr,cpc,spend,conversions,cost_per_conversion,reach,frequency,unique_clicks,unique_ctr,cost_per_unique_click,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p100_watched_actions,actions,action_values,cost_per_action_type,outbound_clicks,outbound_clicks_ctr';

                    const insightsResponse = await fetch(
                        `https://graph.facebook.com/${apiVersion}/${campaign.id}/insights?fields=${insightsFields}&level=campaign${timeRange}${timeIncrement}&access_token=${accessToken}`,
                        {
                            cache: 'no-store',

                        }


                    );

                    if (!insightsResponse.ok) {
                        const errorData = await insightsResponse.json();
                        console.error(`Error fetching insights for campaign ${campaign.id}: ${errorData.error?.message || insightsResponse.statusText}`);
                        return null;
                    }

                    const insightsData = await insightsResponse.json();

                    // Fetch additional campaign details including budget and schedule
                    const campaignDetailsResponse = await fetch(
                        `https://graph.facebook.com/${apiVersion}/${campaign.id}?fields=start_time,stop_time,daily_budget,lifetime_budget,budget_remaining,buying_type,special_ad_categories,bid_strategy,pacing_type&access_token=${accessToken}`,
                        { cache: 'no-store' }
                    );

                    const campaignDetails = campaignDetailsResponse.ok ?
                        await campaignDetailsResponse.json() : {};

                    // Return enhanced campaign data
                    return {
                        ...campaign,
                        insights: insightsData.data?.[0] || null,
                        details: campaignDetails,
                        dateStart: insightsData.data?.[0]?.date_start || null,
                        dateStop: insightsData.data?.[0]?.date_stop || null
                    };
                } catch (error) {
                    console.error(`Exception fetching insights for campaign ${campaign.id}:`, error);
                    return null;
                }
            })
        ).then(results => results.filter(Boolean));

        // Format the data for the frontend with enhanced metrics
        const formattedCampaigns = campaignsWithInsights.map(campaign => {
            // Extract action metrics (conversions by type)
            const actions = campaign.insights?.actions || [];
            const costPerActionType = campaign.insights?.cost_per_action_type || [];

            // Find specific conversion types
            const purchases = actions.find((a: any) => a.action_type === 'purchase')?.value || 0;
            const leadForms = actions.find((a: any) => a.action_type === 'lead')?.value || 0;
            const pageEngagement = actions.find((a: any) => a.action_type === 'page_engagement')?.value || 0;
            const landingPageViews = actions.find((a: any) => a.action_type === 'landing_page_view')?.value || 0;

            // Video engagement metrics
            const videoViews = actions.find((a: any) => a.action_type === 'video_view')?.value || 0;
            const videoP100 = campaign.insights?.video_p100_watched_actions?.[0]?.value || 0;

            // Calculate video completion rate
            const videoCompletionRate = videoViews > 0 ? (videoP100 / videoViews) * 100 : 0;

            // Calculate budget utilization
            const budget = parseFloat(campaign.details?.daily_budget || campaign.details?.lifetime_budget || 0) / 100;
            const spent = parseFloat(campaign.insights?.spend || 0);
            const budgetUtilization = budget > 0 ? (spent / budget) * 100 : 0;

            return {
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                objective: campaign.objective,
                startTime: campaign.details?.start_time,
                endTime: campaign.details?.stop_time,
                budget: budget,
                budgetRemaining: parseFloat(campaign.details?.budget_remaining || 0) / 100,
                budgetUtilization: budgetUtilization,
                bidStrategy: campaign.details?.bid_strategy,

                // Basic metrics
                spent: spent,
                impressions: parseInt(campaign.insights?.impressions || 0),
                reach: parseInt(campaign.insights?.reach || 0),
                frequency: parseFloat(campaign.insights?.frequency || 0),
                clicks: parseInt(campaign.insights?.clicks || 0),
                uniqueClicks: parseInt(campaign.insights?.unique_clicks || 0),
                ctr: parseFloat(campaign.insights?.ctr || 0) * 100, // Convert to percentage
                uniqueCtr: parseFloat(campaign.insights?.unique_ctr || 0) * 100,
                cpc: parseFloat(campaign.insights?.cpc || 0),
                costPerUniqueClick: parseFloat(campaign.insights?.cost_per_unique_click || 0),

                // Conversion metrics
                conversions: parseInt(campaign.insights?.conversions || 0),
                costPerConversion: parseFloat(campaign.insights?.cost_per_conversion || 0),
                purchases: parseInt(purchases),
                leads: parseInt(leadForms),

                // Engagement metrics
                pageEngagement: parseInt(pageEngagement),
                landingPageViews: parseInt(landingPageViews),
                outboundClicks: parseInt(campaign.insights?.outbound_clicks?.[0]?.value || 0),
                outboundClicksCtr: parseFloat(campaign.insights?.outbound_clicks_ctr?.[0]?.value || 0) * 100,

                // Video metrics
                videoViews: parseInt(videoViews),
                videoCompletionRate: videoCompletionRate,

                // Date range
                dateStart: campaign.dateStart,
                dateStop: campaign.dateStop,

                // Raw data for advanced analysis
                actions: actions,
                costPerActionType: costPerActionType
            };
        });

        return NextResponse.json({
            success: true,
            campaigns: formattedCampaigns
        });
    } catch (error: any) {
        console.error("Error fetching Meta Ads data:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Unknown error"
        }, { status: 500 });
    }
}