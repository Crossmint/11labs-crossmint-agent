// Tools shared between web interface and Twilio server

// Tool for sending emails
export const sendEmailTool = {
  name: 'sendEmail',
  description: 'Send an email to a recipient with product information',
  inputSchema: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Email recipient' },
      title: { type: 'string', description: 'Title of the product' },
      img_thumbnail: { type: 'string', description: 'Image thumbnail for the product' },
      asin: { type: 'string', description: 'Amazon Standard Identification Number for the product' }
    },
    required: ['to', 'title', 'img_thumbnail', 'asin']
  },
  execute: async ({ to, title, img_thumbnail, asin }: { to: string, title: string, img_thumbnail: string, asin: string }) => {
    console.log(`Sending email to ${to} for product: ${title}`);
    
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
      
      const response = await fetch(`${baseUrl}/api/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, title, img_thumbnail, asin }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Error sending email:', result.error);
        return `Failed to send email: ${result.error}`;
      }
      
      return `Email sent successfully to ${to}`;
    } catch (error) {
      console.error('Exception sending email:', error);
      return `Exception sending email: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
};

// Tool for searching Amazon products
export const searchAmazonTool = {
  name: 'searchAmazon',
  description: 'Search for products on Amazon',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query for Amazon products' }
    },
    required: ['query']
  },
  execute: async ({ query }: { query: string }) => {
    console.log(`Searching for: ${query}`);
    
    // Change localhost port to whatever you want to use
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
      
      const response = await fetch(`${baseUrl}/api/amazon-search?query=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (!result.success) {
        console.error('Error searching Amazon:', result.error);
        return `Failed to search Amazon: ${result.error}`;
      }
      
      // Format the results for the agent
      const organicResults = result.organic_results || [];
      if (organicResults.length === 0) {
        return `No products found for "${query}"`;
      }
      
      // Return the top 5 results (or fewer if less are available)
      const topResults = organicResults.slice(0, 5).map((product: any, index: number) => {
        return {
          position: index + 1,
          title: product.title,
          price: product.price || 'Price not available',
          rating: product.rating,
          reviews: product.reviews,
          asin: product.asin,
          link: product.link,
          image: product.thumbnail
        };
      });
      
      return JSON.stringify({
        message: `Found ${organicResults.length} products for "${query}". Here are the top results:`,
        results: topResults
      });
    } catch (error) {
      console.error('Exception searching Amazon:', error);
      return `Exception searching Amazon: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}; 