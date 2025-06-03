import { NextResponse } from 'next/server';


export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const campaignId = url.searchParams.get('campaignId');

        if (!campaignId) {
            return NextResponse.json({
                success: false,
                error: "Campaign ID is required"
            }, { status: 400 });
        }



        // Extract credentials
        const accessToken = process.env.META_ADS_ACCESS_TOKEN;
        const adAccountId = process.env.META_ADS_ACCOUNT_ID;

        if (!accessToken || !adAccountId) {
            return NextResponse.json({
                success: false,
                error: "Missing Meta API credentials from database"
            }, { status: 500 });
        }

        // Fetch ad sets for the campaign
        const adSetsResponse = await fetch(
            `https://graph.facebook.com/v22.0/${campaignId}/adsets?fields=id,name,status,daily_budget,lifetime_budget,optimization_goal&access_token=EAAM6AyLi6JQBO8FjMe3zrFwZB2ZCqOgVmZA6EeA1MVlLj1hrRIiGIyiAtrYYbfXPkO34EHotOQg5gRRQ8XjphRKFgk3kixespJqNrOHM3j6XsIwXiKLJ9ibdwJHAZAtOF7KL6mP2iY8T2SnADxP9l7AljqD6aheMEAgiiGphWL30mpbBXlqLMkW2KmpQYJDWM5xax4y5Y3AFwo8o`,
            { cache: 'no-store' }
        );

        if (!adSetsResponse.ok) {
            const errorData = await adSetsResponse.json();
            throw new Error(`Failed to fetch ad sets: ${errorData.error?.message || adSetsResponse.statusText}`);
        }

        const adSetsData = await adSetsResponse.json();

        if (adSetsData.error) {
            throw new Error(`Meta API error: ${adSetsData.error.message}`);
        }

        // For each ad set, fetch insights
        const adSetsWithInsights = await Promise.all(
            adSetsData.data.map(async (adSet: any) => {
                try {
                    const insightsRes = await fetch(
                        `https://graph.facebook.com/v22.0/${adSet.id}/insights?fields=impressions,clicks,ctr,cpc,spend,actions,cost_per_action_type,date_start,date_stop&level=adset&time_increment=all_days&access_token=EAAM6AyLi6JQBO8FjMe3zrFwZB2ZCqOgVmZA6EeA1MVlLj1hrRIiGIyiAtrYYbfXPkO34EHotOQg5gRRQ8XjphRKFgk3kixespJqNrOHM3j6XsIwXiKLJ9ibdwJHAZAtOF7KL6mP2iY8T2SnADxP9l7AljqD6aheMEAgiiGphWL30mpbBXlqLMkW2KmpQYJDWM5xax4y5Y3AFwo8o`,
                        { cache: 'no-store' }
                    );



                    const insightsData = await insightsRes.json();
                    const insights = insightsData.data?.[0] || {};

                    // Breakdown by device, gender, age
                    const breakdownRes = await fetch(
                        `https://graph.facebook.com/v22.0/${adSet.id}/insights?fields=impressions,clicks,actions&breakdowns=age,gender,device_platform&level=adset&access_token=EAAM6AyLi6JQBO8FjMe3zrFwZB2ZCqOgVmZA6EeA1MVlLj1hrRIiGIyiAtrYYbfXPkO34EHotOQg5gRRQ8XjphRKFgk3kixespJqNrOHM3j6XsIwXiKLJ9ibdwJHAZAtOF7KL6mP2iY8T2SnADxP9l7AljqD6aheMEAgiiGphWL30mpbBXlqLMkW2KmpQYJDWM5xax4y5Y3AFwo8o`,
                        { cache: 'no-store' }
                    );
                    const breakdownData = await breakdownRes.json();
                    const breakdowns = breakdownData.data || [];

                    return {
                        ...adSet,
                        insights,
                        breakdowns,
                    };


                } catch (error) {
                    console.error(`Exception fetching insights for ad set ${adSet.id}:`, error);
                    return {
                        ...adSet,
                        insights: null
                    };
                }
            })
        );

        // Format the data for the frontend

        const formattedAdSets = adSetsWithInsights.map((adSet) => {
            const insights = adSet.insights || {};
            const actions = insights.actions || [];

            const getActionValue = (type: string) =>
                parseInt(actions.find((a: any) => a.action_type === type)?.value || '0');

            const purchases = getActionValue('offsite_conversion.purchase');
            const addToCart = getActionValue('add_to_cart');
            const spent = parseFloat(insights.spend || '0');

            const breakdownsByKey = adSet.breakdowns.map((item: any) => ({
                age: item.age,
                gender: item.gender,
                device: item.device_platform,
                impressions: parseInt(item.impressions || '0'),
                clicks: parseInt(item.clicks || '0'),
                purchases: parseInt(
                    item.actions?.find((a: any) => a.action_type === 'offsite_conversion.purchase')?.value || '0'
                ),
                addToCart: parseInt(item.actions?.find((a: any) => a.action_type === 'add_to_cart')?.value || '0'),
            }));

            const data: any = {
                id: adSet.id,
                name: adSet.name,
                status: adSet.status,
                budget: parseFloat(adSet.daily_budget || adSet.lifetime_budget || '0') / 100,
                optimizationGoal: adSet.optimization_goal,
                impressions: parseInt(insights.impressions || '0'),
                clicks: parseInt(insights.clicks || '0'),
                ctr: parseFloat(insights.ctr || '0') * 100,
                cpc: parseFloat(insights.cpc || '0'),
                spent,

                dateStart: insights.date_start || null,
                dateStop: insights.date_stop || null,

                purchases,
                costPerPurchase: purchases ? spent / purchases : 0,

                addToCart,
                costPerAddToCart: addToCart ? spent / addToCart : 0,

                landingPageViews: getActionValue('landing_page_view'),

            };


            return data;
        });


        return NextResponse.json({
            success: true,
            adSets: formattedAdSets,
        });
    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Unexpected error',
        }, { status: 500 });
    }
}