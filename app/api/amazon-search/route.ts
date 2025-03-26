import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json({ 
        success: false, 
        error: 'Search query is required' 
      }, { status: 400 });
    }
    
    const formattedQuery = query.replace(/\s+/g, '+');
    
    const apiKey = process.env.SEARCHAPI_KEY;
    if (!apiKey) {
      console.error('SEARCHAPI_KEY environment variable is not set');
      return NextResponse.json({ 
        success: false, 
        error: 'API configuration error' 
      }, { status: 500 });
    }
    
    const apiUrl = `https://www.searchapi.io/api/v1/search?engine=amazon_search&q=${formattedQuery}&api_key=${apiKey}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: data.message || 'Failed to fetch Amazon search results' 
      }, { status: response.status });
    }
    
    return NextResponse.json({ 
      success: true, 
      results: data.results || [],
      organic_results: data.organic_results || [],
      search_information: data.search_information || {}
    });
  } catch (error) {
    console.error('Error in Amazon search API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during Amazon search' 
    }, { status: 500 });
  }
} 