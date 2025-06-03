import { NextRequest, NextResponse } from 'next/server';

const JAX_API_BASE_URL = 'https://core.jax-delivery.com/api';
const JAX_DELIVERY_TOKEN = process.env.NEXT_PUBLIC_JAX_DELIVERY_TOKEN;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const referenceId = searchParams.get('referenceId');

        if (!referenceId) {
            return NextResponse.json(
                { error: 'Reference ID is required' },
                { status: 400 }
            );
        }

        console.log(`Checking JAX status for reference: ${referenceId}`);

        // Updated to use the correct endpoint from the documentation
        // Removed the conflicting cache options
        const response = await fetch(`${JAX_API_BASE_URL}/user/colis/getstatubyean/${referenceId}?token=${JAX_DELIVERY_TOKEN}`, {
            headers: {
                'Authorization': `Bearer ${JAX_DELIVERY_TOKEN}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        if (!response.ok) {
            console.error(`JAX API error for ${referenceId}: ${response.status} ${response.statusText}`);
            return NextResponse.json(
                { error: `JAX API error: ${response.status} ${response.statusText}`, status: 'ERROR' },
                { status: response.status }
            );
        }

        // Check content type to avoid parsing HTML as JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error(`Invalid content type from JAX API for ${referenceId}: ${contentType}`);

            // Try to get the response text for debugging
            const text = await response.text();
            console.log(`Response text (first 100 chars): ${text.substring(0, 100)}...`);

            return NextResponse.json(
                {
                    error: `Invalid response format from JAX API: ${contentType}`,
                    status: 'ERROR'
                },
                { status: 500 }
            );
        }

        const data = await response.json();
        console.log(`Successfully retrieved status for ${referenceId}: ${data.status || 'No status'}`);

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error) {
        console.error(`Error checking JAX delivery status for ${request.url}:`, error);
        return NextResponse.json(
            { error: 'Internal server error', status: 'ERROR' },
            { status: 500 }
        );
    }
}