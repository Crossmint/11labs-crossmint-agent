'use client';

import { useConversation } from '@11labs/react';
import { useCallback, useState, useEffect } from 'react';

import "dotenv/config";
import { VoiceVisualization } from './VoiceVisualization';

const sendEmailTool = {
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
      const response = await fetch('/api/send', {
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
      return `Exception sending email: ${error}`;
    }
  }
};

const searchAmazonTool = {
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
    
    try {
      const response = await fetch(`/api/amazon-search?query=${encodeURIComponent(query)}`);
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
      return `Exception searching Amazon: ${error}`;
    }
  }
};

export function Conversation() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_PROVIDER_URL;
      const privateKey = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY;
      
      if (!rpcUrl) {
        setInitError('RPC URL is not defined');
        return;
      }
      
      if (!privateKey) {
        setInitError('Wallet private key is not defined');
        return;
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Solana connection:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown error initializing wallet');
    }
  }, []);

  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!isInitialized) {
        console.error('Wallet not initialized');
        return;
      }
      // Start the conversation with your agent
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID as string,
        clientTools: {
          sendEmail: sendEmailTool.execute,
          searchAmazon: searchAmazonTool.execute
        },
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation, isInitialized]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <div className="w-full">
        <VoiceVisualization 
          isSpeaking={conversation.isSpeaking} 
          status={conversation.status} 
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected' || !isInitialized}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Start Conversation
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Stop Conversation
        </button>
      </div>

      <div className="flex flex-col items-center">
        <p>Status: {conversation.status}</p>
        {conversation.status === 'connected' && (
          <p>Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
        )}
        {initError && <p className="text-red-500">Error: {initError}</p>}
        {!isInitialized && !initError && <p>Initializing wallet...</p>}
      </div>
    </div>
  );
}
