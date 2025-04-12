import { NextRequest, NextResponse } from 'next/server';

const JAX_API_BASE_URL = 'https://core.jax-delivery.com/api';
const JAX_DELIVERY_TOKEN = process.env.NEXT_PUBLIC_JAX_DELIVERY_TOKEN;
const JAX_EXPORTER_ID = process.env.NEXT_PUBLIC_JAX_DELIVERY_ID;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields except delegation
        const requiredFields = ['nomContact', 'tel', 'adresseLivraison', 'governorat', 'description'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }
        const requestBody = {
            ...body,
            _exporter_id: JAX_EXPORTER_ID
        };

        const response = await fetch(`${JAX_API_BASE_URL}/user/colis/add?token=${JAX_DELIVERY_TOKEN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JAX_DELIVERY_TOKEN}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {

            return NextResponse.json(
                { error: `JAX API error: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating colis:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}