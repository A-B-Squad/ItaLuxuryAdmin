import { NextRequest, NextResponse } from 'next/server';

const JAX_API_BASE_URL = 'https://core.jax-delivery.com/api';
const JAX_DELIVERY_TOKEN = process.env.NEXT_PUBLIC_JAX_DELIVERY_TOKEN;
const JAX_DELIVERY_ID = process.env.NEXT_PUBLIC_JAX_DELIVERY_ID;

export async function GET(request: NextRequest) {
  try {
    // Get the endpoint from the query parameter
    const endpoint = request.nextUrl.searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      );
    }
    
    // Construct the full URL
    const url = `${JAX_API_BASE_URL}/${endpoint}?token=${JAX_DELIVERY_TOKEN}`;
    
    const response = await fetch(url, {
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
    console.error('Error in JAX Delivery API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the endpoint from the query parameter
    const endpoint = request.nextUrl.searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    
    // Construct the full URL
    const url = `${JAX_API_BASE_URL}/${endpoint}?token=${JAX_DELIVERY_TOKEN}`;
    
    const response = await fetch(url, {
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
    console.error('Error in JAX Delivery API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}