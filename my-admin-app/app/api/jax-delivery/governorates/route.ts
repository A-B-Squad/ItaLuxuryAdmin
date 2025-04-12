import { NextRequest, NextResponse } from 'next/server';

const JAX_API_BASE_URL = 'https://core.jax-delivery.com/api';
const JAX_DELIVERY_TOKEN = process.env.NEXT_PUBLIC_JAX_DELIVERY_TOKEN;

export async function GET() {
  try {
    const response = await fetch(`${JAX_API_BASE_URL}/gouvernorats?token=${JAX_DELIVERY_TOKEN}`, {
      headers: {
        'Authorization': `Bearer ${JAX_DELIVERY_TOKEN}`
      }
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
    console.error('Error getting governorates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}