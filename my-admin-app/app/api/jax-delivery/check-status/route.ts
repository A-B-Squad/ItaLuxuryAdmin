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

        // Updated to use the correct endpoint from the documentation
        const response = await fetch(`${JAX_API_BASE_URL}/user/colis/getstatubyean/${referenceId}?token=${JAX_DELIVERY_TOKEN}`, {
            headers: {
                'Authorization': `Bearer ${JAX_DELIVERY_TOKEN}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `JAX API error: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error) {
        console.error('Error checking JAX delivery status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}