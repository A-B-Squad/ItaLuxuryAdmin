import { NextRequest, NextResponse } from 'next/server';

const JAX_API_BASE_URL = 'https://core.jax-delivery.com/api';
const JAX_DELIVERY_TOKEN = process.env.NEXT_PUBLIC_JAX_DELIVERY_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.adresse || !body.nbrColis || !body.colis_statut || !body.colis_list || !Array.isArray(body.colis_list)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${JAX_API_BASE_URL}/client/createByean?token=${JAX_DELIVERY_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JAX_DELIVERY_TOKEN}`
      },
      body: JSON.stringify(body)
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
    console.error('Error creating pickup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}