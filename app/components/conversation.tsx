'use client';

import { useConversation } from '@11labs/react';
import { useCallback, useState, useEffect } from 'react';

import "dotenv/config";
import { VoiceVisualization } from './VoiceVisualization';
import { sendEmailTool, searchAmazonTool } from './tools';

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
