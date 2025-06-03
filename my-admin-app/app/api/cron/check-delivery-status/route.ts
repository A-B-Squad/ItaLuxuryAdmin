import { NextResponse } from 'next/server';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { PACKAGES_QUERY } from '@/app/graph/queries';
import { PAYED_OR_TO_DELIVERY_PACKAGE_MUTATIONS } from '@/app/graph/mutations';

// Add this export to prevent static generation attempts
export const dynamic = 'force-dynamic';

// Constants to avoid magic strings
const STATUS = {
    CONFIRMED: "CONFIRMED",
    TRANSFER_TO_DELIVERY_COMPANY: "TRANSFER_TO_DELIVERY_COMPANY",
    PAYED_AND_DELIVERED: "PAYED_AND_DELIVERED"
};

const DELIVERY_STATUS = {
    RECEIVED: "Reçu à l'entrepôt",
    PREPARING_TRANSFER: "En cours de préparation au transfert vers une autre agence",
    IN_THE_PROCESS_OF_DELIVERY: "En cours de livraison",
    DELIVERED: "Livré"
};



// Add a secret key validation for security
const validateSecret = (request: Request) => {
    try {
        const url = new URL(request.url);
        const secret = url.searchParams.get('secret');
        const expectedSecret = process.env.CRON_SECRET;

        console.log(`[CRON] Secret validation - Provided: ${secret ? '******' : 'none'}, Expected exists: ${!!expectedSecret}`);

        // Allow access if the secret matches OR if we're in development and no secret is set
        if (secret === expectedSecret) {
            return true;
        } else if (!expectedSecret && process.env.NODE_ENV === 'development') {
            console.log('[CRON] Warning: No CRON_SECRET set, allowing access in development mode');
            return true;
        }

        return false;
    } catch (error) {
        console.error('[CRON] Error validating secret:', error);
        return false;
    }
};

export async function GET(request: Request) {
    // Validate the request has the correct secret
    if (!validateSecret(request)) {
        console.log('[CRON] Authorization failed - invalid or missing secret');
        return NextResponse.json({
            success: false,
            error: "Unauthorized - Please provide a valid secret key"
        }, { status: 401 });
    }

    try {
        console.log("[CRON] Starting automated delivery status check");

        // Create a fresh Apollo Client instance with a unique cache identifier
        const client = new ApolloClient({
            uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
            cache: new InMemoryCache(),
            defaultOptions: {
                query: {
                    fetchPolicy: 'no-cache',
                    errorPolicy: 'all',
                },
                mutate: {
                    fetchPolicy: 'no-cache',
                    errorPolicy: 'all',
                },
                watchQuery: {
                    fetchPolicy: 'no-cache',
                    errorPolicy: 'all',
                },
            },
            // Add a random query string parameter to prevent caching at the HTTP level
            name: `cron-client-${Date.now()}`,
        });

        // Get packages that need status checking without the _timestamp variable
        const { data } = await client.query({
            query: PACKAGES_QUERY,
            variables: {
                statusFilter: [STATUS.CONFIRMED, STATUS.TRANSFER_TO_DELIVERY_COMPANY]
            },
            fetchPolicy: 'no-cache',
            context: {
                // Add headers to prevent HTTP caching
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }
        });

        if (!data?.getAllPackages?.packages) {
            return NextResponse.json({
                success: true,
                message: "No packages to check"
            });
        }

        const relevantOrders = data.getAllPackages.packages.filter(
            (order: any) => order.deliveryReference
        );

        console.log(`[CRON] Found ${relevantOrders.length} orders to check`);

        // Process each order
        const results = await Promise.all(
            relevantOrders.map(async (order: any) => {
                const { id, deliveryReference, customId, Checkout, status: orderStatus } = order;

                // Check delivery status with agency
                try {
                    // Use the same API endpoint format as the check-status function
                    console.log(`[CRON] Checking status for ${customId} with reference ${deliveryReference}`);

                    const JAX_API_BASE_URL = 'https://core.jax-delivery.com/api';
                    const JAX_DELIVERY_TOKEN = process.env.NEXT_PUBLIC_JAX_DELIVERY_TOKEN;

                    // Direct API call to JAX delivery service using the same endpoint as check-status
                    const jaxResponse = await fetch(`${JAX_API_BASE_URL}/user/colis/getstatubyean/${deliveryReference}?token=${JAX_DELIVERY_TOKEN}`, {
                        headers: {
                            'Authorization': `Bearer ${JAX_DELIVERY_TOKEN}`,
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        },
                        cache: 'no-store'
                    });

                    if (!jaxResponse.ok) {
                        console.error(`[CRON] Error checking JAX status for ${customId}: ${jaxResponse.status}`);
                        return { id: customId, success: false, error: `JAX API error: ${jaxResponse.status}` };
                    }

                    const jaxResult = await jaxResponse.json();
                    console.log(`[CRON] JAX response for ${customId}:`, jaxResult);

                    // Extract status from JAX response
                    const currentStatus = jaxResult;

                    if (!currentStatus) {
                        return { id: customId, success: false, error: "No status returned from JAX" };
                    }

                    // Determine if status update is needed
                    let newStatus = null;
                    console.log("[CRON] Current status:", orderStatus);
                    if ((currentStatus === DELIVERY_STATUS.RECEIVED ||
                        currentStatus === DELIVERY_STATUS.PREPARING_TRANSFER || currentStatus === DELIVERY_STATUS.IN_THE_PROCESS_OF_DELIVERY) &&
                        orderStatus === STATUS.CONFIRMED) {

                        newStatus = STATUS.TRANSFER_TO_DELIVERY_COMPANY;
                    } else if (currentStatus === DELIVERY_STATUS.DELIVERED &&
                        orderStatus === STATUS.TRANSFER_TO_DELIVERY_COMPANY) {
                        newStatus = STATUS.PAYED_AND_DELIVERED;
                    }

                    // Update package status if needed
                    if (newStatus) {
                        try {
                            await client.mutate({
                                mutation: PAYED_OR_TO_DELIVERY_PACKAGE_MUTATIONS,
                                variables: {
                                    packageId: id,
                                    paymentMethod: Checkout?.paymentMethod,
                                    status: newStatus,

                                }
                            });

                            return {
                                id: customId,
                                success: true,
                                oldStatus: orderStatus,
                                newStatus,
                                deliveryStatus: currentStatus
                            };
                        } catch (err: any) {
                            console.error(`[CRON] Error updating status for ${customId}:`, err);
                            return {
                                id: customId,
                                success: false,
                                error: err.message || "Mutation error"
                            };
                        }
                    }

                    return {
                        id: customId,
                        success: true,
                        message: "No update needed",
                        status: orderStatus,
                        deliveryStatus: currentStatus
                    };
                } catch (error: any) {
                    console.error(`[CRON] Error processing ${customId}:`, error);
                    return {
                        id: customId,
                        success: false,
                        error: error.message || "Unknown error"
                    };
                }
            })
        );

        const updatedCount = results.filter(r => r.success && r.newStatus).length;

        return NextResponse.json({
            success: true,
            message: `Checked ${results.length} orders, updated ${updatedCount}`,
            results
        });
    } catch (error: any) {
        console.error("[CRON] Error in check-delivery-status route:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Unknown error"
        }, { status: 500 });
    }
}